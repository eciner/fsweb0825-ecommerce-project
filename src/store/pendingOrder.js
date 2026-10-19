import { accountKey } from "./checkoutState";
const KEY = "fsweb0825.pending-order";
// Tab-scoped, account-separated recovery. No payment data, tokens or browser cart.
function entries() {
  const value = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
  if (
    value?.version === 2 &&
    value.entries &&
    typeof value.entries === "object"
  )
    return value.entries;
  return value?.account && value.payload ? { [value.account]: value } : {};
}
export function orderPayload(p) {
  return {
    request_id: p.request_id,
    address_id: p.address_id,
    ...(p.receipt_address_id == null
      ? {}
      : { receipt_address_id: p.receipt_address_id }),
    ...(p.order_date == null ? {} : { order_date: p.order_date }),
    ...(p.price == null ? {} : { price: p.price }),
    products: p.products.map((line) => ({
      product_id: line.product_id,
      count: line.count,
      detail: line.detail ?? "",
    })),
  };
}
export function rememberOrder(account, intent) {
  account = accountKey(account);
  if (!account) return false;
  try {
    const records = entries();
    records[account] = {
      account,
      payload: orderPayload(intent.payload),
      status: intent.status || "INDETERMINATE",
      uncertain: intent.uncertain ?? true,
    };
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify({ version: 2, entries: records }),
    );
    return true;
  } catch {
    return false;
  }
}
export function recoverOrder(account) {
  try {
    account = accountKey(account);
    const entry = entries()[account];
    const p = entry?.payload;
    if (
      entry?.account !== account ||
      !p ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        p.request_id,
      ) ||
      !Number.isInteger(p.address_id) ||
      p.address_id < 1 ||
      (p.receipt_address_id != null &&
        (!Number.isInteger(p.receipt_address_id) ||
          p.receipt_address_id < 1)) ||
      !Array.isArray(p.products) ||
      !p.products.length ||
      p.products.some(
        (line) =>
          !Number.isInteger(line.product_id) ||
          line.product_id < 1 ||
          !Number.isInteger(line.count) ||
          line.count < 1 ||
          typeof (line.detail ?? "") !== "string",
      )
    )
      return null;
    return {
      payload: orderPayload(p),
      purchased: [],
      attempt: 0,
      uncertain: true,
      status: entry.status === "UNRESOLVED" ? "UNRESOLVED" : "INDETERMINATE",
      error: "",
    };
  } catch {
    return null;
  }
}
export function forgetOrder(account, requestId) {
  try {
    if (!account) {
      window.sessionStorage.removeItem(KEY);
      return;
    }
    const records = entries();
    account = accountKey(account);
    if (
      !records[account] ||
      (requestId && records[account].payload.request_id !== requestId)
    )
      return;
    delete records[account];
    if (Object.keys(records).length)
      window.sessionStorage.setItem(
        KEY,
        JSON.stringify({ version: 2, entries: records }),
      );
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* The guarded Redux lifecycle remains authoritative in this session. */
  }
}
