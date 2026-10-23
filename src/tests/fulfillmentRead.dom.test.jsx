// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import api from "../services/api";
import reducer from "../store/reducer";
import { setUser } from "../store/actions";
import FulfillmentPage from "../pages/FulfillmentPage";

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function setup() {
  const store = createStore(reducer);
  store.dispatch(setUser({ id: 1, email: "store@example.test", role_code: "store" }));
  const history = createMemoryHistory({ initialEntries: ["/fulfillment"] });
  render(<Provider store={store}><Router history={history}><FulfillmentPage /></Router></Provider>);
  return history;
}
const emptyPage = { shipments: [], total: 11 };
beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("fulfillment reads", () => {
  it("ends loading on initial failure and recovers through explicit retry", async () => {
    const first = deferred(), retry = deferred();
    const get = vi.spyOn(api, "get").mockReturnValueOnce(first.promise).mockReturnValueOnce(retry.promise);
    setup();
    expect(screen.getByText("Loading shipments\u2026")).toBeTruthy();
    await act(async () => first.reject({ message: "Initial read failed" }));
    expect(screen.getByRole("alert").textContent).toBe("Initial read failed");
    expect(screen.queryByText("Loading shipments\u2026")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Refresh shipments" }));
    expect(get).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Loading shipments\u2026")).toBeTruthy();
    await act(async () => retry.resolve(emptyPage));
    expect(screen.queryByText("Loading shipments\u2026")).toBeNull();
    expect(screen.getByText("No shipments match this account and filter.")).toBeTruthy();
  });

  it.each(["filter", "page"])("ends loading after a %s request failure and recovers", async (change) => {
    const first = deferred(), next = deferred(), retry = deferred();
    const get = vi.spyOn(api, "get").mockReturnValueOnce(first.promise).mockReturnValueOnce(next.promise).mockReturnValueOnce(retry.promise);
    setup();
    await act(async () => first.resolve(emptyPage));
    if (change === "filter") fireEvent.change(screen.getByRole("combobox", { name: "Shipment status" }), { target: { value: "SHIPPED" } });
    else fireEvent.click(screen.getByRole("button", { name: "Next shipments" }));
    expect(get.mock.calls[1][0]).toBe(change === "filter" ? "/fulfillment/shipments?page=0&size=10&status=SHIPPED" : "/fulfillment/shipments?page=1&size=10");
    await act(async () => next.reject({ message: "Changed read failed" }));
    expect(screen.getByRole("alert").textContent).toBe("Changed read failed");
    expect(screen.queryByText("Loading shipments\u2026")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Refresh shipments" }));
    expect(screen.queryByRole("alert")).toBeNull();
    await act(async () => retry.resolve(emptyPage));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Loading shipments\u2026")).toBeNull();
    expect(screen.getByText("No shipments match this account and filter.")).toBeTruthy();
  });

  it.each(["resolve", "reject"])("ignores an old request that later %ss after parameters change", async (outcome) => {
    const first = deferred(), current = deferred();
    vi.spyOn(api, "get").mockReturnValueOnce(first.promise).mockReturnValueOnce(current.promise);
    setup();
    fireEvent.change(screen.getByRole("combobox", { name: "Shipment status" }), { target: { value: "SHIPPED" } });
    await act(async () => current.resolve(emptyPage));
    await act(async () => outcome === "resolve" ? first.resolve({ shipments: [], total: 0 }) : first.reject({ message: "Stale error" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Loading shipments\u2026")).toBeNull();
    expect(screen.getByRole("button", { name: "Next shipments" }).disabled).toBe(false);
  });
});
