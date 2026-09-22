package com.eciner.ecommerce.product;

import com.eciner.ecommerce.common.error.InvalidRequestException;

/** Mirrors the four sort values query.js allows: price:asc, price:desc, rating:asc, rating:desc. */
public enum ProductSort {

    PRICE_ASC("price", true),
    PRICE_DESC("price", false),
    RATING_ASC("rating", true),
    RATING_DESC("rating", false);

    private final String field;
    private final boolean ascending;

    ProductSort(String field, boolean ascending) {
        this.field = field;
        this.ascending = ascending;
    }

    public String field() {
        return field;
    }

    public boolean ascending() {
        return ascending;
    }

    public static ProductSort fromParam(String rawValue) {
        return switch (rawValue) {
            case "price:asc" -> PRICE_ASC;
            case "price:desc" -> PRICE_DESC;
            case "rating:asc" -> RATING_ASC;
            case "rating:desc" -> RATING_DESC;
            default -> throw new InvalidRequestException(
                    "INVALID_SORT_PARAMETER",
                    "Unsupported sort value '" + rawValue
                            + "'. Expected one of price:asc, price:desc, rating:asc, rating:desc.");
        };
    }

}
