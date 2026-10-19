// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { applyMiddleware, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import reducer from "../store/reducer";
import { addCartItem, resetAccountSession, setUser } from "../store/actions";
import api from "../services/api";
import OrderPage from "../pages/OrderPage";

const address = {
  id: 1,
  title: "Shipping",
  city: "Ankara",
  district: "Central",
};
const card = {
  id: 2,
  card_no: "**** 1111",
  expire_month: 12,
  expire_year: new Date().getFullYear() + 1,
  name_on_card: "Synthetic",
};
function mount(store) {
  const history = createMemoryHistory({ initialEntries: ["/order"] });
  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>
          <OrderPage />
        </Router>
      </Provider>,
    ),
    store,
    history,
    user: userEvent.setup(),
  };
}
function checkout() {
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ email: "first@example.test" }));
  store.dispatch(addCartItem({ id: 1, name: "Synthetic item", price: 10 }));
  return mount(store);
}
async function submit(view) {
  await screen.findByText("Billing / receipt address is the same as shipping");
  await view.user.click(screen.getByLabelText(/Shipping.*Ankara/));
  await view.user.click(
    screen.getByRole("button", { name: "Continue to Payment" }),
  );
  await view.user.click(screen.getByRole("radio", { name: /1111/ }));
  await view.user.type(screen.getByLabelText("CCV"), "123");
  await view.user.click(screen.getByRole("button", { name: "Complete Order" }));
}
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  sessionStorage.clear();
  vi.spyOn(api, "get").mockImplementation(async (path) =>
    path.startsWith("/products/") ? { id: 1, name: "Synthetic item", price: 10, stock: 10 } : path === "/user/address" ? [address] : [card],
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("retains an uncertain purchase through a retry 401 and offers account reauthentication", async () => {
  const post = vi
    .spyOn(api, "post")
    .mockRejectedValueOnce({ message: "Committed response lost" })
    .mockRejectedValueOnce({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Session expired",
    });
  const view = checkout();
  await submit(view);
  await screen.findByText(/Order outcome is uncertain/);
  const original = view.store.getState().shoppingCart.orderIntent.payload;
  await view.user.type(screen.getByLabelText("CCV"), "456");
  await view.user.click(
    screen.getByRole("button", { name: "Retry same order safely" }),
  );
  await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  expect(view.store.getState().shoppingCart.orderIntent?.payload).toEqual(
    original,
  );
  expect(sessionStorage.getItem("fsweb0825.pending-order")).toContain(
    original.request_id,
  );
  expect(
    screen.getByRole("link", { name: /Sign in.*reconcile/i }),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Complete Order" })).toBeNull();
});

it("ignores a previous account's late rejection with unavailable storage", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Unavailable");
  });
  let rejectA, rejectB;
  vi.spyOn(api, "post")
    .mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectA = reject;
      }),
    )
    .mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectB = reject;
      }),
    );
  const a = checkout();
  await submit(a);
  a.unmount();
  act(() => {
    a.store.dispatch(resetAccountSession());
    a.store.dispatch(setUser({ email: "second@example.test" }));
    expect(a.store.getState().shoppingCart.cart).toEqual([]);
    a.store.dispatch(addCartItem({ id: 1, name: "Account B selected item", price: 10 }));
  });
  const b = mount(a.store);
  await submit(b);
  const original = structuredClone(b.store.getState().shoppingCart.orderIntent);
  await act(async () =>
    rejectA({ status: 400, message: "Account A rejected" }),
  );
  expect(b.store.getState().shoppingCart.orderIntent).toEqual(original);
  expect(screen.queryByText("Account A rejected")).toBeNull();
  await act(async () => rejectB({ message: "Account B response lost" }));
  expect(b.store.getState().shoppingCart.orderIntent?.payload).toEqual(
    original.payload,
  );
});

it("allows a new explicit purchase after leaving confirmation without replaying or hiding the new checkout", async () => {
  const post = vi
    .spyOn(api, "post")
    .mockResolvedValueOnce({ id: 1, products: [] })
    .mockResolvedValueOnce({ id: 2, products: [] });
  const first = checkout();
  await submit(first);
  await screen.findByText("Order completed");
  first.unmount();
  first.store.dispatch(
    addCartItem({ id: 1, name: "Synthetic item", price: 10 }),
  );
  const next = mount(first.store);
  await submit(next);
  await screen.findByText("Order completed");
  expect(post).toHaveBeenCalledTimes(2);
  expect(post.mock.calls[0][1].request_id).not.toBe(
    post.mock.calls[1][1].request_id,
  );
  expect(first.store.getState().shoppingCart.cart).toEqual([]);
});
