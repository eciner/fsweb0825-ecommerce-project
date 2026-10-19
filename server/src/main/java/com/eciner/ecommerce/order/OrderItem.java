package com.eciner.ecommerce.order;

import com.eciner.ecommerce.product.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false)
    private Integer count;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;
    @Column(length = 500)
    private String detail;

    @Column(name = "product_name", length = 200)
    private String productName;
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "fulfillment_store_id")
    private Long fulfillmentStoreId;

    protected OrderItem() {}

    public OrderItem(Product product, int count, BigDecimal unitPrice, String detail) {
        this.product = product;
        this.fulfillmentStoreId = product.getFulfillmentStoreId();
        this.productName = product.getName();
        this.imageUrl = product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl();
        this.count = count;
        this.unitPrice = unitPrice;
        this.detail = detail;
    }

    public String getProductName() { return productName; }
    public Long getId() { return id; }
    public Long getFulfillmentStoreId() { return fulfillmentStoreId; }
    public String getImageUrl() { return imageUrl; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    void attach(Order order) { this.order = order; }
    public Long getProductId() { return product.getId(); }
    public Integer getCount() { return count; }
    public String getDetail() { return detail; }
}
