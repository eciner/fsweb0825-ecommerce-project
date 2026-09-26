package com.eciner.ecommerce.payment;

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
@Table(name = "saved_card")
public class SavedCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(name = "card_no", nullable = false, length = 19)
    private String cardNo;
    @Column(name = "expire_month", nullable = false)
    private Integer expireMonth;
    @Column(name = "expire_year", nullable = false)
    private Integer expireYear;
    @Column(name = "name_on_card", nullable = false, length = 150)
    private String nameOnCard;

    protected SavedCard() {
    }

    public SavedCard(User owner, String cardNo, Integer expireMonth, Integer expireYear, String nameOnCard) {
        this.owner = owner;
        update(cardNo, expireMonth, expireYear, nameOnCard);
    }

    public void update(String cardNo, Integer expireMonth, Integer expireYear, String nameOnCard) {
        this.cardNo = cardNo;
        this.expireMonth = expireMonth;
        this.expireYear = expireYear;
        this.nameOnCard = nameOnCard;
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getCardNo() { return cardNo; }
    public Integer getExpireMonth() { return expireMonth; }
    public Integer getExpireYear() { return expireYear; }
    public String getNameOnCard() { return nameOnCard; }
}