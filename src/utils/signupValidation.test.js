import { describe, expect, it } from "vitest";

import {
  getDefaultSignupRoleId,
  getPublicSignupRoles,
  isValidStoreTaxNumber,
  isValidTurkishIban,
  isValidTurkishMobilePhone,
  normalizeIban,
  normalizeTaxNumber,
  normalizeTurkishPhone,
  trimText,
} from "./signupValidation";

describe("signup validation utilities", () => {
  it("keeps only customer and store roles for public signup", () => {
    expect(
      getPublicSignupRoles([
        { id: 847, code: "admin" },
        { id: 54, code: "store" },
        { id: 326, code: "customer" },
        { id: 901, code: "future-privileged-role" },
      ]),
    ).toEqual([
      { id: 54, code: "store" },
      { id: 326, code: "customer" },
    ]);
  });

  it("defaults to the customer role regardless of API role order", () => {
    const adminRole = { id: 847, code: "admin" };
    const storeRole = { id: 54, code: "store" };
    const customerRole = { id: 326, code: "customer" };

    for (const roles of [
      [adminRole, storeRole, customerRole],
      [customerRole, adminRole, storeRole],
      [storeRole, customerRole, adminRole],
    ]) {
      expect(getDefaultSignupRoleId(roles)).toBe(String(customerRole.id));
    }
  });

  it("does not fall back to store or admin when customer is missing", () => {
    expect(
      getDefaultSignupRoleId([
        { id: 847, code: "admin" },
        { id: 54, code: "store" },
      ]),
    ).toBe("");
  });

  it("handles empty and malformed role responses safely", () => {
    for (const roles of [undefined, null, {}, "customer", []]) {
      expect(getPublicSignupRoles(roles)).toEqual([]);
      expect(getDefaultSignupRoleId(roles)).toBe("");
    }

    expect(
      getDefaultSignupRoleId([
        null,
        {},
        { code: "customer" },
        { id: null, code: "customer" },
      ]),
    ).toBe("");
  });

  it("trims text before length-sensitive validation", () => {
    expect(trimText("   ")).toBe("");
    expect(trimText("  Ada  ")).toBe("Ada");
  });

  it("normalizes Turkish mobile numbers to leading-zero format", () => {
    expect(normalizeTurkishPhone("+90 532 123 45 67")).toBe("05321234567");
    expect(normalizeTurkishPhone("5321234567")).toBe("05321234567");
    expect(isValidTurkishMobilePhone("0532 123 45 67")).toBe(true);
    expect(isValidTurkishMobilePhone("0212 123 45 67")).toBe(false);
  });

  it("normalizes and validates store tax numbers", () => {
    expect(normalizeTaxNumber(" t1234v123456 ")).toBe("T1234V123456");
    expect(isValidStoreTaxNumber("T1234V123456")).toBe(true);
    expect(isValidStoreTaxNumber("T123V123456")).toBe(false);
  });

  it("validates Turkish IBAN structure and checksum", () => {
    expect(normalizeIban("tr33 0006 1005 1978 6457 8413 26")).toBe(
      "TR330006100519786457841326",
    );
    expect(isValidTurkishIban("TR330006100519786457841326")).toBe(true);
    expect(isValidTurkishIban("TR330006100519786457841327")).toBe(false);
    expect(isValidTurkishIban("DE89370400440532013000")).toBe(false);
  });
});
