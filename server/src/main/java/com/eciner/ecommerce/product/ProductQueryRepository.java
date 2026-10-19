package com.eciner.ecommerce.product;

public interface ProductQueryRepository {

    ProductPage search(Long categoryId, String gender, String filter, ProductSort sort, int limit, int offset,
            java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, boolean inStock);

}
