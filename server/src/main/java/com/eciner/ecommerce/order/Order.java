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
    @Column(name = "request_id")
    private java.util.UUID requestId;
    @Column(name = "request_fingerprint", length = 64)
    private String requestFingerprint;
    @Column(name = "address_id", nullable = false)
    private Long addressId;
    @Column(name = "receipt_address_id")
    private Long receiptAddressId;
    @Column(name = "shipping_address", length = 1500)
    private String shippingAddress;
    @Column(name = "receipt_address", length = 1500)
    private String receiptAddress;
    @Column(length = 3)
    private String currency;
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

    public void snapshotAddresses(com.eciner.ecommerce.address.Address shipping, com.eciner.ecommerce.address.Address receipt) {
        receiptAddressId = receipt.getId();
        shippingAddress = addressText(shipping);
        receiptAddress = addressText(receipt);
        currency = "USD";
    }
    private String addressText(com.eciner.ecommerce.address.Address a) {
        return String.join("\n", a.getTitle(), a.getName() + " " + a.getSurname(), a.getPhone(),
                a.getNeighborhood(), a.getDistrict() + ", " + a.getCity());
    }
    public Long getReceiptAddressId() { return receiptAddressId; }
    public String getShippingAddress() { return shippingAddress; }
    public String getReceiptAddress() { return receiptAddress; }
    public String getCurrency() { return currency; }
    public void identifyRequest(java.util.UUID requestId, String fingerprint) {
        this.requestId = requestId;
        this.requestFingerprint = fingerprint;
    }
    public String getRequestFingerprint() { return requestFingerprint; }
    public Long getId() { return id; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Instant getOrderDate() { return orderDate; }
    public BigDecimal getPrice() { return price; }
    public List<OrderItem> getProducts() { return products; }
}
