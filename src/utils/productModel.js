const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 320'%3E%3Crect width='480' height='320' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999999' font-size='16' font-family='Arial'%3EImage unavailable%3C/text%3E%3C/svg%3E";

function numberOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getProductImage(product) {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const sorted = [...product.images].sort((a, b) => {
      const left = Number(a?.index ?? 0);
      const right = Number(b?.index ?? 0);
      return left - right;
    });
    const first = sorted.find((item) => item?.url);
    if (first?.url) {
      return first.url;
    }
  }

  if (product?.image) {
    return product.image;
  }

  return FALLBACK_PRODUCT_IMAGE;
}

function toLocalProductStock(product) {
  if (typeof product.inStock === "boolean") {
    return product.inStock ? 1 : 0;
  }

  return 1;
}

export function toProductCardModel(product, categoriesById = {}) {
  if (!product) {
    return null;
  }

  const hasApiShape = Object.hasOwn(product, "category_id");

  if (hasApiShape) {
    const categoryTitle = categoriesById[product.category_id]?.title || `Category #${product.category_id}`;
    const price = numberOr(product.price, 0);
    const rating = clamp(numberOr(product.rating, 0), 0, 5);

    return {
      id: numberOr(product.id, 0),
      title: product.name || "Unnamed Product",
      category: categoryTitle,
      description: product.description || "",
      price,
      rating,
      sellCount: numberOr(product.sell_count, 0),
      stock: numberOr(product.stock, 0),
      inStock: numberOr(product.stock, 0) > 0,
      categoryId: numberOr(product.category_id, 0),
      image: getProductImage(product),
      raw: product,
      source: "api",
    };
  }

  return {
    id: numberOr(product.id, 0),
    title: product.title || product.name || "Unnamed Product",
    category: product.category || "General",
    description: product.description || "",
    price: numberOr(product.price, 0),
    rating: clamp(numberOr(product.rating, 0), 0, 5),
    sellCount: numberOr(product.reviews, numberOr(product.sell_count, 0)),
    stock: toLocalProductStock(product),
    inStock: typeof product.inStock === "boolean" ? product.inStock : true,
    categoryId: numberOr(product.category_id, 0),
    image: getProductImage(product),
    raw: product,
    source: "local",
  };
}

export function toProductDetailModel(product, categoriesById = {}) {
  if (!product) {
    return null;
  }

  const cardModel = toProductCardModel(product, categoriesById);
  if (!cardModel) {
    return null;
  }

  return {
    ...cardModel,
    description: product.description || cardModel.description || "No description available.",
    images: getProductGalleryImages(cardModel),
  };
}

export function getProductGalleryImages(productModel, fallbackImages = []) {
  if (Array.isArray(productModel?.raw?.images) && productModel.raw.images.length > 0) {
    const images = [...productModel.raw.images]
      .sort((a, b) => Number(a?.index ?? 0) - Number(b?.index ?? 0))
      .map((item) => item?.url)
      .filter(Boolean);

    if (images.length > 0) {
      return images;
    }
  }

  const withFallback = [productModel?.image, ...fallbackImages].filter(Boolean);
  return withFallback.length > 0 ? withFallback : [FALLBACK_PRODUCT_IMAGE];
}

export { FALLBACK_PRODUCT_IMAGE };
