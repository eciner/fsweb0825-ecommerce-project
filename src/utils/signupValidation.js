export function trimText(value) {
  return String(value || "").trim();
}

export function normalizeTurkishPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("90") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("5") && digits.length === 10) {
    return `0${digits}`;
  }

  return digits;
}

export function isValidTurkishMobilePhone(value) {
  return /^05\d{9}$/.test(normalizeTurkishPhone(value));
}

export function normalizeTaxNumber(value) {
  return trimText(value).toUpperCase();
}

export function isValidStoreTaxNumber(value) {
  return /^T\d{4}V\d{6}$/.test(normalizeTaxNumber(value));
}

export function normalizeIban(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

function ibanMod97(value) {
  let remainder = 0;

  for (const char of value) {
    const code = char.charCodeAt(0);
    const replacement =
      code >= 65 && code <= 90 ? String(code - 55) : char;

    for (const digit of replacement) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder;
}

export function isValidTurkishIban(value) {
  const iban = normalizeIban(value);

  if (!/^TR\d{24}$/.test(iban)) {
    return false;
  }

  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  return ibanMod97(rearranged) === 1;
}
