package com.eciner.ecommerce.product;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
public class ProductController {

    private static final int MAX_LIMIT = 100;

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ProductListResponse getProducts(
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) @jakarta.validation.constraints.Size(max = 200) String filter,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "25") @Positive @Max(MAX_LIMIT) int limit,
            @RequestParam(defaultValue = "0") @PositiveOrZero int offset,
            @RequestParam(name = "min_price", required = false) @jakarta.validation.constraints.Digits(integer = 10, fraction = 2) java.math.BigDecimal minPrice,
            @RequestParam(name = "max_price", required = false) @jakarta.validation.constraints.Digits(integer = 10, fraction = 2) java.math.BigDecimal maxPrice,
            @RequestParam(name = "in_stock", defaultValue = "false") boolean inStock) {
        return productService.list(category, gender, filter, sort, limit, offset, minPrice, maxPrice, inStock);
    }

    @GetMapping("/products/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getById(id);
    }

}
