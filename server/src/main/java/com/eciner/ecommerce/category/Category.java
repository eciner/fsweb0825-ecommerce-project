package com.eciner.ecommerce.category;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "img")
    private String img;

    @Column(name = "gender", nullable = false)
    private String gender;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "rating", nullable = false)
    private BigDecimal rating;

    protected Category() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getImg() {
        return img;
    }

    public String getGender() {
        return gender;
    }

    public String getCode() {
        return code;
    }

    public BigDecimal getRating() {
        return rating;
    }

}
