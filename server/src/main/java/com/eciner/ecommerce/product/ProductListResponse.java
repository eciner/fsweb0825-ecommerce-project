package com.eciner.ecommerce.product;

import java.util.List;

/** Mirrors the {total, limit, offset, products} shape actions.js/normalizeProductsResponse expects. */
public record ProductListResponse(int total, int limit, int offset, List<ProductResponse> products) {
}
