package com.eciner.ecommerce.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(Long id, Instant orderDate, BigDecimal price, List<Line> products) {
    public record Line(Long productId, Integer count, String detail) {}

    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getOrderDate(), order.getPrice(),
                order.getProducts().stream()
                        .map(item -> new Line(item.getProductId(), item.getCount(), item.getDetail()))
                        .toList());
    }
}
