// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import InformationPage from "../pages/InformationPage";
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it.each(["#open-positions", "#%6fpen-positions"])(
  "focuses valid direct and transitioned anchor %s",
  (hash) => {
    const history = createMemoryHistory({
      initialEntries: ["/careers" + hash],
    });
    render(
      <Router history={history}>
        <InformationPage />
      </Router>,
    );
    const target = document.getElementById("open-positions");
    expect(document.activeElement).toBe(target);
    expect(target.scrollIntoView).toHaveBeenCalled();
    act(() => history.push("/privacy"));
    act(() => history.push("/careers" + hash));
    expect(document.activeElement).toBe(
      document.getElementById("open-positions"),
    );
  },
);
it.each(["", "#unknown", "#%", "#%2", "#%E0%A4%A", "#%FF"])(
  "ignores empty, unknown or malformed fragment %s",
  (hash) => {
    const history = createMemoryHistory({
      initialEntries: ["/careers" + hash],
    });
    expect(() =>
      render(
        <Router history={history}>
          <InformationPage />
        </Router>,
      ),
    ).not.toThrow();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    act(() => history.push("/privacy"));
    expect(() => act(() => history.push("/careers" + hash))).not.toThrow();
  },
);
