// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act } from "react";
import {
  render,
  screen,
  waitFor,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from "history";
import { legacy_createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import reducer from "../store/reducer";
import {
  addCartItem,
  setUser,
  setCategories,
  setAuthInitialized,
  resetAccountSession,
  setCreditCards,
} from "../store/actions";
import api from "../services/api";
import AddressForm from "../components/AddressForm";
import CardForm from "../components/CardForm";
import OrderPage from "../pages/OrderPage";
import ContactForm from "../pages/ContactForm";
import ResourceNotice from "../components/ResourceNotice";
import ShopPage from "../pages/ShopPage";
import Header from "../layout/Header";
import HeaderSearch from "../components/HeaderSearch";
import FavoriteButton from "../components/FavoriteButton";
import FavoritesPage from "../pages/FavoritesPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { rememberOrder } from "../store/pendingOrder";
import InformationPage from "../pages/InformationPage";

const address = {
  id: 1,
  title: "Shipping",
  name: "Synthetic",
  surname: "Person",
  phone: "+905551112233",
  city: "Ankara",
  district: "Cankaya",
  neighborhood: "Street building apartment",
};
const billing = {
  ...address,
  id: 2,
  title: "Separate Billing",
  city: "London",
};
const card = {
  id: 3,
  card_no: "**** 1111",
  expire_month: 12,
  expire_year: new Date().getFullYear() + 1,
  name_on_card: "Synthetic",
};
const product = {
  id: 1,
  name: "Sample Dress",
  price: 10,
  stock: 10,
  category_id: 1,
  images: [{ url: "/catalog/black-dress.svg" }],
};
function setup(node, path = "/order", provided) {
  const store = provided || legacy_createStore(reducer, applyMiddleware(thunk));
  const history = createMemoryHistory({ initialEntries: [path] });
  const view = render(
    <Provider store={store}>
      <Router history={history}>{node}</Router>
    </Provider>,
  );
  return { ...view, store, history, user: userEvent.setup() };
}
function checkout() {
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ email: "first@example.test" }));
  store.dispatch(addCartItem(product));
  store.dispatch(addCartItem({ ...product, id: 2 }));
  store.dispatch({ type: "CART_TOGGLE_ITEM", payload: 2 });
  return setup(<OrderPage />, "/order", store);
}
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  sessionStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(api, "get").mockImplementation(async (path) =>
    path.startsWith("/products/") ? { ...product, id: Number(path.split("/").pop()) } : path === "/user/address"
      ? [address, billing]
      : path === "/user/card/summary"
        ? [card]
        : path === "/user/favorites"
          ? []
          : [],
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("closes a confirmed address save despite refresh failure; reconciliation does not write again", async () => {
  const write = vi.spyOn(api, "post").mockResolvedValue(address);
  api.get.mockRejectedValue({ status: 503, message: "Read failed" });
  const done = vi.fn();
  const { user, store } = setup(
    <>
      <AddressForm address={undefined} onDone={done} />
      <ResourceNotice resource="addresses" />
    </>,
  );
  for (const [label, value] of [
    ["Address title", "Home"],
    ["Name", "Synthetic"],
    ["Surname", "Person"],
    ["Phone", "05551112233"],
    ["City / province", "Ankara"],
    ["District", "Cankaya"],
    [
      "Neighborhood / street, building, apartment and postal details",
      "Street building apartment",
    ],
  ])
    await user.type(screen.getByLabelText(label, { exact: true }), value);
  await user.click(screen.getByRole("button", { name: "Save Address" }));
  await waitFor(() => expect(done).toHaveBeenCalledTimes(1));
  expect(screen.getByText(/Change saved successfully/)).toBeTruthy();
  expect(store.getState().client.addressList[0].id).toBe(1);
  api.get.mockResolvedValue([address]);
  await user.click(
    screen.getByRole("button", { name: "Refresh saved records" }),
  );
  await waitFor(() =>
    expect(screen.queryByText(/Change saved successfully/)).toBeNull(),
  );
  expect(write).toHaveBeenCalledTimes(1);
});
it("edits addresses with dependent suggestions and preserves manual international details", async () => {
  const put = vi.spyOn(api, "put").mockResolvedValue(address);
  const { user } = setup(<AddressForm address={address} onDone={() => {}} />);
  const city = screen.getByLabelText("City / province", { exact: true });
  const district = screen.getByLabelText("District", { exact: true });
  await user.clear(city);
  await user.type(city, "Unknown City");
  expect(district.value).toBe("");
  expect(document.querySelectorAll("#district-list option").length).toBe(0);
  await user.type(district, "Manual District");
  await user.selectOptions(
    screen.getByLabelText("Telephone country code"),
    "+44",
  );
  const phone = screen.getByLabelText("Phone", { exact: true });
  await user.clear(phone);
  await user.type(phone, "020 7946 0000");
  await user.click(screen.getByRole("button", { name: "Save Address" }));
  await waitFor(() => expect(put).toHaveBeenCalled());
  expect(put.mock.calls[0][1]).toMatchObject({
    id: 1,
    phone: "+442079460000",
    city: "Unknown City",
    district: "Manual District",
    neighborhood: address.neighborhood,
  });
});
it("keeps a genuinely failed form editable but blocks repeated uncertain creates", async () => {
  const post = vi
    .spyOn(api, "post")
    .mockRejectedValue({ status: 400, message: "Rejected" });
  const done = vi.fn();
  const { user } = setup(<AddressForm address={undefined} onDone={done} />);
  for (const [label, value] of [
    ["Address title", "Home"],
    ["Name", "Synthetic"],
    ["Surname", "Person"],
    ["Phone", "05551112233"],
    ["City / province", "Ankara"],
    ["District", "Cankaya"],
    [
      "Neighborhood / street, building, apartment and postal details",
      "Street building apartment",
    ],
  ])
    await user.type(screen.getByLabelText(label, { exact: true }), value);
  await user.click(screen.getByRole("button", { name: "Save Address" }));
  await screen.findByRole("alert");
  expect(done).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Save Address" }).disabled).toBe(
    false,
  );
  post.mockRejectedValue({ message: "Lost response" });
  await user.click(screen.getByRole("button", { name: "Save Address" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Save Address" }).disabled).toBe(
      true,
    ),
  );
  await user.click(screen.getByRole("button", { name: "Save Address" }));
  expect(post).toHaveBeenCalledTimes(2);
});
it("keeps card metadata edits masked through a failed refresh and validates month/year", async () => {
  const put = vi
    .spyOn(api, "put")
    .mockResolvedValue({ ...card, card_no: "4111111111111111" });
  api.get.mockRejectedValue({ status: 503 });
  const done = vi.fn();
  const { user, store } = setup(<CardForm card={card} onDone={done} />);
  expect(screen.getByLabelText(/Replacement card number/).value).toBe("");
  const year = screen.getByLabelText("Expiration year");
  const month = screen.getByLabelText("Expiration month");
  await user.selectOptions(year, String(new Date().getFullYear()));
  if (new Date().getMonth() > 0)
    expect(month.querySelector('option[value="1"]').disabled).toBe(true);
  await user.selectOptions(year, String(card.expire_year));
  await user.selectOptions(month, "12");
  await user.click(screen.getByRole("button", { name: "Save Card" }));
  await waitFor(() => expect(done).toHaveBeenCalled());
  expect(put.mock.calls[0][1]).not.toHaveProperty("card_no");
  expect(JSON.stringify(store.getState())).not.toContain("4111111111111111");
});
it("binds billing by default, preserves separate selection, and confirms exact purchased cart lines", async () => {
  const order = {
    id: 77,
    order_date: "2026-10-17T00:00:00Z",
    price: 10,
    currency: "USD",
    products: [
      {
        product_id: 1,
        count: 1,
        product_name: "Sample Dress",
        unit_price: 10,
        line_total: 10,
      },
    ],
    shipping_address: "Shipping snapshot",
    receipt_address: "Billing snapshot",
  };
  const post = vi.spyOn(api, "post").mockResolvedValue(order);
  const { user, store } = checkout();
  await screen.findByText("Billing / receipt address is the same as shipping");
  await user.click(screen.getByLabelText(/Shipping.*Ankara/));
  const toggle = screen.getByLabelText(
    "Billing / receipt address is the same as shipping",
  );
  expect(toggle.checked).toBe(true);
  await user.click(toggle);
  const receipts = screen.getByRole("group", { name: "Receipt address" });
  await user.click(receipts.querySelectorAll('input[type="radio"]')[1]);
  await user.click(toggle);
  await user.click(toggle);
  expect(
    screen
      .getByRole("group", { name: "Receipt address" })
      .querySelectorAll('input[type="radio"]')[1].checked,
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "Continue to Payment" }));
  expect(screen.queryByLabelText("CCV")).toBeNull();
  await user.click(screen.getByRole("radio", { name: /1111/ }));
  const ccv = screen.getByLabelText("CCV");
  await user.type(ccv, "12");
  expect(screen.getByRole("button", { name: "Complete Order" }).disabled).toBe(
    true,
  );
  await user.type(ccv, "34");
  expect(ccv.value).toBe("123");
  await user.click(screen.getByRole("button", { name: "Complete Order" }));
  await screen.findByText("Order completed");
  expect(screen.getByText("Billing snapshot")).toBeTruthy();
  expect(post.mock.calls[0][1]).toMatchObject({
    address_id: 1,
    receipt_address_id: 2,
  });
  expect(post.mock.calls[0][1]).not.toHaveProperty("card_ccv");
  expect(post.mock.calls[0][1].request_id).toMatch(/^[0-9a-f-]{36}$/);
  expect(
    store.getState().shoppingCart.cart.map((line) => line.product.id),
  ).toEqual([2]);
});
it("retains one immutable order intent after a lost response, clears CCV and safely retries", async () => {
  const post = vi
    .spyOn(api, "post")
    .mockRejectedValueOnce({ message: "Transport lost" })
    .mockResolvedValueOnce({
      id: 88,
      price: 10,
      currency: "USD",
      products: [],
    });
  const { user, store } = checkout();
  await screen.findByText("Billing / receipt address is the same as shipping");
  await user.click(screen.getByLabelText(/Shipping.*Ankara/));
  await user.click(screen.getByRole("button", { name: "Continue to Payment" }));
  await user.click(screen.getByRole("radio", { name: /1111/ }));
  await user.type(screen.getByLabelText("CCV"), "123");
  await user.click(screen.getByRole("button", { name: "Complete Order" }));
  await screen.findByText(/Order outcome is uncertain/);
  expect(screen.getByLabelText("CCV").value).toBe("");
  expect(store.getState().shoppingCart.cart.length).toBe(2);
  await user.type(screen.getByLabelText("CCV"), "456");
  await user.click(
    screen.getByRole("button", { name: "Retry same order safely" }),
  );
  await screen.findByText("Order completed");
  expect(post.mock.calls[1][1]).toEqual(post.mock.calls[0][1]);
  expect(store.getState().shoppingCart.orderIntent).toBeNull();
});
it("handles no saved card, confirmed address deletion and actual checkout rejection", async () => {
  api.get.mockImplementation(async (path) =>
    path.startsWith("/products/") ? { ...product, id: Number(path.split("/").pop()) } : path === "/user/address" ? [address] : [],
  );
  const { user, store } = checkout();
  await screen.findByText("Billing / receipt address is the same as shipping");
  await user.click(screen.getByLabelText(/Shipping.*Ankara/));
  await user.click(screen.getByRole("button", { name: "Continue to Payment" }));
  expect(screen.getByText(/No saved cards yet/)).toBeTruthy();
  expect(screen.queryByLabelText("CCV")).toBeNull();
  expect(screen.getByRole("button", { name: "Complete Order" }).disabled).toBe(
    true,
  );
  act(() => store.dispatch(setCreditCards([card])));
  await user.click(screen.getByRole("radio", { name: /1111/ }));
  vi.spyOn(api, "post").mockRejectedValue({
    status: 409,
    message: "Insufficient stock",
  });
  await user.type(screen.getByLabelText("CCV"), "123");
  await user.click(screen.getByRole("button", { name: "Complete Order" }));
  await screen.findByText("Insufficient stock");
  expect(store.getState().shoppingCart.orderIntent).toBeNull();
  expect(store.getState().shoppingCart.cart.length).toBe(2);
  await user.click(screen.getByRole("button", { name: "Back", exact: true }));
  vi.spyOn(api, "delete").mockResolvedValue(undefined);
  api.get.mockRejectedValue({ status: 503, message: "refresh failed" });
  await user.click(
    screen.getByRole("button", { name: "Delete address Shipping" }),
  );
  await waitFor(() =>
    expect(screen.getByText("No saved addresses yet.")).toBeTruthy(),
  );
  expect(
    screen.queryByRole("button", { name: "Continue to Payment" }),
  ).toBeNull();
  expect(store.getState().client.addressList).toEqual([]);
  expect(screen.getByText(/Change saved successfully/)).toBeTruthy();
});
it("retains contact inputs on failure and reuses submission identity on retry", async () => {
  const post = vi
    .spyOn(api, "post")
    .mockRejectedValueOnce({ message: "Unavailable" })
    .mockResolvedValueOnce({ reference: "receipt-123" });
  const { user } = setup(<ContactForm />);
  for (const [label, value] of [
    ["Name", "Synthetic"],
    ["Email", "sender@example.test"],
    ["Subject", "Test"],
    ["Message", "A synthetic test inquiry."],
  ])
    await user.type(screen.getByLabelText(label, { exact: true }), value);
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("Unavailable");
  expect(screen.getByLabelText("Message", { exact: true }).value).toBe(
    "A synthetic test inquiry.",
  );
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("Message received");
  expect(post.mock.calls[0][1].submission_id).toBe(
    post.mock.calls[1][1].submission_id,
  );
});
it("submits global header search and clears inherited collection restrictions", async () => {
  const done = vi.fn();
  const { user, history } = setup(
    <HeaderSearch onDone={done} />,
    "/shop?gender=k&sort=price%3Aasc&page=2",
  );
  await user.type(screen.getByRole("searchbox"), "navy{Enter}");
  expect(history.location.pathname).toBe("/shop");
  expect(history.location.search).not.toContain("gender=");
  expect(history.location.search).toContain("filter=navy");
  expect(history.location.search).not.toContain("page=2");
  await user.click(screen.getByRole("button", { name: "Clear" }));
  expect(history.location.search).not.toContain("filter=");
});
it("offers guest sign-in, persists favorites separately and clears them when account changes", async () => {
  const { user, store, history } = setup(
    <>
      <FavoriteButton productId={1} name="Dress" />
      <FavoritesPage />
    </>,
    "/favorites",
  );
  await user.click(
    screen.getByRole("button", { name: "Save Dress to favorites" }),
  );
  expect(history.location.pathname).toBe("/login");
  act(() => store.dispatch(setUser({ email: "first@example.test" })));
  await waitFor(() =>
    expect(screen.getByText(/No saved favorites yet/)).toBeTruthy(),
  );
  vi.spyOn(api, "put").mockResolvedValue(undefined);
  api.get.mockResolvedValue([product]);
  await user.click(
    screen.getByRole("button", { name: "Save Dress to favorites" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Remove Dress from favorites" }),
    ).toBeTruthy(),
  );
  expect(store.getState().shoppingCart.cart).toEqual([]);
  api.get.mockResolvedValue([]);
  act(() => {
    store.dispatch(resetAccountSession());
    store.dispatch(setUser({ email: "second@example.test" }));
  });
  await waitFor(() => expect(store.getState().client.favorites).toEqual([]));
});
it("redirects protected navigation and preserves the intended return path", async () => {
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setAuthInitialized(true));
  const { history } = setup(
    <>
      <ProtectedRoute path="/order" component={() => <p>Private checkout</p>} />
      <Route path="/login">
        <p>Sign in page</p>
      </Route>
    </>,
    "/order",
    store,
  );
  await screen.findByText("Sign in page");
  expect(history.location.state.from).toBe("/order");
  expect(screen.queryByText("Private checkout")).toBeNull();
});
it("scrolls and focuses the careers hash target after route mount", () => {
  setup(<InformationPage />, "/careers#open-positions");
  const target = document.getElementById("open-positions");
  expect(target.scrollIntoView).toHaveBeenCalled();
  expect(document.activeElement).toBe(target);
});

it("keeps Shop count tied to committed products across overlapping empty queries and history navigation", async () => {
  const replies = new Map();
  api.get.mockImplementation(
    (_path, config) =>
      new Promise((resolve) =>
        replies.set(config.params.filter || "", resolve),
      ),
  );
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(
    setCategories([
      {
        id: 1,
        title: "Dresses",
        gender: "k",
        code: "k:Dresses",
        rating: 5,
        img: "/catalog/black-dress.svg",
      },
    ]),
  );
  const { history } = setup(<ShopPage />, "/shop?filter=first", store);
  await waitFor(() => expect(replies.has("first")).toBe(true));
  await act(async () =>
    replies.get("first")({ products: [product], total: 3 }),
  );
  expect(screen.getByText("Showing 1-1 of 3 results")).toBeTruthy();
  act(() => history.push("/shop?gender=e&filter=second"));
  expect(screen.queryByText("Showing 1-1 of 3 results")).toBeNull();
  await waitFor(() => expect(replies.has("second")).toBe(true));
  act(() => history.push("/shop?gender=k&filter=third&sort=price%3Aasc"));
  await waitFor(() => expect(replies.has("third")).toBe(true));
  await act(async () =>
    replies.get("second")({ products: [product], total: 99 }),
  );
  expect(screen.queryByText(/of 99 results/)).toBeNull();
  await act(async () => replies.get("third")({ products: [], total: 0 }));
  expect(screen.getByText("Showing 0 of 0 results")).toBeTruthy();
  act(() => history.goBack());
  expect(screen.queryByText("Showing 0 of 0 results")).toBeNull();
  await waitFor(() =>
    expect(screen.getByText("Loading results...")).toBeTruthy(),
  );
  await act(async () =>
    replies.get("second")({ products: [product], total: 2 }),
  );
  expect(screen.getByText("Showing 1-1 of 2 results")).toBeTruthy();
  act(() => history.goForward());
  await act(async () => replies.get("third")({ products: [], total: 0 }));
  expect(screen.getByText("Showing 0 of 0 results")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Filter products"), {
    target: { value: "third" },
  });
});

it("clears transient CCV and selected payment after a confirmed card delete even when refresh fails", async () => {
  const { user, store } = checkout();
  await screen.findByText("Billing / receipt address is the same as shipping");
  await user.click(screen.getByLabelText(/Shipping.*Ankara/));
  await user.click(screen.getByRole("button", { name: "Continue to Payment" }));
  await user.click(screen.getByRole("radio", { name: /1111/ }));
  await user.type(screen.getByLabelText("CCV"), "123");
  vi.spyOn(api, "delete").mockResolvedValue(undefined);
  api.get.mockRejectedValue({ status: 503, message: "Refresh failed" });
  await user.click(
    screen.getByRole("button", { name: "Delete card ending 1111" }),
  );
  await waitFor(() => expect(screen.queryByLabelText("CCV")).toBeNull());
  expect(store.getState().client.creditCards).toEqual([]);
  expect(store.getState().shoppingCart.payment).toEqual({});
  expect(screen.getByRole("button", { name: "Complete Order" }).disabled).toBe(
    true,
  );
  expect(screen.getByText(/Change saved successfully/)).toBeTruthy();
});

it("recovers the same pending order after a tab reload without consuming a new cart", async () => {
  const payload = {
    request_id: "a0000000-0000-4000-8000-000000000001",
    address_id: 1,
    receipt_address_id: 2,
    order_date: "2026-10-17T00:00:00Z",
    price: 10,
    products: [{ product_id: 1, count: 1, detail: "" }],
  };
  rememberOrder("first@example.test", { payload });
  const post = vi
    .spyOn(api, "post")
    .mockResolvedValue({ id: 99, price: 10, currency: "USD", products: [] });
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ email: "first@example.test" }));
  store.dispatch(addCartItem(product)); // Newly added after reload, not part of the lost cart.
  const { user } = setup(<OrderPage />, "/order", store);
  await screen.findByText(/pending purchase is retained/);
  await user.type(screen.getByLabelText("CCV"), "123");
  await user.click(
    screen.getByRole("button", { name: "Retry same order safely" }),
  );
  await screen.findByText("Order completed");
  expect(post.mock.calls[0][1]).toEqual(payload);
  expect(store.getState().shoppingCart.cart[0].count).toBe(1);
  expect(sessionStorage.getItem("fsweb0825.pending-order")).toBeNull();
});

it("shares one initial favorites read between Header and Favorites page regardless of effect order", async () => {
  const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ email: "first@example.test" }));
  store.dispatch(setAuthInitialized(true));
  setup(
    <>
      <FavoritesPage />
      <Header />
    </>,
    "/favorites",
    store,
  );
  await screen.findByText(/No saved favorites yet/);
  expect(
    api.get.mock.calls.filter(([path]) => path === "/user/favorites").length,
  ).toBe(1);
});

it("rechecks canonical availability before order submission and retains the cart on a stock change", async () => {
  api.get.mockImplementation(async path => path.startsWith("/products/") ? { ...product, id: Number(path.split("/").pop()), stock: 0 } : path === "/user/address" ? [address] : path === "/user/card/summary" ? [card] : []);
  const post = vi.spyOn(api, "post"); const { user, store } = checkout();
  await screen.findByText("Billing / receipt address is the same as shipping");
  await user.click(screen.getByLabelText(/Shipping.*Ankara/)); await user.click(screen.getByRole("button", { name: "Continue to Payment" }));
  await user.click(screen.getByRole("radio", { name: /1111/ })); await user.type(screen.getByLabelText("CCV"), "123");
  await user.click(screen.getByRole("button", { name: "Complete Order" })); await screen.findByText(/Availability changed/);
  expect(post).not.toHaveBeenCalled(); expect(store.getState().shoppingCart.cart).toHaveLength(2);
  expect(store.getState().shoppingCart.orderIntent).toBeNull(); expect(screen.getByLabelText("CCV").value).toBe("");
});
