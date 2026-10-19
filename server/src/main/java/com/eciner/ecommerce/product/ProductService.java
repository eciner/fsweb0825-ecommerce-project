package com.eciner.ecommerce.product;

import com.eciner.ecommerce.common.error.ResourceNotFoundException;
import com.eciner.ecommerce.common.error.InvalidRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductListResponse list(Long categoryId, String gender, String filter, String sortParam, int limit, int offset) {
        return list(categoryId, gender, filter, sortParam, limit, offset, null, null, false);
    }

    public ProductListResponse list(Long categoryId, String gender, String filter, String sortParam, int limit, int offset,
            java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, boolean inStock) {
        if (categoryId != null && categoryId <= 0) throw new InvalidRequestException("INVALID_CATEGORY", "Category must be positive.");
        if ((minPrice != null && minPrice.signum() < 0) || (maxPrice != null && maxPrice.signum() < 0)
                || (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0)) {
            throw new InvalidRequestException("INVALID_PRICE_RANGE", "Prices must be nonnegative and minimum must not exceed maximum.");
        }
        if (gender != null && !java.util.Set.of("k", "e").contains(gender)) {
            throw new InvalidRequestException("INVALID_GENDER_PARAMETER", "Gender must be k or e.");
        }
        ProductSort sort = (sortParam == null || sortParam.isBlank()) ? null : ProductSort.fromParam(sortParam);

        String normalized = filter == null ? null : filter.strip().replaceAll("\\s+", " ");
        ProductPage page = productRepository.search(categoryId, gender, normalized, sort, limit, offset, minPrice, maxPrice, inStock);
        var products = page.items().stream().map(ProductResponse::from).toList();

        return new ProductListResponse((int) page.total(), limit, offset, products);
    }

    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PRODUCT_NOT_FOUND", "Product " + id + " not found."));

        return ProductResponse.from(product);
    }

}
