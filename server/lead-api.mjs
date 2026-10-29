import { readFileSync } from 'node:fs';
import { isIP } from 'node:net';
import { fileURLToPath } from 'node:url';
import { fetchTelegram } from './telegram-fetch.mjs';

// Telegram requests must always verify the remote certificate.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
const MAX_BODY_BYTES = 8192;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_RATE_CLIENTS = 1024;

function telegramConfig() {
  const local = {};
  try {
    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*(TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID)\s*=\s*(.*?)\s*$/);
      if (match) local[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return {
    token: (process.env.TELEGRAM_BOT_TOKEN || local.TELEGRAM_BOT_TOKEN)?.trim(),
    chatId: (process.env.TELEGRAM_CHAT_ID || local.TELEGRAM_CHAT_ID)?.trim(),
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  // Vercel can provide a parsed body after consuming the request stream.
  if ('body' in req) {
    try {
      const value = req.body;
      if (value !== undefined) {
        const raw = Buffer.isBuffer(value) ? value : typeof value === 'string' ? value : JSON.stringify(value);
        if (typeof raw !== 'string' && !Buffer.isBuffer(raw)) return { error: 'invalid_json' };
        if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) return { error: 'too_large' };
        return { value: typeof value === 'string' || Buffer.isBuffer(value) ? JSON.parse(raw.toString()) : value };
      }
    } catch {
      return { error: 'invalid_json' };
    }
  }
  const chunks = [];
  let length = 0;
  let tooLarge = false;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += buffer.length;
    if (length > MAX_BODY_BYTES) tooLarge = true;
    if (!tooLarge) chunks.push(buffer);
  }
  if (tooLarge) return { error: 'too_large' };
  try {
    return { value: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
  } catch {
    return { error: 'invalid_json' };
  }
}

function cleanName(value, optional = false) {
  if (optional && value === undefined) return '';
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (optional && !name) return '';
  if (name.length < 1 || name.length > 80 || !/^[\p{L}\p{M}][\p{L}\p{M}\s'‘’ʻ.-]*$/u.test(name)) return null;
  return name;
}

function cleanPhone(value) {
  if (typeof value !== 'string') return null;
  const phone = value.trim();
  if (!/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(phone)) return null;
  return phone;
}

function cleanBrief(value) {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.length > 1200 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) return null;
  return value.replace(/\r\n?/g, '\n').trim();
}

function clientAddress(req) {
  // Only Vercel may supply a security-sensitive forwarded address.
  if (process.env.VERCEL === '1') {
    const header = req.headers['x-vercel-forwarded-for'] ?? req.headers['x-forwarded-for'];
    if (typeof header === 'string' && isIP(header.trim())) return header.trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function createLeadHandler({ getConfig = telegramConfig, fetchImpl = fetchTelegram, now = Date.now } = {}) {
  const attempts = new Map();

  function configuration() {
    try {
      const config = getConfig();
      const token = typeof config?.token === 'string' ? config.token.trim() : '';
      const chatId = typeof config?.chatId === 'string' ? config.chatId.trim() : '';
      return { token, chatId };
    } catch {
      console.error('lead_configuration_failed');
      return {};
    }
  }

  function retryAfter(address) {
    const time = now();
    const cutoff = time - RATE_WINDOW_MS;
    for (const [key, times] of attempts) {
      const recent = times.filter(attempt => attempt > cutoff);
      if (recent.length) attempts.set(key, recent);
      else attempts.delete(key);
    }
    const recent = attempts.get(address);
    if (recent?.length >= MAX_ATTEMPTS) {
      return Math.max(1, Math.ceil((recent[0] + RATE_WINDOW_MS - time) / 1000));
    }
    if (!recent && attempts.size >= MAX_RATE_CLIENTS) {
      // Never evict a live bucket: IP churn must not reset existing limits.
      let nextExpiry = Infinity;
      for (const times of attempts.values()) nextExpiry = Math.min(nextExpiry, times.at(-1) + RATE_WINDOW_MS);
      return Math.max(1, Math.ceil((nextExpiry - time) / 1000));
    }
    attempts.set(address, [...(recent || []), time]);
    return 0;
  }

  async function telegramRequest(token, payload) {
    const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('invalid_upstream_response');
    return { response, result };
  }

  async function processLead(req, res) {
    if (req.method === 'GET') {
      const { token, chatId } = configuration();
      // Readiness reports configuration only and makes no Telegram calls.
      sendJson(res, token && chatId ? 200 : 503, token && chatId ? { ok: true } : { ok: false, code: 'not_configured' });
      return;
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      sendJson(res, 405, { ok: false, code: 'method_not_allowed' });
      return;
    }
    const contentType = String(req.headers['content-type'] || '').split(';', 1)[0].trim().toLowerCase();
    if (contentType !== 'application/json') {
      sendJson(res, 415, { ok: false, code: 'unsupported_media_type' });
      return;
    }

    const wait = retryAfter(clientAddress(req));
    if (wait) {
      res.setHeader('Retry-After', String(wait));
      sendJson(res, 429, { ok: false, code: 'rate_limited' });
      return;
    }

    let parsed;
    try {
      parsed = await readJson(req);
    } catch {
      sendJson(res, 400, { ok: false, code: 'invalid_request' });
      return;
    }
    if (parsed.error) {
      sendJson(res, parsed.error === 'too_large' ? 413 : 400, { ok: false, code: parsed.error });
      return;
    }
    const body = parsed.value;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      sendJson(res, 400, { ok: false, code: 'invalid_request' });
      return;
    }
    if (body.website) {
      sendJson(res, 200, { ok: true });
      return;
    }
    const firstName = cleanName(body.firstName);
    const lastName = cleanName(body.lastName, true);
    const phone = cleanPhone(body.phone);
    const brief = cleanBrief(body.brief);
    if (!firstName || lastName === null || !phone || brief === null) {
      sendJson(res, 400, { ok: false, code: 'invalid_fields' });
      return;
    }

    const { token, chatId } = configuration();
    if (!token || !chatId) {
      sendJson(res, 503, { ok: false, code: 'not_configured' });
      return;
    }

    const lines = ['📩 Новая заявка — Зайнабхон Хусанова', '', `Имя: ${firstName}`];
    if (lastName) lines.push(`Фамилия: ${lastName}`);
    lines.push(`Телефон: ${phone}`);
    if (brief) lines.push('', `О проекте: ${brief}`);
    const message = lines.join('\n');
    try {
      let { response: telegram, result } = await telegramRequest(token, { chat_id: chatId, text: message });
      const migratedId = result.parameters?.migrate_to_chat_id;
      // A rejected old group destination is the only safe automatic retry.
      if (!telegram.ok && result.ok === false && result.error_code === 400 && Number.isSafeInteger(migratedId) && migratedId < 0) {
        const migrated = await telegramRequest(token, { chat_id: String(migratedId), text: message });
        telegram = migrated.response;
        result = migrated.result;
      }
      const forbidden = result.error_code === 403 || (
        result.error_code === 400 && /not enough rights|chat_write_forbidden|have no rights/iu.test(result.description || '')
      );
      if (result.ok !== true && forbidden) {
        sendJson(res, 503, { ok: false, code: 'delivery_forbidden' });
        return;
      }
      if (!telegram.ok || result.ok !== true) throw new Error('telegram_rejected');
      sendJson(res, 200, { ok: true });
    } catch {
      // Upstream errors may contain token-bearing URLs or personal data.
      console.error('lead_delivery_failed');
      sendJson(res, 502, { ok: false, code: 'delivery_failed' });
    }
  }

  return async function handleLead(req, res) {
    try {
      await processLead(req, res);
    } catch {
      console.error('lead_request_failed');
      if (!res.headersSent) sendJson(res, 500, { ok: false, code: 'request_failed' });
      else if (!res.writableEnded) res.end();
    }
  };
}

export const handleLead = createLeadHandler();
