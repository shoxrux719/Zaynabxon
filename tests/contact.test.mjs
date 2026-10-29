import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { formatNationalPhone, formatUzPhone, nationalDigits, phoneCaret } from '../src/lib/phone.ts';
import { submitLead, validateContact } from '../src/lib/contact.ts';
import { createLeadHandler } from '../server/lead-api.mjs';

test('Uzbek phone accepts local, international and formatted paste', () => {
  for (const value of ['901234567', '+998 (90) 123-45-67', '998901234567', '00998901234567']) {
    assert.equal(formatNationalPhone(value), '90 123 45 67');
    assert.equal(formatUzPhone(value), '+998 90 123 45 67');
  }
});

test('phone never accepts a tenth national digit and keeps a local number beginning 998', () => {
  assert.equal(formatNationalPhone('90 123 45 679999999999'), '90 123 45 67');
  assert.equal(nationalDigits('998123456'), '998123456');
  assert.equal(formatNationalPhone(''), '');
  assert.equal(formatNationalPhone('+998'), '');
  assert.equal(formatNationalPhone('abc90!123-45-67'), '90 123 45 67');
});

test('caret follows digits across formatted separators', () => {
  assert.equal(phoneCaret('90 123 45 67', 2), 2);
  assert.equal(phoneCaret('90 123 45 67', 5), 6);
  assert.equal(phoneCaret('90 123 45 67', 9), 12);
});

const lead = { firstName: 'O‘ktam', lastName: '', phone: '+998 90 123 45 67', brief: 'Контент & SMM\nIkkinchi qator', website: '' };

test('validation requires a real name and complete phone, with surname optional', () => {
  assert.deepEqual(validateContact(lead), []);
  assert.deepEqual(validateContact({ ...lead, firstName: '123', phone: '+998 90' }), ['firstName', 'phone']);
  assert.deepEqual(validateContact({ ...lead, lastName: '<test>' }), ['lastName']);
});

test('client success requires explicit acknowledgement and preserves Unicode', async () => {
  let payload;
  assert.deepEqual(await submitLead(lead, async (url, options) => {
    assert.equal(url, '/api/lead'); payload = JSON.parse(options.body);
    return Response.json({ ok: true });
  }), { ok: true });
  assert.deepEqual(payload, lead);
  assert.deepEqual(await submitLead(lead, async () => Response.json({ ok: false })), { ok: false, code: 'delivery_failed' });
  assert.deepEqual(await submitLead(lead, async () => Response.json({ ok: false, code: 'not_configured' }, { status: 503 })), { ok: false, code: 'not_configured' });
});

async function withApi(options, run) {
  const handler = createLeadHandler(options);
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/api/lead`;
    await run((body = lead) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
  } finally { await new Promise(resolve => server.close(resolve)); }
}

test('server sends a labelled Zaynabxon lead to its configured group', async () => {
  let message;
  await withApi({ getConfig: () => ({ token: 'unit-test-only', chatId: '-123' }), fetchImpl: async (_url, options) => {
    message = JSON.parse(options.body);
    return { ok: true, json: async () => ({ ok: true }) };
  } }, async post => {
    const response = await post();
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
  assert.equal(message.chat_id, '-123');
  assert.match(message.text, /Зайнабхон Хусанова/);
  assert.match(message.text, /O‘ktam/);
  assert.match(message.text, /Контент & SMM\nIkkinchi qator/);
  assert.equal(message.parse_mode, undefined);
});

test('invalid fields and missing configuration never trigger Telegram delivery', async () => {
  let calls = 0;
  await withApi({ getConfig: () => ({}), fetchImpl: async () => { calls++; throw new Error('must not run'); } }, async post => {
    assert.equal((await post({ ...lead, phone: '+998 90' })).status, 400);
    const response = await post();
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, code: 'not_configured' });
  });
  assert.equal(calls, 0);
});

test('upstream rejection is not presented as successful delivery', async () => {
  await withApi({ getConfig: () => ({ token: 'unit-test-only', chatId: '-123' }), fetchImpl: async () => ({ ok: false, json: async () => ({ ok: false, error_code: 403 }) }) }, async post => {
    const response = await post();
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, code: 'delivery_forbidden' });
  });
});

test('repeated requests are rate limited without sending the sixth message', async () => {
  let calls = 0;
  await withApi({ getConfig: () => ({ token: 'unit-test-only', chatId: '-123' }), fetchImpl: async () => { calls++; return { ok: true, json: async () => ({ ok: true }) }; } }, async post => {
    for (let i = 0; i < 5; i++) assert.equal((await post()).status, 200);
    assert.equal((await post()).status, 429);
  });
  assert.equal(calls, 5);
});
