import { useEffect, useMemo, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  addCartItem,
  fetchCategoriesIfNeeded,
  fetchProductDetail,
} from "../store/actions";
import {
  FALLBACK_PRODUCT_IMAGE,
  toProductDetailModel,
} from "../utils/productModel";
import { buildCategoryPath, buildProductDetailPath } from "../utils/slug";

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
}

function isRetryableStatus(status) {
  return status === null || status >= 500;
}

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    gender,
    categoryName,
    categoryId: routeCategoryId,
    productNameSlug,
    productId,
  } = useParams();

  const categories = useSelector((state) => state.product.categories);
  const selectedProduct = useSelector((state) => state.product.selectedProduct);
  const selectedProductId = useSelector(
    (state) => state.product.selectedProductId,
  );
  const selectedProductFetchState = useSelector(
    (state) => state.product.selectedProductFetchState,
  );
  const selectedProductError = useSelector(
    (state) => state.product.selectedProductError,
  );

  const parsedProductId = Number.parseInt(String(productId), 10);

  useEffect(() => {
    dispatch(fetchCategoriesIfNeeded());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProductDetail(parsedProductId)).catch(() => {});
  }, [dispatch, parsedProductId]);

  const categoriesById = useMemo(
    () =>
      categories.reduce((accumulator, category) => {
        accumulator[category.id] = category;
        return accumulator;
      }, {}),
    [categories],
  );

  const product = useMemo(
    () => toProductDetailModel(selectedProduct, categoriesById),
    [selectedProduct, categoriesById],
  );

  const resolvedCategory =
    categoriesById[product?.categoryId] ||
    categoriesById[Number.parseInt(String(routeCategoryId), 10)] ||
    null;

  const canonicalPath = useMemo(() => {
    if (
      !product ||
      !resolvedCategory ||
      !Number.isFinite(parsedProductId) ||
      parsedProductId <= 0
    ) {
      return null;
    }

    return buildProductDetailPath(selectedProduct, resolvedCategory);
  }, [product, parsedProductId, selectedProduct, resolvedCategory]);

  useEffect(() => {
    if (
      selectedProductFetchState !== "FETCHED" ||
      !canonicalPath ||
      !Number.isFinite(parsedProductId)
    ) {
      return;
    }

    const expected = canonicalPath;
    const current = `/shop/${gender}/${categoryName}/${routeCategoryId}/${productNameSlug}/${parsedProductId}`;

    if (expected !== current) {
      history.replace(expected);
    }
  }, [
    canonicalPath,
    categoryName,
    gender,
    history,
    parsedProductId,
    productNameSlug,
    routeCategoryId,
    selectedProductFetchState,
  ]);

  const [selectedImageState, setSelectedImageState] = useState({
    productId: null,
    index: 0,
  });

  const images = product?.images || [FALLBACK_PRODUCT_IMAGE];
  const selectedImageIndex =
    selectedImageState.productId === selectedProductId
      ? selectedImageState.index
      : 0;

  const safeImageIndex = Math.min(
    Math.max(selectedImageIndex, 0),
    Math.max(images.length - 1, 0),
  );
  const selectedImage = images[safeImageIndex] || FALLBACK_PRODUCT_IMAGE;

  const handleBack = () => {
    if (window.history.length > 1) {
      history.goBack();
      return;
    }

    if (resolvedCategory) {
      history.push(buildCategoryPath(resolvedCategory));
      return;
    }

    history.push("/shop");
  };

  const handleRetry = () => {
    dispatch(fetchProductDetail(parsedProductId, { force: true }));
  };

  const isLoading = selectedProductFetchState === "FETCHING";
  const isFailed = selectedProductFetchState === "FAILED";

  return (
    <div className="w-full bg-[#FAFAFA]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <Link
            to="/"
            className="text-[#252B42] transition hover:text-[#23A6F0]"
          >
            Home
          </Link>
          <span className="text-[#BDBDBD]">&gt;</span>
          <Link
            to="/shop"
            className="text-[#737373] transition hover:text-[#23A6F0]"
          >
            Shop
          </Link>
          {resolvedCategory && (
            <>
              <span className="text-[#BDBDBD]">&gt;</span>
              <Link
                to={buildCategoryPath(resolvedCategory)}
                className="text-[#737373] transition hover:text-[#23A6F0]"
              >
                {resolvedCategory.title}
              </Link>
            </>
          )}
          {product?.title && (
            <>
              <span className="text-[#BDBDBD]">&gt;</span>
              <span className="text-[#252B42]">{product.title}</span>
            </>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded border border-[#DDDDDD] bg-white px-3 py-2 text-sm font-semibold text-[#252B42] hover:border-[#23A6F0]"
            aria-label="Go back"
          >
            Back
          </button>
        </div>

        {isLoading && (
          <section
            className="mt-8 flex min-h-72 items-center justify-center rounded bg-white"
            aria-live="polite"
          >
            <div className="inline-flex items-center gap-2 text-sm text-[#737373]">
              <Loader2 size={18} className="animate-spin" />
              Loading product...
            </div>
          </section>
        )}

        {isFailed && (
          <section
            className="mt-8 rounded border border-[#FFE9EA] bg-[#FFF6F6] p-4"
            role="alert"
          >
            <p className="text-sm text-[#E74040]">
              {selectedProductError?.status === 404
                ? "Product not found."
                : selectedProductError?.message ||
                  "Product could not be loaded."}
            </p>
            <div className="mt-3 flex gap-3">
              {isRetryableStatus(selectedProductError?.status) && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded bg-[#23A6F0] px-4 py-2 text-sm font-semibold text-white"
                >
                  Retry
                </button>
              )}
              <Link
                to={
                  resolvedCategory
                    ? buildCategoryPath(resolvedCategory)
                    : "/shop"
                }
                className="rounded border border-[#DDDDDD] bg-white px-4 py-2 text-sm font-semibold text-[#252B42]"
              >
                Back to Shop
              </Link>
            </div>
          </section>
        )}

        {!isLoading && !isFailed && product && (
          <section className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="w-full lg:w-[52%]">
              <div className="relative overflow-hidden bg-white">
                <img
                  src={selectedImage}
                  alt={product.title}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                  }}
                  className="h-75 w-full object-cover sm:h-105"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageState((current) => {
                          const currentIndex =
                            current.productId === selectedProductId
                              ? current.index
                              : 0;
                          return {
                            productId: selectedProductId,
                            index:
                              currentIndex === 0
                                ? images.length - 1
                                : currentIndex - 1,
                          };
                        })
                      }
                      className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#737373]"
                      aria-label="Show previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageState((current) => {
                          const currentIndex =
                            current.productId === selectedProductId
                              ? current.index
                              : 0;
                          return {
                            productId: selectedProductId,
                            index: (currentIndex + 1) % images.length,
                          };
                        })
                      }
                      className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#737373]"
                      aria-label="Show next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 flex items-center gap-4">
                  {images.map((image, index) => {
                    const isCurrent = index === safeImageIndex;
                    return (
                      <button
                        type="button"
                        key={`${product.id}-${index}`}
                        onClick={() =>
                          setSelectedImageState({
                            productId: selectedProductId,
                            index,
                          })
                        }
                        aria-label={`Select image ${index + 1}`}
                        aria-current={isCurrent ? "true" : undefined}
                        className={`overflow-hidden border transition ${
                          isCurrent ? "border-[#23A6F0]" : "border-transparent"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                          className="h-20 w-24 object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex w-full flex-col lg:w-[48%]">
              <h1 className="text-2xl font-semibold text-[#252B42]">
                {product.title}
              </h1>

              <p className="mt-4 text-sm font-semibold text-[#737373]">
                Rating {product.rating.toFixed(2)} / 5
              </p>
              <p className="mt-1 text-sm text-[#737373]">
                {product.sellCount} sold
              </p>

              <p className="mt-5 text-3xl font-bold text-[#252B42]">
                {formatCurrency(product.price)}
              </p>

              <p className="mt-4 text-sm font-semibold text-[#737373]">
                {product.stock > 0
                  ? `In Stock - ${product.stock} available`
                  : "Out of Stock"}
              </p>

              <p className="mt-6 max-w-lg text-sm leading-6 text-[#858585]">
                {product.description}
              </p>

              <div className="mt-8 border-t border-[#E8E8E8] pt-6">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  className="h-11 rounded bg-[#23A6F0] px-6 text-sm font-semibold text-white hover:bg-[#1B8FD8] disabled:cursor-not-allowed disabled:bg-[#BDBDBD]"
                  onClick={() => {
                    dispatch(addCartItem(selectedProduct));
                    toast.success("Product added to cart.");
                  }}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <section className="w-full border-t border-[#E8E8E8] bg-[#FAFAFA]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-6 px-4 py-10 text-[#737373]">
          {["Hooli", "Lyft", "Stripe", "AWS", "Reddit"].map((logo) => (
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
