// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { applyMiddleware, legacy_createStore as createStore } from "redux";
import { thunk } from "redux-thunk";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { toast } from "react-toastify";
import api, { clearAuthToken } from "../services/api";
import reducer from "../store/reducer";
import { loginUser, logoutUser } from "../store/actions";
import LoginPage from "../pages/LoginPage";
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.localStorage.clear(); clearAuthToken(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.clearAllMocks(); clearAuthToken(); });
it.each(["logout", "newer-login"])("does not navigate or toast for a stale form login after %s", async (outcome) => {
  let resolve;
  const pending = new Promise(yes => { resolve = yes; });
  const post = vi.spyOn(api, "post").mockReturnValueOnce(pending);
  const store = createStore(reducer, applyMiddleware(thunk));
  const history = createMemoryHistory({ initialEntries: ["/login"] });
  render(<Provider store={store}><Router history={history}><LoginPage /></Router></Provider>);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@example.test" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "SyntheticLogin1!" } });
  fireEvent.click(screen.getByRole("button", { name: /log in|login|sign in/i }));
  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  await act(async () => {
    if (outcome === "logout") store.dispatch(logoutUser());
    else {
      post.mockResolvedValueOnce({ token: "current-b-token", email: "b@example.test" });
      await store.dispatch(loginUser({ email: "b@example.test", password: "synthetic", rememberMe: false }));
    }
    resolve({ token: "stale-a-token", email: "a@example.test" });
    await pending;
  });
  expect(history.location.pathname).toBe("/login");
  expect(toast.success).not.toHaveBeenCalled();
  expect(toast.error).not.toHaveBeenCalled();
  expect(store.getState().client.user.email).toBe(outcome === "logout" ? undefined : "b@example.test");
});
