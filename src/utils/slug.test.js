import { describe, expect, it } from "vitest";

import { buildProductDetailPath, slugify } from "./slug";

describe("slug and route utilities", () => {
  it("normalizes Turkish characters", () => {
    expect(slugify("Gri Regular Astar Çeşit Şıklık")).toBe("gri-regular-astar-cesit-siklik");
  });

  it("builds canonical product detail path", () => {
    const path = buildProductDetailPath(
      { id: 322, name: "Gri Regular Astar", category_id: 3 },
      { id: 3, title: "Ceket", gender: "k" },
    );

    expect(path).toBe("/shop/kadin/ceket/3/gri-regular-astar/322");
  });
});
