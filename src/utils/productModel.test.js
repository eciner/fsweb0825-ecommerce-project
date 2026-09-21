import { describe, expect, it } from "vitest";

import { toProductCardModel, toProductDetailModel } from "./productModel";

describe("product model utilities", () => {
  it("maps API product without fabricated discount/reviews", () => {
    const model = toProductCardModel(
      {
        id: 322,
        name: "Gri Regular Astar",
        description: "desc",
        price: 461.99,
        stock: 140,
        category_id: 3,
        rating: 7,
        sell_count: 281,
        images: [{ url: "a.jpg", index: 2 }, { url: "b.jpg", index: 0 }],
      },
      { 3: { title: "Ceket" } },
    );

    expect(model.price).toBe(461.99);
    expect(model.rating).toBe(5);
    expect(model.sellCount).toBe(281);
    expect(model.image).toBe("b.jpg");
  });

  it("sorts detail images by index", () => {
    const detail = toProductDetailModel(
      {
        id: 1,
        name: "A",
        price: 1,
        stock: 1,
        category_id: 2,
        rating: 3.5,
        sell_count: 4,
        images: [{ url: "img2", index: 2 }, { url: "img1", index: 1 }],
      },
      {},
    );

    expect(detail.images).toEqual(["img1", "img2"]);
  });
});
