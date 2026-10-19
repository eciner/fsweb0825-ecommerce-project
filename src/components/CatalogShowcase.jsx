import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoriesIfNeeded,
  fetchProductsByQuery,
} from "../store/actions";
import { toProductCardModel } from "../utils/productModel";
import { buildProductDetailPath } from "../utils/slug";
import { createQueryKey } from "../utils/query";
import ProductCard from "./ProductCard";

const query = { sort: "rating:desc", limit: 8, offset: 0 };

export default function CatalogShowcase() {
  const dispatch = useDispatch();
  const inventoryRevision = useSelector(
    (state) => state.product.inventoryRevision,
  );
  const {
    categories,
    productList,
    fetchState,
    productListError,
    activeQueryKey,
  } = useSelector((state) => state.product);
  useEffect(() => {
    dispatch(fetchCategoriesIfNeeded());
    dispatch(fetchProductsByQuery(query)).catch(() => {});
  }, [dispatch, inventoryRevision]);
  const current = activeQueryKey === createQueryKey(query);
  const byId = useMemo(
    () =>
      Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories],
  );
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-16"
      aria-labelledby="featured-catalog"
    >
      <div className="mb-10 text-center">
        <p className="text-sm text-muted">From the current catalog</p>
        <h2 id="featured-catalog" className="text-2xl font-bold">
          Featured products
        </h2>
        <p className="text-sm text-muted">
          Current prices and availability from our store.
        </p>
      </div>
      {(!current || fetchState === "FETCHING") && (
        <p role="status">Loading products…</p>
      )}
      {current && fetchState === "FAILED" && (
        <div role="alert">
          <p>{productListError?.message}</p>
          <button
            onClick={() =>
              dispatch(fetchProductsByQuery(query, { force: true })).catch(
                () => {},
              )
            }
          >
            Retry products
          </button>
        </div>
      )}
      {current && fetchState === "FETCHED" && !productList.length && (
        <p>No products available.</p>
      )}
      <div className="flex flex-wrap gap-6">
        {current &&
          fetchState === "FETCHED" &&
          productList.map((product) => (
            <div
              key={product.id}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
            >
              <ProductCard
                product={toProductCardModel(product, byId)}
                to={
                  byId[product.category_id]
                    ? buildProductDetailPath(product, byId[product.category_id])
                    : null
                }
              />
            </div>
          ))}
      </div>
    </section>
  );
}
