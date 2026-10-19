import { expect, it } from "vitest";
import { requireBuildApiTarget } from "../../config/apiTarget.js";

it("rejects missing and unsafe build targets without echoing their values", () => {
  for (const value of [undefined, "", " ", "/api", "file:///api", "https://user:secret@example.test", "https://example.test?secret=hidden", "https://example.test#hidden"]) {
    expect(() => requireBuildApiTarget(value)).toThrow(/VITE_API_URL/);
  }
});
it("accepts explicit deployment and local verification API targets", () => {
  for (const value of ["https://example.test", "http://127.0.0.1:8083", "http://localhost:8080"]) {
    expect(() => requireBuildApiTarget(value)).not.toThrow();
  }
});
