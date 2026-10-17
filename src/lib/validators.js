const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function luhnValid(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateShipping(v) {
  const e = {};
  if (v.fullName.trim().length < 3) e.fullName = 'Enter your full name';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email';
  const phone = v.phone.replace(/[\s()+-]/g, '');
  if (!/^\d{8,15}$/.test(phone)) e.phone = 'Enter a valid phone number';
  if (v.address.trim().length < 5) e.address = 'Enter your street address';
  if (v.city.trim().length < 2) e.city = 'Enter your city';
  if (!/^[A-Za-z0-9 -]{4,10}$/.test(v.zip.trim())) e.zip = 'Enter a valid postal code';
  return e;
}

export function validatePayment(v, now = new Date()) {
  if (v.method === 'cod') return {};
  const e = {};
  if (v.cardName.trim().length < 3) e.cardName = 'Enter the name on the card';

  const digits = v.cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits) || !luhnValid(digits)) e.cardNumber = 'Enter a valid 16-digit card number';

  const m = /^(\d{2})\/(\d{2})$/.exec(v.expiry);
  if (!m) {
    e.expiry = 'Use MM/YY';
  } else {
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    if (month < 1 || month > 12) e.expiry = 'Invalid month';
    else if (endOfMonth < now) e.expiry = 'This card has expired';
  }

  if (!/^\d{3,4}$/.test(v.cvc)) e.cvc = '3 or 4 digits';
  return e;
}

export const formatCardNumber = (s) =>
  s
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export function formatExpiry(s) {
  const d = s.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
