export function isCardExpired(month, year, now = new Date()) {
  const expiryMonth = Number(month);
  const expiryYear = Number(year);

  if (
    !Number.isInteger(expiryMonth) ||
    !Number.isInteger(expiryYear) ||
    expiryMonth < 1 ||
    expiryMonth > 12
  ) {
    return true;
  }

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return (
    expiryYear < currentYear ||
    (expiryYear === currentYear && expiryMonth < currentMonth)
  );
}
