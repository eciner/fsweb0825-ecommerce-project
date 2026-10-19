package com.eciner.ecommerce.common.error;

public class RateLimitException extends RuntimeException {
    public RateLimitException() { super("Too many contact requests. Please try again in ten minutes."); }
}
