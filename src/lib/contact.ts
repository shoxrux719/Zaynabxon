export type ContactDetails = { firstName: string; lastName: string; phone: string; brief: string };
export type LeadPayload = ContactDetails & { website: string };
export type ContactErrors = Partial<Record<'firstName' | 'lastName' | 'phone', string>>;
export type LeadFailure = 'invalid_fields' | 'rate_limited' | 'not_configured' | 'delivery_forbidden' | 'delivery_failed' | 'network_error';
export type LeadResult = { ok: true } | { ok: false; code: LeadFailure };

export function validateContact(details: ContactDetails): ('firstName' | 'lastName' | 'phone')[] {
  const errors: ('firstName' | 'lastName' | 'phone')[] = [];
  const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s'‘’ʻ.-]*$/u;
  if (!namePattern.test(details.firstName.trim()) || details.firstName.trim().length > 80) errors.push('firstName');
  if (details.lastName.trim() && (!namePattern.test(details.lastName.trim()) || details.lastName.trim().length > 80)) errors.push('lastName');
  if (!/^[+]998 \d{2} \d{3} \d{2} \d{2}$/.test(details.phone)) errors.push('phone');
  return errors;
}

export async function submitLead(details: LeadPayload, request: typeof fetch = fetch): Promise<LeadResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await request('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(details),
      signal: controller.signal,
    });
    const body: unknown = await response.json();
    const result = body && typeof body === 'object' ? body as { ok?: unknown; code?: unknown } : null;
    if (response.ok && result?.ok === true) return { ok: true };
    if (response.status === 400 && result?.code === 'invalid_fields') return { ok: false, code: 'invalid_fields' };
    if (response.status === 429) return { ok: false, code: 'rate_limited' };
    if (response.status === 503 && (result?.code === 'not_configured' || result?.code === 'delivery_forbidden')) {
      return { ok: false, code: result.code };
    }
    return { ok: false, code: 'delivery_failed' };
  } catch {
    return { ok: false, code: 'network_error' };
  } finally {
    clearTimeout(timeout);
  }
}
