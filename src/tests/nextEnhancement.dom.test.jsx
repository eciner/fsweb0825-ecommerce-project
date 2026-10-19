// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import { legacy_createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import reducer from "../store/reducer";
import { setUser } from "../store/actions";
import HeaderSearch from "../components/HeaderSearch";
import ShopFilters from "../components/ShopFilters";
import CityCombobox from "../components/CityCombobox";
import { matchingCities, orderedProvinces } from "../utils/city";
import { normalizeQuery } from "../utils/query";
import ShipmentDetails, { ShipmentCard } from "../components/ShipmentDetails";
import FulfillmentPage from "../pages/FulfillmentPage";
import api from "../services/api";

beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function setup(node, route = "/shop", store = legacy_createStore(reducer, applyMiddleware(thunk))) {
  const history = createMemoryHistory({ initialEntries: [route] });
  render(<Provider store={store}><Router history={history}>{node}</Router></Provider>);
  return { user: userEvent.setup(), history, store };
}
for (const route of ["/shop?gender=k&page=2", "/shop?gender=e", "/shop/kadin/elbise/1", "/shop/erkek/ceket/2/navy/4"]) {
  it(`global search escapes inherited restrictions from ${route}`, async () => {
    const { user, history } = setup(<HeaderSearch onDone={() => {}} />, route);
    await user.clear(screen.getByRole("searchbox")); await user.type(screen.getByRole("searchbox"), "  SİYAH   ürün  {Enter}");
    expect(history.location.pathname).toBe("/shop");
    expect(new URLSearchParams(history.location.search).get("filter")).toBe("SİYAH ürün");
    expect(history.location.search).not.toMatch(/gender|category|page/);
    history.goBack(); expect(history.location.pathname + history.location.search).toBe(route);
  });
}
it("provides all provinces with popular cities pinned and Turkish-aware keyboard selection", async () => {
  expect(new Set(orderedProvinces).size).toBe(81); expect(orderedProvinces.slice(0, 3)).toEqual(["İstanbul", "Ankara", "İzmir"]);
  expect(matchingCities("IZMIR")).toContain("İzmir");
  function City() { const [city, setCity] = useState("Ankara"); return <CityCombobox value={city} onChange={setCity} />; }
  const { user } = setup(<City />); const input = screen.getByRole("combobox");
  await user.click(input); expect(screen.getAllByRole("option")).toHaveLength(81);
  await user.clear(input); await user.type(input, "istanbul"); await user.keyboard("{ArrowDown}{Enter}");
  expect(input.value).toBe("İstanbul"); expect(input.getAttribute("aria-expanded")).toBe("false");
});
it("validates combined filters and preserves independent search and sort", async () => {
  const query = normalizeQuery({ gender: "k", filter: "dress", sort: "price:desc" });
  const { user, history } = setup(<ShopFilters query={query} categories={[]} locationKey="initial" />);
  await user.type(screen.getByLabelText("Minimum price"), "500"); await user.type(screen.getByLabelText("Maximum price"), "100");
  await user.click(screen.getByRole("button", { name: "Apply filters" })); expect(screen.getByRole("alert").textContent).toContain("must not exceed");
  await user.clear(screen.getByLabelText("Maximum price")); await user.type(screen.getByLabelText("Maximum price"), "900");
  await user.click(screen.getByLabelText("In stock only")); await user.click(screen.getByRole("button", { name: "Apply filters" }));
  expect(new URLSearchParams(history.location.search).get("in_stock")).toBe("true");
  expect(new URLSearchParams(history.location.search).get("sort")).toBe("price:desc");
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(history.location.search).not.toContain("price="); expect(history.location.search).toContain("filter=dress");
});
it("customer management navigation cannot trigger a privileged API call", () => {
  const get = vi.spyOn(api, "get"); const store = legacy_createStore(reducer, applyMiddleware(thunk));
  store.dispatch(setUser({ id: 1, email: "customer@example.test", role_code: "customer" }));
  setup(<FulfillmentPage />, "/fulfillment", store);
  expect(screen.getByRole("alert").textContent).toContain("restricted"); expect(get).not.toHaveBeenCalled();
});
it("renders mixed shipment progress and only genuine tracking data", async () => {
  vi.spyOn(api, "get").mockResolvedValue({ status: "PARTIALLY_SHIPPED", shipments: [{ id: 8, order_id: 1, status: "PREPARING", items: [], history: [] }] });
  setup(<ShipmentDetails orderId={1} />);
  await screen.findByText("Overall fulfillment: Partially shipped"); expect(screen.getAllByText("Not assigned")).toHaveLength(2);
  expect(screen.queryByRole("link", { name: /track/i })).toBeNull();
});
it("shows historical import explicitly without fabricating missing shipment milestones", () => {
  setup(<ShipmentCard shipment={{ id: 4, order_id: 1, historical: true, status: "ORDER_PLACED", items: [{ product_id: 1, count: 1 }], history: [] }} />);
  expect(screen.getByText(/not a reconstructed shipping date/)).toBeTruthy();
  expect(within(screen.getByRole("list", { name: "Shipment 4 progress" })).getAllByText("Not recorded")).toHaveLength(4);
});
it("renders customer events without inventing an actor or a migration", () => {
  setup(<ShipmentCard shipment={{ id: 4, order_id: 1, status: "PREPARING", items: [], history: [
    { id: 1, status: "PREPARING", kind: "STATUS_CHANGED", recorded_at: "2026-10-20T00:00:00Z" },
  ] }} />);
  expect(screen.getByText(/Status recorded/)).toBeTruthy();
  expect(screen.queryByText(/Account #|Migration import|Historical import/)).toBeNull();
});
it("shipment read failures expose retry without showing another account's data", async () => {
  vi.spyOn(api, "get").mockRejectedValueOnce({ message: "Not found" }).mockResolvedValue({ status: "ORDER_PLACED", shipments: [] });
  const { user } = setup(<ShipmentDetails orderId={9} />); await screen.findByText(/Not found/);
  await user.click(screen.getByRole("button", { name: "Retry shipments" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull()); expect(screen.getByText(/not been recorded/)).toBeTruthy();
});
