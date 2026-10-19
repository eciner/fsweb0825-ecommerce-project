import { afterEach, expect, it, vi } from "vitest";
import { legacy_createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import reducer from "./reducer";
import api from "../services/api";
import { fetchFavorites, resetAccountSession, setUser } from "./actions";

afterEach(() => vi.restoreAllMocks());
it("does not replace a newer same-account favorites result with an older response", async () => {
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ email: "first@example.test" }));
  let firstResolve, secondResolve;
  vi.spyOn(api, "get")
    .mockReturnValueOnce(
      new Promise((done) => {
        firstResolve = done;
      }),
    )
    .mockReturnValueOnce(
      new Promise((done) => {
        secondResolve = done;
      }),
    );
  const first = store.dispatch(fetchFavorites());
  const second = store.dispatch(fetchFavorites());
  secondResolve([{ id: 2 }]);
  await second;
  firstResolve([{ id: 1 }]);
  await first;
  expect(store.getState().client.favorites).toEqual([{ id: 2 }]);
});
it("does not let an old account favorite response populate the next account", async () => {
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ email: "first@example.test" }));
  let resolve;
  vi.spyOn(api, "get").mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const oldRequest = store.dispatch(fetchFavorites());
  store.dispatch(resetAccountSession());
  store.dispatch(setUser({ email: "second@example.test" }));
  resolve([{ id: 1 }]);
  await oldRequest;
  expect(store.getState().client.favorites).toEqual([]);
  expect(store.getState().client.favoritesFetchState).toBe("NOT_FETCHED");
});
it("keeps favorites separate from cart and clears them at logout", async () => {
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ email: "first@example.test" }));
  vi.spyOn(api, "get").mockResolvedValue([{ id: 5 }]);
  await store.dispatch(fetchFavorites());
  expect(store.getState().client.favorites).toEqual([{ id: 5 }]);
  expect(store.getState().shoppingCart.cart).toEqual([]);
  store.dispatch(resetAccountSession());
  expect(store.getState().client.favorites).toEqual([]);
});
