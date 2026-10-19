package com.eciner.ecommerce.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(Long id, Instant orderDate, BigDecimal price, List<Line> products,
        Long receiptAddressId, String shippingAddress, String receiptAddress, String currency) {
    public record Line(Long productId, Integer count, String detail, String productName,
            String imageUrl, BigDecimal unitPrice, BigDecimal lineTotal) {}

    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getOrderDate(), order.getPrice(),
                order.getProducts().stream()
                        .map(item -> new Line(item.getProductId(), item.getCount(), item.getDetail(),
                            item.getProductName(), item.getImageUrl(), item.getUnitPrice(),
                            item.getUnitPrice().multiply(BigDecimal.valueOf(item.getCount()))))
                        .toList(), order.getReceiptAddressId(), order.getShippingAddress(),
                        order.getReceiptAddress(), order.getCurrency());
    }
}
