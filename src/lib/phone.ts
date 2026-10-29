export function nationalDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('00998')) digits = digits.slice(5);
  else if (digits.startsWith('998') && (digits.length >= 12 || value.trimStart().startsWith('+998'))) digits = digits.slice(3);
  return digits.slice(0, 9);
}

export function formatNationalPhone(value: string): string {
  const digits = nationalDigits(value);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ');
}

export function formatUzPhone(value: string): string {
  return `+998 ${formatNationalPhone(value)}`;
}

export function phoneCaret(formatted: string, digitsBefore: number): number {
  if (digitsBefore <= 0) return 0;
  let count = 0;
  for (let index = 0; index < formatted.length; index++) {
    if (/\d/.test(formatted[index])) count++;
    if (count === digitsBefore) return index + 1;
  }
  return formatted.length;
}
