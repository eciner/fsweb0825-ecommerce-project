export function isCardExpired(month, year, now = new Date()) {
  const expiryMonth = Number(month);
  const expiryYear = Number(year);

  if (!Number.isInteger(expiryMonth) || !Number.isInteger(expiryYear)) {
    return true;
  }

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return (
    expiryYear < currentYear ||
    (expiryYear === currentYear && expiryMonth < currentMonth)
  );
}