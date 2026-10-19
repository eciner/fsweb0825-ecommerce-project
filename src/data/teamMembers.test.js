import { expect, it } from "vitest";
import { teamMembers } from "./teamMembers";

it("lists exactly the seven supplied contributors without unverified photos or social identities", () => {
  expect(teamMembers.map((member) => member.name)).toEqual([
    "Emre Ciner",
    "Hazal Tuncay",
    "Jurgen Hifzi",
    "Serhat Salih Karaca",
    "Kürşat Tarı",
    "Mert Selçuk",
    "Özge Ciner",
  ]);
  expect(new Set(teamMembers.map((member) => member.id)).size).toBe(7);
  for (const member of teamMembers) {
    expect(member.role).toBeTruthy();
    expect(member.responsibility).toBeTruthy();
    expect(member).not.toHaveProperty("image");
    expect(member).not.toHaveProperty("social");
  }
});
