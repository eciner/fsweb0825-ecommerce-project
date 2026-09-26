package com.eciner.ecommerce.order;

import com.eciner.ecommerce.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_order")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;
    @Column(name = "address_id", nullable = false)
    private Long addressId;
    @Column(name = "order_date", nullable = false)
    private Instant orderDate;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<OrderItem> products = new ArrayList<>();

    protected Order() {}

    public Order(User owner, Long addressId, Instant orderDate, BigDecimal price) {
        this.owner = owner;
        this.addressId = addressId;
        this.orderDate = orderDate;
        this.price = price;
    }

    public void addItem(OrderItem item) {
        item.attach(this);
        products.add(item);
    }

    public Long getId() { return id; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Instant getOrderDate() { return orderDate; }
    public BigDecimal getPrice() { return price; }
    public List<OrderItem> getProducts() { return products; }
}
