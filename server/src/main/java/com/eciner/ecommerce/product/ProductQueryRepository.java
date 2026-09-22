package com.eciner.ecommerce.product;

public interface ProductQueryRepository {

    ProductPage search(Long categoryId, String filter, ProductSort sort, int limit, int offset);

}
