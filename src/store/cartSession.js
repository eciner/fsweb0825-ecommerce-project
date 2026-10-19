// Persist only IDs/quantities. Product data and all account/payment secrets are excluded.
const PREFIX = "wit.cart.v1:";
export const cartScope = user => user?.id ? `account:${user.id}` : user?.email ? `memory:${user.email}` : "guest";
export function cartRecords(cart = []) {
  const unique = new Map();
  for (const line of cart.slice(0, 100)) {
    const id = Number(line.product?.id), count = Number(line.count);
    if (Number.isSafeInteger(id) && id > 0 && Number.isInteger(count) && count > 0)
      unique.set(id, { id, count: Math.min(count, 99), checked: line.checked !== false,
        ...(typeof line.lineToken === "string" && /^[0-9a-f-]{36}$/i.test(line.lineToken) ? { lineToken: line.lineToken } : {}) });
  }
  return [...unique.values()];
}
export function readCart(scope, storage) {
  try {
    const saved = JSON.parse((storage ?? globalThis.localStorage)?.getItem(PREFIX + scope) || "[]");
    const rows = Array.isArray(saved) ? saved : saved.lines;
    if (!Array.isArray(rows)) return [];
    return cartRecords(rows.map(row => ({ ...row, product: { id: row.id } }))).map(row => ({
      count: row.count, checked: row.checked, needsRefresh: true,
      lineToken: row.lineToken || crypto.randomUUID(),
      product: { id: row.id, name: `Product #${row.id}`, price: 0, stock: 0 },
    }));
  } catch { return []; }
}
export function readReservations(scope, storage) {
  try {
    const data = JSON.parse((storage ?? globalThis.localStorage)?.getItem(PREFIX + scope) || "{}");
    const safe = {};
    for (const [request, lines] of Object.entries(data.reservations || {}).slice(0, 1)) {
      if (!/^[0-9a-f-]{36}$/i.test(request) || !Array.isArray(lines)) continue;
      safe[request] = lines.slice(0, 100).filter(line => Number.isSafeInteger(line.productId) && line.productId > 0 && Number.isInteger(line.count) && line.count > 0 && line.count <= 99 && /^[0-9a-f-]{36}$/i.test(line.token || ""))
        .map(({ productId, count, token }) => ({ productId, count, token }));
    }
    return safe;
  } catch { return {}; }
}
function readClaims(scope) {
  try {
    return Object.fromEntries(Object.entries(JSON.parse(globalThis.localStorage.getItem(PREFIX + scope) || "{}").claims || {})
      .slice(-1000).filter(([key, count]) => /^[0-9a-f-]{36}$/i.test(key) && Number.isInteger(count) && count > 0 && count <= 99));
  } catch { return {}; }
}
function persisted(scope) { try { return globalThis.localStorage.getItem(PREFIX + scope) !== null; } catch { return false; } }
export function writeCart(scope, cart, storage, reservations = {}, claims = {}) {
  if (scope.startsWith("memory:")) return;
  try { (storage ?? globalThis.localStorage)?.setItem(PREFIX + scope, JSON.stringify({ lines: cartRecords(cart), reservations, claims: Object.fromEntries(Object.entries(claims).slice(-1000)) })); } catch { /* Memory-only fallback. */ }
}
export function mergeCarts(saved, guest) {
  const lines = new Map(saved.map(line => [String(line.product.id), { ...line }]));
  for (const line of guest) {
    const prior = lines.get(String(line.product.id));
    lines.set(String(line.product.id), prior ? {
      ...prior, count: Math.min(99, prior.count + line.count), checked: prior.checked || line.checked, needsRefresh: true,
    } : { ...line, needsRefresh: true });
  }
  return [...lines.values()].slice(0, 100);
}
export const cartPersistence = ({ getState }) => {
 const vault = new Map();
 return next => action => {
  const before = getState().shoppingCart;
  if (action.type === "SET_USER") {
    const owner = cartScope(action.payload);
    const same = before.cartOwner === owner;
    const saved = (!persisted(owner) && vault.get(owner)) || { cart: readCart(owner), cartReservations: readReservations(owner), cartClaims: readClaims(owner) };
    const claims = { ...saved.cartClaims };
    const guest = before.cart.map(line => {
      const previous = claims[line.lineToken] || 0;
      if (line.lineToken) claims[line.lineToken] = Math.max(previous, line.count);
      return { ...line, count: Math.max(0, line.count - previous) };
    }).filter(line => line.count > 0);
    const cart = same ? before.cart : before.cartOwner === "guest"
      ? mergeCarts(saved.cart, guest) : saved.cart;
    if (!same && before.cartOwner === "guest" && owner !== "guest") { writeCart("guest", []); vault.set("guest", { cart: [], cartReservations: {} }); }
    action = { ...action, cartSession: { cartOwner: owner, cart, cartReservations: same ? before.cartReservations : saved.cartReservations,
      cartClaims: same ? before.cartClaims : before.cartOwner === "guest" ? claims : saved.cartClaims } };
  } else if (action.type === "RESET_ACCOUNT_SESSION" && !action.preserveCart) {
    action = { ...action, cartSession: { cartOwner: "guest", cart: before.cartOwner === "guest" ? before.cart : readCart("guest"), cartReservations: {}, cartClaims: {} } };
  } else if (action.type === "CART_ADD_ITEM") {
    action = { ...action, lineToken: crypto.randomUUID() };
  } else if (action.type === "CHECKOUT_OPEN") {
    const intent = action.payload.intent;
    const request = intent.payload.request_id;
    const reserved = before.cartReservations?.[request];
    if (reserved && !intent.purchased.length) {
      const purchased = reserved.filter(line => before.cart.some(item => item.product.id === line.productId && item.lineToken === line.token));
      action = { ...action, payload: { ...action.payload, intent: { ...intent, purchased } } };
    } else if (!reserved && intent.purchased.length) {
      const lines = intent.purchased.flatMap(line => {
        const item = before.cart.find(item => item.product.id === line.productId);
        return item?.lineToken ? [{ productId: line.productId, count: line.count, token: item.lineToken }] : [];
      });
      action = { ...action, cartReservations: { [request]: lines } };
    }
  }
  const result = next(action);
  const after = getState().shoppingCart;
  if (before.cart !== after.cart || before.cartOwner !== after.cartOwner || before.cartReservations !== after.cartReservations)
    writeCart(after.cartOwner || "guest", after.cart, undefined, after.cartReservations, after.cartClaims);
  vault.set(after.cartOwner || "guest", { cart: after.cart, cartReservations: after.cartReservations, cartClaims: after.cartClaims });
  return result;
 };
};
