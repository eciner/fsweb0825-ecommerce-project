package com.eciner.ecommerce.payment;

public record SavedCardResponse(Long id, String cardNo, Integer expireMonth, Integer expireYear, String nameOnCard) {

    public static SavedCardResponse from(SavedCard card) {
        return new SavedCardResponse(card.getId(), card.getCardNo(), card.getExpireMonth(),
                card.getExpireYear(), card.getNameOnCard());
    }
}