package com.eciner.ecommerce.product;

import com.eciner.ecommerce.common.error.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductListResponse list(Long categoryId, String filter, String sortParam, int limit, int offset) {
        ProductSort sort = (sortParam == null || sortParam.isBlank()) ? null : ProductSort.fromParam(sortParam);

        ProductPage page = productRepository.search(categoryId, filter, sort, limit, offset);
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
