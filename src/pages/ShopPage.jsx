import { useEffect, useMemo, useRef } from "react";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import ProductCard from "../components/ProductCard";
import { partnerLogos } from "../data/products";
import {
  fetchCategoriesIfNeeded,
  fetchProductsByQuery,
} from "../store/actions";
import {
  calculateOffset,
  calculatePageCount,
  buildPaginationWindow,
} from "../utils/pagination";
import { buildProductDetailPath, buildCategoryPath } from "../utils/slug";
import {
  ALLOWED_SORT_VALUES,
  buildShopSearch,
  normalizeCategoryId,
  normalizeQuery,
  readShopSearch,
} from "../utils/query";
import {
  FALLBACK_PRODUCT_IMAGE,
  toProductCardModel,
} from "../utils/productModel";

function ResultCount({ total, offset, listLength }) {
  if (!total) {
    return <span>Showing 0 of 0 results</span>;
  }

  const start = offset + 1;
  const end = Math.min(offset + listLength, total);
  return (
    <span>
      Showing {start}-{end} of {total} results
    </span>
  );
}

export default function ShopPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const listTopRef = useRef(null);
  const { categoryId: routeCategoryId } = useParams();

  const categories = useSelector((state) => state.product.categories);
  const categoriesFetchState = useSelector(
    (state) => state.product.categoriesFetchState,
  );
  const categoriesError = useSelector((state) => state.product.categoriesError);

  const productList = useSelector((state) => state.product.productList);
  const total = useSelector((state) => state.product.total);
  const fetchState = useSelector((state) => state.product.fetchState);
  const productListError = useSelector(
    (state) => state.product.productListError,
  );

  const searchState = readShopSearch(location.search);
  const category = normalizeCategoryId(routeCategoryId);
  const activePage = searchState.page;
  const limit = 25;

  const activeQuery = useMemo(
    () =>
      normalizeQuery({
        category,
        sort: searchState.sort,
        filter: searchState.filter,
        limit,
        offset: calculateOffset(activePage, limit),
      }),
    [category, searchState.sort, searchState.filter, activePage],
  );

  const sortInputRef = useRef(null);
  const filterInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategoriesIfNeeded());
  }, [dispatch]);

  useEffect(() => {
    const canonicalSearch = buildShopSearch({
      sort: activeQuery.sort,
      filter: activeQuery.filter,
      page: activePage,
    });

    if (canonicalSearch !== location.search) {
      history.replace(`${location.pathname}${canonicalSearch}`);
    }
  }, [
    activePage,
    activeQuery.filter,
    activeQuery.sort,
    history,
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    dispatch(fetchProductsByQuery(activeQuery)).catch(() => {});
  }, [dispatch, activeQuery]);

  const categoriesById = useMemo(
    () =>
      categories.reduce((accumulator, categoryItem) => {
        accumulator[categoryItem.id] = categoryItem;
        return accumulator;
      }, {}),
    [categories],
  );

  const cardProducts = useMemo(
    () =>
      productList
        .map((product) => {
          const categoryItem = categoriesById[product.category_id];
          const cardModel = toProductCardModel(product, categoriesById);

          if (!cardModel) {
            return null;
          }

          return {
            ...cardModel,
            detailPath: categoryItem
              ? buildProductDetailPath(product, categoryItem)
              : null,
          };
        })
        .filter(Boolean),
    [productList, categoriesById],
  );

  const topCategories = useMemo(
    () =>
      [...categories]
        .sort((left, right) => Number(right.rating) - Number(left.rating))
        .slice(0, 5),
    [categories],
  );

  const pageCount = calculatePageCount(total, activeQuery.limit);

  useEffect(() => {
    if (pageCount > 0 && activePage > pageCount) {
      const canonicalSearch = buildShopSearch({
        sort: activeQuery.sort,
        filter: activeQuery.filter,
        page: pageCount,
      });
      history.replace(`${location.pathname}${canonicalSearch}`);
    }
  }, [
    pageCount,
    activePage,
    activeQuery.sort,
    activeQuery.filter,
    history,
    location.pathname,
  ]);

  const paginationWindow = buildPaginationWindow(activePage, pageCount);
  const paginationItems = useMemo(
    () =>
      paginationWindow.reduce(
        (result, value) => {
          if (value === "...") {
            const nextCount = result.ellipsisCount + 1;
            return {
              ellipsisCount: nextCount,
              items: [
                ...result.items,
                { value, key: `ellipsis-${activePage}-${nextCount}` },
              ],
            };
          }

          return {
            ellipsisCount: result.ellipsisCount,
            items: [...result.items, { value, key: `page-${value}` }],
          };
        },
        { ellipsisCount: 0, items: [] },
      ).items,
    [paginationWindow, activePage],
  );
  const isLoadingProducts = fetchState === "FETCHING";
  const isProductFetchFailed = fetchState === "FAILED";
  const isProductFetchSuccessful = fetchState === "FETCHED";

  const applyQueryDrafts = () => {
    const sortValue = sortInputRef.current?.value || "";
    const filterValue = filterInputRef.current?.value || "";

    const sort = ALLOWED_SORT_VALUES.has(sortValue) ? sortValue : "";
    const filter = String(filterValue).trim();
    const nextSearch = buildShopSearch({ sort, filter, page: 1 });
    history.push(`${location.pathname}${nextSearch}`);
  };

  const navigateToPage = (page) => {
    const nextPage = Number(page);

    if (!Number.isFinite(nextPage) || nextPage < 1 || nextPage > pageCount) {
      return;
    }

    const nextSearch = buildShopSearch({
      sort: activeQuery.sort,
      filter: activeQuery.filter,
      page: nextPage,
    });

    history.push(`${location.pathname}${nextSearch}`);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full bg-[#FAFAFA]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-[#252B42]">Shop</h1>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link to="/" className="text-[#252B42] hover:text-[#23A6F0]">
              Home
            </Link>
            <span className="text-[#BDBDBD]">&gt;</span>
            <span className="text-[#737373]">Shop</span>
          </div>
        </div>

        {categoriesFetchState === "FETCHING" && (
          <div className="inline-flex items-center gap-2 text-sm text-[#737373]">
            <Loader2 size={16} className="animate-spin" />
            Loading categories...
          </div>
        )}

        {categoriesFetchState === "FAILED" && (
          <div className="flex flex-col gap-3 rounded border border-[#FFE9EA] bg-[#FFF6F6] p-4">
            <p className="text-sm text-[#E74040]">
              {categoriesError?.message || "Categories could not be loaded."}
            </p>
            <button
              type="button"
              onClick={() => dispatch(fetchCategoriesIfNeeded({ force: true }))}
              className="w-fit rounded bg-[#23A6F0] px-4 py-2 text-sm font-semibold text-white"
            >
              Retry categories
            </button>
          </div>
        )}

        {topCategories.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {topCategories.map((categoryItem) => (
              <Link
                to={buildCategoryPath(categoryItem)}
                key={categoryItem.id}
                className="relative h-56 w-full overflow-hidden sm:w-[calc(50%-8px)] md:w-[calc((100%-64px)/5)]"
              >
                <img
                  src={categoryItem.img}
                  alt={categoryItem.title}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 text-white">
                  <h2 className="text-base font-bold tracking-wide">
                    {categoryItem.title}
                  </h2>
                  <p className="text-sm">
                    Rating {Number(categoryItem.rating).toFixed(1)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        className="w-full border-y border-[#E8E8E8] bg-white"
        ref={listTopRef}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-[#737373]">
            <ResultCount
              total={total}
              offset={activeQuery.offset}
              listLength={cardProducts.length}
            />
          </p>

          <div
            className="flex w-full gap-3 md:w-auto"
            key={`${location.pathname}${location.search}`}
          >
            <select
              ref={sortInputRef}
              aria-label="Sort products"
              defaultValue={activeQuery.sort}
              className="h-10 flex-1 rounded border border-[#DDDDDD] px-3 text-sm text-[#737373] md:w-44 md:flex-none"
            >
              <option value="">Sort by</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="rating:asc">Rating: Low to High</option>
              <option value="rating:desc">Rating: High to Low</option>
            </select>

            <input
              ref={filterInputRef}
              type="text"
              aria-label="Filter products"
              defaultValue={activeQuery.filter}
              className="h-10 flex-1 rounded border border-[#DDDDDD] px-3 text-sm text-[#737373] md:w-52 md:flex-none"
              placeholder="Filter products"
            />

            <button
              type="button"
              onClick={applyQueryDrafts}
              className="h-10 rounded bg-[#23A6F0] px-4 text-sm font-semibold text-white hover:bg-[#1B8FD8]"
            >
              Apply
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        {isLoadingProducts && (
          <div
            className="flex min-h-52 items-center justify-center"
            aria-live="polite"
          >
            <div className="inline-flex items-center gap-2 text-sm text-[#737373]">
              <Loader2 size={18} className="animate-spin" />
              Loading products...
            </div>
          </div>
        )}

        {isProductFetchFailed && (
          <div
            className="flex flex-col gap-3 rounded border border-[#FFE9EA] bg-[#FFF6F6] p-4"
            role="alert"
          >
            <p className="text-sm text-[#E74040]">
              {productListError?.message || "Products could not be loaded."}
            </p>
            <button
              type="button"
              onClick={() =>
                dispatch(fetchProductsByQuery(activeQuery, { force: true }))
              }
              className="w-fit rounded bg-[#23A6F0] px-4 py-2 text-sm font-semibold text-white"
            >
              Retry products
            </button>
          </div>
        )}

        {isProductFetchSuccessful && cardProducts.length === 0 && (
          <div className="rounded border border-[#E8E8E8] bg-white p-6 text-sm text-[#737373]">
            No products found for this query.
          </div>
        )}

        {isProductFetchSuccessful && cardProducts.length > 0 && (
          <>
            <div className="flex flex-wrap gap-6">
              {cardProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex w-full flex-col items-center text-center sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)]"
                >
                  <ProductCard product={product} to={product.detailPath} />
                </div>
              ))}
            </div>

            {pageCount > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-2"
                aria-label="Products pagination"
              >
                <button
                  type="button"
                  disabled={activePage <= 1 || isLoadingProducts}
                  onClick={() => navigateToPage(activePage - 1)}
                  className="h-10 min-w-20 rounded border border-[#DDDDDD] px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {paginationItems.map(({ value, key }) => {
                  if (value === "...") {
                    return (
                      <span
                        key={key}
                        className="px-1 text-sm text-[#737373]"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = value === activePage;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => navigateToPage(value)}
                      disabled={isLoadingProducts}
                      aria-current={isActive ? "page" : undefined}
                      className={`h-10 min-w-10 rounded border px-3 text-sm ${
                        isActive
                          ? "border-[#23A6F0] bg-[#23A6F0] text-white"
                          : "border-[#DDDDDD] text-[#252B42]"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {value}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={activePage >= pageCount || isLoadingProducts}
                  onClick={() => navigateToPage(activePage + 1)}
                  className="h-10 min-w-20 rounded border border-[#DDDDDD] px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      <section className="w-full border-t border-[#E8E8E8] bg-[#FAFAFA]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-6 px-4 py-10 text-[#737373]">
          {partnerLogos.map((logo) => (
            <p
              key={logo}
              className="w-[calc(50%-12px)] text-center text-4xl font-bold text-[#8A8A8A] sm:w-[calc(33.333%-16px)] md:w-[calc(20%-19.2px)]"
            >
              {logo}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
