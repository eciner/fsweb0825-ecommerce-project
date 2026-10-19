export function normalizePhone(dialCode, localNumber) {
  const raw = String(localNumber || "").trim();
  if (raw.startsWith("+")) return `+${raw.replace(/\D/g, "")}`;
  const prefix = String(dialCode || "").replace(/\D/g, "");
  let digits = raw.replace(/\D/g, "");
  if (["90", "44", "49", "33"].includes(prefix))
    digits = digits.replace(/^0/, "");
  return `+${prefix}${digits}`;
}

export function addressPayload(values, id) {
  const phone = normalizePhone(
    values.dialCode === "other" ? values.customDialCode : values.dialCode,
    values.phone,
  );
  if (!/^\+[1-9]\d{6,14}$/.test(phone))
    throw new Error("Enter a valid international phone number (7–15 digits).");
  const payload = Object.fromEntries(
    ["title", "name", "surname", "city", "district", "neighborhood"].map(
      (key) => [key, String(values[key] || "").trim()],
    ),
  );
  payload.phone = phone;
  if (values.neighborhoodName?.trim())
    payload.neighborhood = `${values.neighborhoodName.trim()}\n${payload.neighborhood}`;
  if (payload.neighborhood.length > 500)
    throw new Error(
      "Neighborhood and address details must fit within 500 characters.",
    );
  return { ...payload, ...(id ? { id } : {}) };
}
