package com.eciner.ecommerce.common.error;

/** Deterministic error body returned by all API error responses. */
public record ApiError(int status, String code, String message) {
}
