const ALLOWED_SORT_VALUES = new Set([
  "price:asc",
  "price:desc",
  "rating:asc",
  "rating:desc",
]);

const DEFAULT_LIMIT = 25;

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
  const filter = String(input.filter || "").trim();
  const limit = toPositiveInt(input.limit, DEFAULT_LIMIT);
  const offset = toNonNegativeInt(input.offset, 0);

  return {
    category,
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
    `sort=${normalized.sort}`,
    `filter=${encodeURIComponent(normalized.filter)}`,
    `limit=${normalized.limit}`,
    `offset=${normalized.offset}`,
  ].join("|");
}

export function readShopSearch(search) {
  const params = new URLSearchParams(search || "");
  return {
    sort: params.get("sort") || "",
    filter: params.get("filter") || "",
    page: toPositiveInt(params.get("page"), 1),
  };
}

export function buildShopSearch({ sort = "", filter = "", page = 1 }) {
  const params = new URLSearchParams();
  const normalizedFilter = String(filter || "").trim();

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
