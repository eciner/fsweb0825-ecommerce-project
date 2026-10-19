package com.eciner.ecommerce.favorite;

import com.eciner.ecommerce.product.Product;
import com.eciner.ecommerce.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "user_favorite", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
public class Favorite {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User owner;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id") private Product product;
    protected Favorite() {}
    public Favorite(User owner, Product product) { this.owner = owner; this.product = product; }
    public Product getProduct() { return product; }
}
