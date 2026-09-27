const REDACTED = "[REDACTED]";
const CARD_FIELDS = new Set([
  "cardno",
  "cardnumber",
  "pan",
  "cardccv",
  "ccv",
  "cvv",
  "cvc",
  "authorization",
]);

function isSensitiveField(key) {
  const normalized = key.replace(/[_\s-]/g, "").toLowerCase();
  return CARD_FIELDS.has(normalized) || /password|token|secret|^jwt$/.test(normalized);
}

export function redactForLogger(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);

  if (Array.isArray(value)) {
    const copy = [];
    seen.set(value, copy);
    value.forEach((item, index) => {
      copy[index] = redactForLogger(item, seen);
    });
    return copy;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;

  const copy = Object.create(prototype);
  seen.set(value, copy);
  for (const [key, entry] of Object.entries(value)) {
    copy[key] = isSensitiveField(key) ? REDACTED : redactForLogger(entry, seen);
  }
  return copy;
}
