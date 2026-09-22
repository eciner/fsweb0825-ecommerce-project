package com.eciner.ecommerce.product;

public record ProductImageResponse(String url, Integer index) {

    public static ProductImageResponse from(ProductImage image) {
        return new ProductImageResponse(image.getUrl(), image.getIndex());
    }

}
