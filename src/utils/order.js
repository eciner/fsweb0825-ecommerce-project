export function formatOrderPrice(value, currency) {
  if (value === null || value === undefined) return "Amount unavailable";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Amount unavailable";
  return currency
    ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        amount,
      )
    : `${amount.toFixed(2)} (currency not recorded)`;
}
