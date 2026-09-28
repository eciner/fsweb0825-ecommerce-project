export function isCheckoutReady({
  shippingAddress,
  receiptAddress,
  card,
  ccv,
  cart = [],
  submitting = false,
}) {
  return Boolean(
    shippingAddress?.id &&
      receiptAddress?.id &&
      card?.id &&
      /^\d{3,4}$/.test(ccv) &&
      cart.some((item) => item?.checked) &&
      !submitting,
  );
}
