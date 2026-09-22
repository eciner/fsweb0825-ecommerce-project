package com.eciner.ecommerce.product;

import java.util.List;

/** Result of a filtered/sorted/paginated product search: the page of items plus the total match count. */
public record ProductPage(List<Product> items, long total) {
}
