import api from "../services/api";

export const OWNED_RESOURCE_STATE = "OWNED_RESOURCE_STATE";
// Keep request ownership per Redux store, never across accounts or test stores.
const requests = new WeakMap();
const configuration = {
  addresses: {
    path: "/user/address",
    read: "/user/address",
    field: "addressList",
    keys: ["addresses", "address"],
  },
  cards: {
    path: "/user/card",
    read: "/user/card/summary",
    field: "creditCards",
    keys: ["cards", "creditCards"],
  },
};
function slot(getState, resource) {
  if (!requests.has(getState)) requests.set(getState, {});
  const slots = requests.get(getState);
  return (slots[resource] ||= { read: 0, writing: false });
}
function maskCard(value) {
  if (!value) return value;
  // Never dispatch the full-PAN legacy mutation response.
  return {
    id: value.id,
    card_no: `**** ${String(value.card_no || "").slice(-4)}`,
    expire_month: value.expire_month,
    expire_year: value.expire_year,
    name_on_card: value.name_on_card,
  };
}
function publish(dispatch, getState, resource, revision, patch, items) {
  const status = getState().client.resourceStatus[resource] || {};
  dispatch({
    type: OWNED_RESOURCE_STATE,
    payload: { resource, revision, status: { ...status, ...patch }, items },
  });
}
const load = (resource) => async (dispatch, getState) => {
  const config = configuration[resource];
  const revision = getState().client.sessionRevision;
  const request = slot(getState, resource);
  const id = ++request.read;
  publish(dispatch, getState, resource, revision, { refresh: "LOADING" });
  try {
    const response = await api.get(config.read);
    let items = Array.isArray(response)
      ? response
      : config.keys.map((key) => response?.[key]).find(Array.isArray) || [];
    if (resource === "cards") items = items.map(maskCard);
    if (request.read === id && revision === getState().client.sessionRevision)
      publish(
        dispatch,
        getState,
        resource,
        revision,
        { refresh: "SUCCEEDED", refreshError: "" },
        items,
      );
    return revision === getState().client.sessionRevision ? items : [];
  } catch (error) {
    if (request.read === id)
      publish(dispatch, getState, resource, revision, {
        refresh: "FAILED",
        refreshError: error.message || "Collection could not be refreshed.",
      });
    throw error;
  }
};
const mutate = (resource, method, payload) => async (dispatch, getState) => {
  const config = configuration[resource];
  const request = slot(getState, resource);
  const revision = getState().client.sessionRevision;
  if (
    request.writing ||
    getState().client.resourceStatus[resource]?.mutation === "UNKNOWN"
  ) {
    throw {
      outcome: "UNKNOWN",
      message:
        "A prior operation is pending or uncertain. Review saved records; do not repeat the write.",
    };
  }
  request.writing = true;
  ++request.read; // Reject collection reads started before this mutation.
  publish(dispatch, getState, resource, revision, {
    mutation: "PENDING",
    error: "",
  });
  let value;
  try {
    value =
      method === "delete"
        ? await api.delete(`${config.path}/${payload}`)
        : await api[method](config.path, payload);
  } catch (reason) {
    const uncertain = !reason.status || reason.status >= 500;
    const error = {
      outcome: uncertain ? "UNKNOWN" : "FAILED",
      status: reason.status || null,
      message: uncertain
        ? "Outcome unknown. Check saved records before making another change; this request must not be automatically repeated."
        : reason.message || "Change was rejected.",
    };
    publish(dispatch, getState, resource, revision, {
      mutation: error.outcome,
      error: error.message,
    });
    request.writing = false;
    throw error;
  }
  try {
    ++request.read;
    if (getState().client.sessionRevision !== revision)
      return { mutation: "CONFIRMED", refresh: "SKIPPED" };
    let items = getState().client[config.field];
    if (method === "delete")
      items = items.filter((item) => String(item.id) !== String(payload));
    else if (value?.id) {
      const safe = resource === "cards" ? maskCard(value) : value;
      items = [...items.filter((item) => item.id !== safe.id), safe];
    }
    publish(
      dispatch,
      getState,
      resource,
      revision,
      { mutation: "CONFIRMED", error: "" },
      items,
    );
    try {
      await dispatch(load(resource));
      return { mutation: "CONFIRMED", refresh: "SUCCEEDED" };
    } catch {
      // The write succeeded. Only GET is retryable; the form must close.
      return { mutation: "CONFIRMED", refresh: "FAILED" };
    }
  } finally {
    request.writing = false;
  }
};
export const fetchAddresses = () => load("addresses");
export const createAddress = (payload) => mutate("addresses", "post", payload);
export const updateAddress = (payload) => mutate("addresses", "put", payload);
export const deleteAddress = (id) => mutate("addresses", "delete", id);
export const fetchCreditCards = () => load("cards");
export const createCreditCard = (payload) => mutate("cards", "post", payload);
export const updateCreditCard = (payload) => mutate("cards", "put", payload);
export const deleteCreditCard = (id) => mutate("cards", "delete", id);
