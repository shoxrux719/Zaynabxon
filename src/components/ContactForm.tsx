import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { ArrowUpRight, Check, LoaderCircle, Send } from 'lucide-react';
import { interaction } from '../data/interaction';
import type { Lang } from '../data/interaction';
import { profile } from '../data/profile';
import { submitLead, validateContact } from '../lib/contact';
import type { ContactErrors, LeadFailure } from '../lib/contact';
import { formatNationalPhone, formatUzPhone, phoneCaret } from '../lib/phone';

export function ContactForm({ lang }: { lang: Lang }) {
  const c = interaction[lang];
  const [phone, setPhone] = useState('');
  const [invalid, setInvalid] = useState<(keyof ContactErrors)[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [failure, setFailure] = useState<LeadFailure>('delivery_failed');
  const locked = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const sending = status === 'sending';

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      statusRef.current?.focus({ preventScroll: true });
      statusRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [status]);

  const updatePhone = (input: HTMLInputElement, raw: string, caret: number) => {
    const formatted = formatNationalPhone(raw);
    const digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length;
    setPhone(formatted);
    requestAnimationFrame(() => input.setSelectionRange(phoneCaret(formatted, digitsBefore), phoneCaret(formatted, digitsBefore)));
  };

  const changePhone = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    updatePhone(input, input.value, input.selectionStart ?? input.value.length);
  };

  const editPhone = (event: KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const caret = input.selectionStart ?? 0;
    if (caret !== input.selectionEnd) return;
    const removeAt = event.key === 'Backspace' && phone[caret - 1] === ' ' ? caret - 2 : event.key === 'Delete' && phone[caret] === ' ' ? caret + 1 : -1;
    if (removeAt < 0) return;
    event.preventDefault();
    const raw = phone.slice(0, removeAt) + phone.slice(removeAt + 1);
    updatePhone(input, raw, event.key === 'Backspace' ? removeAt : caret);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked.current || status === 'success') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get('website')) return;
    const details = {
      firstName: String(data.get('firstName') ?? '').trim(),
      lastName: String(data.get('lastName') ?? '').trim(),
      phone: formatUzPhone(phone),
      brief: String(data.get('brief') ?? '').trim(),
      website: '',
    };
    const errors = validateContact(details);
    setInvalid(errors);
    if (errors.length) {
      (form.elements.namedItem(errors[0]) as HTMLInputElement)?.focus();
      return;
    }
    locked.current = true;
    setStatus('sending');
    const result = await submitLead(details);
    locked.current = false;
    if (result.ok) setStatus('success');
    else { setFailure(result.code); setStatus('error'); }
  };

  const errors: ContactErrors = {
    firstName: invalid.includes('firstName') ? c.nameError : undefined,
    lastName: invalid.includes('lastName') ? c.lastNameError : undefined,
    phone: invalid.includes('phone') ? c.phoneError : undefined,
  };
  const failureText = failure === 'not_configured' || failure === 'delivery_forbidden' ? c.notConfigured : failure === 'rate_limited' ? c.rateError : failure === 'invalid_fields' ? c.invalidError : c.deliveryError;

  return <form id="contact-form" className="lead-form" onSubmit={submit} noValidate aria-describedby="lead-form-note" onInput={event => {
    if (locked.current) return;
    setStatus('idle');
    const name = (event.target as HTMLInputElement).name;
    setInvalid(current => current.filter(field => field !== name));
  }}>
    <div className="lead-form-heading"><span className="eyebrow">LET’S START / 01</span><h4>{c.formTitle}</h4></div>
    <fieldset disabled={sending} aria-busy={sending}>
      <div className="lead-form-fields">
        <label><span>{c.firstName}</span><input name="firstName" autoComplete="given-name" maxLength={80} required aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'name-error' : undefined} />{errors.firstName && <small id="name-error" className="field-error">{errors.firstName}</small>}</label>
        <label><span>{c.lastName} <small>({c.optional})</small></span><input name="lastName" autoComplete="family-name" maxLength={80} aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'surname-error' : undefined} />{errors.lastName && <small id="surname-error" className="field-error">{errors.lastName}</small>}</label>
        <label className="field-wide"><span>{c.phone}</span><div className={`phone-field${errors.phone ? ' is-invalid' : ''}`}><span aria-hidden="true">+998</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="90 123 45 67" value={phone} onChange={changePhone} onKeyDown={editPhone} onPaste={event => {
          const pasted = event.clipboardData.getData('text');
          if (pasted.replace(/\D/g, '').length >= 9) {
            event.preventDefault();
            const value = formatNationalPhone(pasted);
            setPhone(value);
            const input = event.currentTarget;
            requestAnimationFrame(() => input.setSelectionRange(value.length, value.length));
            setInvalid(current => current.filter(field => field !== 'phone'));
            if (!locked.current) setStatus('idle');
          }
        }} required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'} /></div><small className={errors.phone ? 'field-error' : 'field-hint'} id={errors.phone ? 'phone-error' : 'phone-hint'}>{errors.phone || c.phoneHint}</small></label>
        <label className="field-wide"><span>{c.brief} <small>({c.optional})</small></span><textarea name="brief" rows={4} maxLength={1200} placeholder={c.briefPlaceholder} /></label>
      </div>
      <div className="lead-honey" aria-hidden="true"><label>Website<input name="website" autoComplete="off" tabIndex={-1} /></label></div>
      <div className="lead-form-footer"><button type="submit" className="button-primary" disabled={sending || status === 'success'}>{sending ? <>{c.sending}<LoaderCircle className="submit-spinner" size={17} /></> : status === 'success' ? <>{c.sent}<Check size={18} /></> : <>{c.submit}<Send size={17} /></>}</button><p id="lead-form-note">{c.formNote}</p></div>
    </fieldset>
    <div className={`lead-status${status === 'error' ? ' is-error' : ''}`} ref={statusRef} role="status" aria-live="polite" tabIndex={-1}>{status === 'success' && <p>{c.success}</p>}{status === 'error' && <><p>{failureText}</p><a className="text-link" href={profile.telegram} target="_blank" rel="noreferrer">{c.direct}<ArrowUpRight size={16} /></a></>}</div>
  </form>;
}
