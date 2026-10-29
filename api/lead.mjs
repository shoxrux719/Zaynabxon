import { handleLead } from '../server/lead-api.mjs';

export default async function handler(req, res) {
  try {
    await handleLead(req, res);
  } catch {
    if (res.headersSent) { res.end(); return; }
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: false, code: 'request_failed' }));
  }
}
