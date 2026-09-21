const TURKISH_CHAR_MAP = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function slugify(value = "") {
  const normalized = String(value)
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join("")
    .toLowerCase();

  return normalized
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function genderCodeToSlug(genderCode = "") {
  if (genderCode === "k") return "kadin";
  if (genderCode === "e") return "erkek";
  return slugify(genderCode || "kategori");
}

export function buildCategoryPath(category) {
  const genderSlug = genderCodeToSlug(category?.gender);
  const codePart = String(category?.code || "").split(":")[1] || category?.title;
  const categorySlug = slugify(codePart || "kategori");

  return `/shop/${genderSlug}/${categorySlug}/${category?.id}`;
}

function getCategoryTitleFromCode(code = "") {
  return String(code).split(":")[1] || "";
}

export function buildProductDetailPath(product, category) {
  const productId = Number(product?.id);
  const categoryId = Number(category?.id ?? product?.category_id);

  const genderSlug = genderCodeToSlug(category?.gender || "kategori");
  const categoryTitle =
    category?.title || getCategoryTitleFromCode(category?.code) || "kategori";
  const categorySlug = slugify(categoryTitle || "kategori");

  const productSlug = slugify(product?.name || product?.title || "urun");

  return `/shop/${genderSlug}/${categorySlug}/${Number.isFinite(categoryId) ? categoryId : 0}/${productSlug || "urun"}/${Number.isFinite(productId) ? productId : 0}`;
}
