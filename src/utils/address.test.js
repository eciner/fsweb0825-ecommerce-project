import { expect, it } from "vitest";
import { addressPayload, normalizePhone } from "./address";
import {
  turkishProvinces,
  suggestedDistricts,
  suggestedNeighborhoods,
} from "../data/locations";

it("normalizes local and existing international phones without a fixed local length", () => {
  expect(normalizePhone("+90", "0555 111 22 33")).toBe("+905551112233");
  expect(normalizePhone("+90", "+44 20 7946 0000")).toBe("+442079460000");
  expect(normalizePhone("+49", "030 123456")).toBe("+4930123456");
});
it("keeps compatible address details and validates phone and combined size", () => {
  const values = {
    title: " Home ",
    name: "A",
    surname: "B",
    city: "City",
    district: "District",
    neighborhood: "Street 1 apartment 2 ZIP 123",
    neighborhoodName: "Area",
    dialCode: "+90",
    phone: "05551112233",
  };
  expect(addressPayload(values, 7)).toMatchObject({
    id: 7,
    title: "Home",
    neighborhood: "Area\nStreet 1 apartment 2 ZIP 123",
    phone: "+905551112233",
  });
  expect(() => addressPayload({ ...values, phone: "123" })).toThrow();
  expect(() =>
    addressPayload({ ...values, neighborhood: "x".repeat(500) }),
  ).toThrow();
});
it("offers 81 distinct provinces with explicit empty suggestion fallback", () => {
  expect(new Set(turkishProvinces).size).toBe(81);
  expect(suggestedDistricts("İstanbul")).toContain("Kadıköy");
  expect(suggestedNeighborhoods("İstanbul", "Kadıköy")).toContain("Caferağa");
  expect(suggestedDistricts("Unknown city")).toEqual([]);
});
