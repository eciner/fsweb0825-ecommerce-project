package com.eciner.ecommerce.common.error;

/** Thrown when a request parameter fails semantic validation (e.g. an unsupported sort value). */
public class InvalidRequestException extends RuntimeException {

    private final String code;

    public InvalidRequestException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }

}
