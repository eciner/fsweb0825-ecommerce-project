export function getCartLineTotal(item) {
  const price = Number(item?.product?.price);
  const count = Number(item?.count);
  return Number.isFinite(price) && Number.isFinite(count) && count > 0
    ? price * count
    : 0;
}

export function calculateCartTotals(cart = [], shipping = 0, discount = 0) {
  const productsTotal = cart
    .filter((item) => item?.checked)
    .reduce((total, item) => total + getCartLineTotal(item), 0);
  const safeShipping = Number.isFinite(Number(shipping)) ? Number(shipping) : 0;
  const safeDiscount = Number.isFinite(Number(discount)) ? Number(discount) : 0;
  const grandTotal = productsTotal + safeShipping - safeDiscount;

  return {
    productsTotal,
    shipping: safeShipping,
    discount: safeDiscount,
    grandTotal: Number.isFinite(grandTotal) ? grandTotal : 0,
  };
}

export function buildOrderPayload({
  addressId,
  receiptAddressId,
  cart,
  price,
  orderDate,
}) {
  const selectedItems = (cart || []).filter((item) => item?.checked);

  return {
    address_id: addressId,
    ...(receiptAddressId ? { receipt_address_id: receiptAddressId } : {}),
    order_date: orderDate || new Date().toISOString(),
    price,
    products: selectedItems.map((item) => ({
      product_id: item.product.id,
      count: item.count,
      detail: "",
    })),
  };
}
