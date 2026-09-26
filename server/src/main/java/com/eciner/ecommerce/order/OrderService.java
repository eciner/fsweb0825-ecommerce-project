package com.eciner.ecommerce.order;

import com.eciner.ecommerce.address.AddressRepository;
import com.eciner.ecommerce.common.error.ConflictException;
import com.eciner.ecommerce.common.error.InvalidRequestException;
import com.eciner.ecommerce.common.error.ResourceNotFoundException;
import com.eciner.ecommerce.product.Product;
import com.eciner.ecommerce.product.ProductRepository;
import com.eciner.ecommerce.user.User;
import com.eciner.ecommerce.user.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private final OrderRepository orders;
    private final AddressRepository addresses;
    private final ProductRepository products;
    private final UserRepository users;

    public OrderService(OrderRepository orders, AddressRepository addresses,
            ProductRepository products, UserRepository users) {
        this.orders = orders;
        this.addresses = addresses;
        this.products = products;
        this.users = users;
    }

    @Transactional
    public OrderResponse create(Long userId, OrderRequest request) {
        addresses.findByIdAndOwner_Id(request.addressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("ADDRESS_NOT_FOUND", "Address was not found."));
        User owner = users.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Authenticated user was not found."));

        Instant orderDate = request.orderDate() == null ? Instant.now() : request.orderDate();
        Map<Long, Integer> quantities = new TreeMap<>();
        for (OrderRequest.Line line : request.products()) {
            try {
                quantities.merge(line.productId(), line.count(), Math::addExact);
            } catch (ArithmeticException ex) {
                throw new InvalidRequestException("INVALID_QUANTITY", "Product count is too large.");
            }
        }

        // Lock in ID order so simultaneous orders for overlapping products cannot oversell or deadlock.
        Map<Long, Product> locked = new TreeMap<>();
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            Product product = products.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND", "Product was not found."));
            if (product.getStock() < entry.getValue()) {
                throw new ConflictException("INSUFFICIENT_STOCK", "Insufficient product stock.");
            }
            if ((long) product.getSellCount() + entry.getValue() > Integer.MAX_VALUE) {
                throw new ConflictException("SELL_COUNT_OVERFLOW", "Product sale count limit reached.");
            }
            locked.put(entry.getKey(), product);
        }

        BigDecimal total = BigDecimal.ZERO;
        Order order = new Order(owner, request.addressId(), orderDate, BigDecimal.ZERO);
        for (OrderRequest.Line line : request.products()) {
            Product product = locked.get(line.productId());
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(line.count())));
            order.addItem(new OrderItem(product, line.count(), product.getPrice(), line.detail()));
        }
        if (total.precision() - total.scale() > 10) {
            throw new InvalidRequestException("ORDER_TOTAL_TOO_LARGE", "Order total is too large.");
        }
        order.setPrice(total);
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            locked.get(entry.getKey()).recordSale(entry.getValue());
        }
        return OrderResponse.from(orders.saveAndFlush(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> list(Long userId) {
        return orders.findAllByOwner_IdOrderByIdDesc(userId).stream().map(OrderResponse::from).toList();
    }

}
