package com.eciner.ecommerce.product;

import java.math.BigDecimal;
import java.util.List;

/** Matches the fields productModel.js reads directly from the API product shape. */
public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stock,
        Long storeId,
        BigDecimal rating,
        Integer sellCount,
        Long categoryId,
        List<ProductImageResponse> images) {

    public static ProductResponse from(Product product) {
        List<ProductImageResponse> imageResponses = product.getImages().stream()
                .map(ProductImageResponse::from)
                .toList();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getStoreId(),
                product.getRating(),
                product.getSellCount(),
                product.getCategory().getId(),
                imageResponses);
    }

}
