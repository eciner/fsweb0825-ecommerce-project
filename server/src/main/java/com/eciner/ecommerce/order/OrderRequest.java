package com.eciner.ecommerce.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderRequest(
        UUID requestId,
        @NotNull Long addressId,
        Long receiptAddressId,
        Instant orderDate,
        BigDecimal price,
        @NotEmpty List<@NotNull @Valid Line> products) {
    public OrderRequest(Long addressId, Instant orderDate, BigDecimal price, List<Line> products) {
        this(null, addressId, null, orderDate, price, products);
    }
    public OrderRequest(Long addressId, Long receiptAddressId, Instant orderDate, BigDecimal price, List<Line> products) {
        this(null, addressId, receiptAddressId, orderDate, price, products);
    }
    public record Line(@NotNull Long productId, @NotNull @Min(1) Integer count,
            @Size(max = 500) String detail) {}
}
