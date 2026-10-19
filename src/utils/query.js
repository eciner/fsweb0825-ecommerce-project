const ALLOWED_SORT_VALUES = new Set([
  "price:asc",
  "price:desc",
  "rating:asc",
  "rating:desc",
]);

const DEFAULT_LIMIT = 25;
function price(value) { return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null; }
function extraFilters(input) {
  const result = {};
  for (const key of ["min_price", "max_price"]) if (price(input[key]) !== null) result[key] = price(input[key]);
  if (input.in_stock === true || input.in_stock === "true") result.in_stock = true;
  return result;
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNonNegativeInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function normalizeCategoryId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function normalizeQuery(input = {}) {
  const category = normalizeCategoryId(input.category);
  const sort = ALLOWED_SORT_VALUES.has(input.sort) ? input.sort : "";
  const filter = String(input.filter || "").trim().replace(/\s+/gu, " ");
  const limit = toPositiveInt(input.limit, DEFAULT_LIMIT);
  const offset = toNonNegativeInt(input.offset, 0);

  return {
    category,
    ...extraFilters(input),
    ...(["k", "e"].includes(input.gender) ? { gender: input.gender } : {}),
    sort,
    filter,
    limit,
    offset,
  };
}

export function buildProductsParams(query) {
  const normalized = normalizeQuery(query);
  const params = {
    limit: normalized.limit,
    offset: normalized.offset,
  };

  Object.assign(params, extraFilters(normalized));
  if (normalized.gender) params.gender = normalized.gender;

  if (normalized.category !== null) {
    params.category = normalized.category;
  }

  if (normalized.sort) {
    params.sort = normalized.sort;
  }

  if (normalized.filter) {
    params.filter = normalized.filter;
  }

  return params;
}

export function createQueryKey(query) {
  const normalized = normalizeQuery(query);
  return [
    `category=${normalized.category ?? ""}`,
    `gender=${normalized.gender || ""}`,
    `sort=${normalized.sort}`,
    `filter=${encodeURIComponent(normalized.filter)}`,
    `limit=${normalized.limit}`,
    `offset=${normalized.offset}`,
    ...Object.entries(extraFilters(normalized)).map(([key, value]) => `${key}=${value}`),
  ].join("|");
}

export function readShopSearch(search) {
  const params = new URLSearchParams(search || "");
  return {
    ...extraFilters(Object.fromEntries(params)),
    ...(normalizeCategoryId(params.get("category")) ? { category: normalizeCategoryId(params.get("category")) } : {}),
    ...(["k", "e"].includes(params.get("gender"))
      ? { gender: params.get("gender") }
      : {}),
    sort: params.get("sort") || "",
    filter: params.get("filter") || "",
    page: toPositiveInt(params.get("page"), 1),
  };
}

export function buildShopSearch({
  sort = "",
  filter = "",
  page = 1,
  gender = "",
  category = null,
  ...extra
} = {}) {
  const params = new URLSearchParams();
  if (["k", "e"].includes(gender)) params.set("gender", gender);
  if (normalizeCategoryId(category)) params.set("category", normalizeCategoryId(category));
  for (const [key, value] of Object.entries(extraFilters(extra))) params.set(key, value);
  const normalizedFilter = String(filter || "").trim().replace(/\s+/gu, " ");

  if (sort && ALLOWED_SORT_VALUES.has(sort)) {
    params.set("sort", sort);
  }

  if (normalizedFilter) {
    params.set("filter", normalizedFilter);
  }

  if (Number.isFinite(page) && page > 1) {
    params.set("page", String(page));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export { ALLOWED_SORT_VALUES, DEFAULT_LIMIT };
