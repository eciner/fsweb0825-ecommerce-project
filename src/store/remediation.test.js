import { afterEach, describe, expect, it, vi } from "vitest";
import { legacy_createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import reducer from "./reducer";
import api from "../services/api";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  fetchAddresses,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard,
  fetchCreditCards,
  createOrder,
  fetchProductsByQuery,
  fetchProductDetail,
  invalidateProductInventory,
  resetAccountSession,
  setUser,
} from "./actions";

const store = () => legacy_createStore(reducer, applyMiddleware(thunk));
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
afterEach(() => vi.restoreAllMocks());
const resources = [
  [
    "address",
    createAddress,
    updateAddress,
    deleteAddress,
    fetchAddresses,
    "addressList",
    { id: 9, title: "Confirmed" },
  ],
  [
    "card",
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    fetchCreditCards,
    "creditCards",
    {
      id: 9,
      card_no: "4111111111111111",
      expire_month: 12,
      expire_year: 2030,
      name_on_card: "Synthetic",
    },
  ],
];
describe.each(resources)(
  "confirmed %s writes",
  (_name, create, update, remove, refresh, field, record) => {
    it.each([
      ["post", create],
      ["put", update],
      ["delete", remove],
    ])(
      "keeps %s confirmed after GET fails and retry performs GET only",
      async (method, action) => {
        const state = store();
        const write = vi.spyOn(api, method).mockResolvedValue(record);
        const read = vi
          .spyOn(api, "get")
          .mockRejectedValue({ status: 503, message: "Read unavailable" });
        const result = await state.dispatch(
          action(method === "delete" ? 9 : record),
        );
        expect(result).toEqual({ mutation: "CONFIRMED", refresh: "FAILED" });
        if (method !== "delete")
          expect(state.getState().client[field][0].id).toBe(9);
        if (field === "creditCards")
          expect(JSON.stringify(state.getState())).not.toContain(
            "4111111111111111",
          );
        read.mockResolvedValue(method === "delete" ? [] : [record]);
        await state.dispatch(refresh());
        expect(write).toHaveBeenCalledTimes(1);
        expect(read).toHaveBeenCalledTimes(2);
        if (field === "creditCards")
          expect(JSON.stringify(state.getState())).not.toContain(
            "4111111111111111",
          );
      },
    );
    it("does not claim success or refresh on a genuinely rejected POST", async () => {
      const state = store();
      const read = vi.spyOn(api, "get");
      const write = vi
        .spyOn(api, "post")
        .mockRejectedValue({ status: 400, message: "Invalid request" });
      await expect(state.dispatch(create(record))).rejects.toMatchObject({
        outcome: "FAILED",
        status: 400,
      });
      expect(state.getState().client[field]).toEqual([]);
      expect(read).not.toHaveBeenCalled();
      write.mockResolvedValue(record);
      read.mockResolvedValue([record]);
      expect((await state.dispatch(create(record))).mutation).toBe("CONFIRMED");
    });
    it("blocks duplicate writes after an unknown POST result and only allows reconciliation reads", async () => {
      const state = store();
      const write = vi
        .spyOn(api, "post")
        .mockRejectedValue({ message: "Response lost" });
      vi.spyOn(api, "get").mockResolvedValue([record]);
      await expect(state.dispatch(create(record))).rejects.toMatchObject({
        outcome: "UNKNOWN",
      });
      expect(state.getState().client[field]).toEqual([]);
      await state.dispatch(refresh());
      await expect(state.dispatch(create(record))).rejects.toMatchObject({
        outcome: "UNKNOWN",
      });
      expect(write).toHaveBeenCalledTimes(1);
    });
    it("rejects a delayed pre-mutation read and does not leak a write response after logout", async () => {
      const state = store();
      const old = deferred();
      vi.spyOn(api, "get")
        .mockReturnValueOnce(old.promise)
        .mockRejectedValueOnce({ status: 503 });
      const pending = state.dispatch(refresh());
      vi.spyOn(api, "post").mockResolvedValue(record);
      await state.dispatch(create(record));
      old.resolve([]);
      await pending;
      expect(state.getState().client[field][0].id).toBe(9);
      const write = deferred();
      api.post.mockReturnValueOnce(write.promise);
      const mutation = state.dispatch(create(record));
      state.dispatch(resetAccountSession());
      write.resolve(record);
      await mutation;
      expect(state.getState().client[field]).toEqual([]);
    });
  },
);

it("invalidates list/detail only after a confirmed order and rejects pre-purchase responses", async () => {
  const state = store();
  state.dispatch(setUser({ email: "cache@example.test" }));
  const oldList = deferred();
  const oldDetail = deferred();
  const get = vi
    .spyOn(api, "get")
    .mockImplementation((path) =>
      path === "/products" ? oldList.promise : oldDetail.promise,
    );
  const list = state.dispatch(
    fetchProductsByQuery({ gender: "k", filter: "dress" }),
  );
  const detail = state.dispatch(fetchProductDetail(1));
  vi.spyOn(api, "post").mockResolvedValue({ id: 1 });
  await state.dispatch(
    createOrder({
      request_id: "a0000000-0000-4000-8000-000000000001",
      address_id: 1,
      products: [{ product_id: 1, count: 1 }],
    }),
  );
  expect(state.getState().product.inventoryRevision).toBe(1);
  const freshList = deferred();
  const freshDetail = deferred();
  get.mockImplementation((path) =>
    path === "/products" ? freshList.promise : freshDetail.promise,
  );
  const newList = state.dispatch(
    fetchProductsByQuery({ gender: "k", filter: "dress" }),
  );
  const newDetail = state.dispatch(fetchProductDetail(1));
  oldList.resolve({ products: [{ id: 1, stock: 10 }], total: 1 });
  oldDetail.resolve({ id: 1, stock: 10 });
  await Promise.all([list, detail]);
  // Old finally must not remove ownership of the newer in-flight request.
  const deduped = state.dispatch(
    fetchProductsByQuery({ gender: "k", filter: "dress" }),
  );
  expect(get).toHaveBeenCalledTimes(4);
  freshList.resolve({ products: [{ id: 1, stock: 9 }], total: 1 });
  freshDetail.resolve({ id: 1, stock: 9 });
  await Promise.all([newList, newDetail, deduped]);
  expect(state.getState().product.productList[0].stock).toBe(9);
  expect(state.getState().product.selectedProduct.stock).toBe(9);
  await state.dispatch(fetchProductsByQuery({ gender: "k", filter: "dress" }));
  await state.dispatch(fetchProductDetail(1));
  expect(get).toHaveBeenCalledTimes(4);
});
it("expires successful product caches but leaves them intact after a failed purchase", async () => {
  const state = store();
  state.dispatch(setUser({ email: "cache@example.test" }));
  const order = {
    request_id: "a0000000-0000-4000-8000-000000000001",
    address_id: 1,
    products: [{ product_id: 1, count: 1 }],
  };
  const get = vi
    .spyOn(api, "get")
    .mockImplementation(async (path) =>
      path === "/products"
        ? { products: [{ id: 1, stock: 4 }], total: 1 }
        : { id: 1, stock: 4 },
    );
  await state.dispatch(fetchProductsByQuery({}));
  await state.dispatch(fetchProductDetail(1));
  const post = vi
    .spyOn(api, "post")
    .mockRejectedValue({ status: 409, message: "Rejected" });
  await expect(state.dispatch(createOrder(order))).rejects.toMatchObject({
    status: 409,
  });
  await state.dispatch(fetchProductsByQuery({}));
  await state.dispatch(fetchProductDetail(1));
  expect(get).toHaveBeenCalledTimes(2);
  post.mockResolvedValue({ id: 1 });
  await state.dispatch(createOrder(order));
  expect(state.getState().product.fetchState).toBe("NOT_FETCHED");
  expect(state.getState().product.selectedProductFetchState).toBe(
    "NOT_FETCHED",
  );
  await state.dispatch(fetchProductsByQuery({}));
  await state.dispatch(fetchProductDetail(1));
  expect(get).toHaveBeenCalledTimes(4);
  state.dispatch(invalidateProductInventory());
});
