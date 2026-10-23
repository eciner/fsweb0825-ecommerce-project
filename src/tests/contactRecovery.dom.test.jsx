// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import api from "../services/api";
import ContactForm from "../pages/ContactForm";
beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it("retains one identity but cannot submit edited text after an uncertain committed response", async () => {
  const stored = new Map();
  const post = vi.spyOn(api, "post").mockImplementation(async (_path, payload) => {
    const old = stored.get(payload.submission_id);
    if (!old) { stored.set(payload.submission_id, { ...payload }); throw { message: "Outcome uncertain" }; }
    if (old.message !== payload.message) throw { status: 409, message: "Submission reference has already been used." };
    return { reference: payload.submission_id };
  });
  render(<MemoryRouter><ContactForm /></MemoryRouter>);
  const user = userEvent.setup();
  for (const [label, value] of [["Name", "Synthetic Sender"], ["Email", "sender@example.test"], ["Subject", "Local recovery"], ["Message", "Original synthetic message."]])
    await user.type(screen.getByLabelText(label, { exact: true }), value);
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Outcome uncertain");
  const message = screen.getByLabelText("Message", { exact: true });
  await user.clear(message);
  await user.type(message, "Edited synthetic message after lost response.");
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Submission reference has already been used.");
  expect(post.mock.calls[0][1].submission_id).toBe(post.mock.calls[1][1].submission_id);
  expect(stored.size).toBe(1);
  expect([...stored.values()][0].message).toBe("Original synthetic message.");
});
