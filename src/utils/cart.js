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

export function buildOrderPayload({ addressId, card, ccv, cart, price, orderDate }) {
  const selectedItems = (cart || []).filter((item) => item?.checked);

  return {
    address_id: addressId,
    order_date: orderDate || new Date().toISOString(),
    card_no: card?.card_no || "",
    card_name: card?.name_on_card || "",
    card_expire_month: card?.expire_month,
    card_expire_year: card?.expire_year,
    card_ccv: ccv,
    price,
    products: selectedItems.map((item) => ({
      product_id: item.product.id,
      count: item.count,
      detail: "",
    })),
  };
}