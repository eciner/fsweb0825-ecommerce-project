import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchFavorites, fetchCategoriesIfNeeded } from "../store/actions";
import ProductCard from "../components/ProductCard";
import { toProductCardModel } from "../utils/productModel";
import { buildProductDetailPath } from "../utils/slug";

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const {
    user,
    favorites,
    favoritesFetchState,
    favoritesError,
    sessionRevision,
  } = useSelector((state) => state.client);
  const categories = useSelector((state) => state.product.categories);
  const byId = useMemo(
    () =>
      Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories],
  );
  useEffect(() => {
    if (user.email)
      dispatch((send, getState) => {
        if (getState().client.favoritesFetchState === "NOT_FETCHED")
          return send(fetchFavorites()).catch(() => {});
      });
    dispatch(fetchCategoriesIfNeeded());
  }, [dispatch, user.email, sessionRevision]);
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12">
      <h1 className="text-3xl font-bold">Your favorites</h1>
      {!user.email ? (
        <p>
          <Link
            to={{ pathname: "/login", state: { from: "/favorites" } }}
            className="font-bold text-action"
          >
            Sign in
          </Link>{" "}
          to save favorites to your account across sessions. Guest favorites are
          not stored.
        </p>
      ) : (
        <>
          {favoritesFetchState === "FETCHING" && (
            <p role="status">Loading favorites…</p>
          )}
          {favoritesError && (
            <div role="alert">
              <p>{favoritesError}</p>
              <button
                className="font-bold text-action"
                onClick={() => dispatch(fetchFavorites()).catch(() => {})}
              >
                Retry
              </button>
            </div>
          )}
          {favoritesFetchState === "FETCHED" && !favorites.length && (
            <p>
              No saved favorites yet.{" "}
              <Link to="/shop" className="text-action">
                Browse products
              </Link>
            </p>
          )}
          <div className="flex flex-wrap gap-6">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
              >
                <ProductCard
                  product={toProductCardModel(product, byId)}
                  to={
                    byId[product.category_id]
                      ? buildProductDetailPath(
                          product,
                          byId[product.category_id],
                        )
                      : null
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
