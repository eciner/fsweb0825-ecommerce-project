package com.eciner.ecommerce.address;

import com.eciner.ecommerce.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 150)
    private String title;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(nullable = false, length = 150)
    private String surname;
    @Column(nullable = false, length = 30)
    private String phone;
    @Column(nullable = false, length = 100)
    private String city;
    @Column(nullable = false, length = 100)
    private String district;
    @Column(nullable = false, length = 500)
    private String neighborhood;

    protected Address() {
    }

    public Address(User owner, String title, String name, String surname, String phone,
            String city, String district, String neighborhood) {
        this.owner = owner;
        update(title, name, surname, phone, city, district, neighborhood);
    }

    public void update(String title, String name, String surname, String phone,
            String city, String district, String neighborhood) {
        this.title = title;
        this.name = name;
        this.surname = surname;
        this.phone = phone;
        this.city = city;
        this.district = district;
        this.neighborhood = neighborhood;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getTitle() { return title; }
    public String getName() { return name; }
    public String getSurname() { return surname; }
    public String getPhone() { return phone; }
    public String getCity() { return city; }
    public String getDistrict() { return district; }
    public String getNeighborhood() { return neighborhood; }
}