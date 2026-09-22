package com.eciner.ecommerce.store;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "store")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(name = "tax_no", nullable = false, unique = true)
    private String taxNo;

    @Column(name = "bank_account", nullable = false, unique = true)
    private String bankAccount;

    protected Store() {
    }

    public Store(String name, String phone, String taxNo, String bankAccount) {
        this.name = name;
        this.phone = phone;
        this.taxNo = taxNo;
        this.bankAccount = bankAccount;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getTaxNo() {
        return taxNo;
    }

    public String getBankAccount() {
        return bankAccount;
    }
}