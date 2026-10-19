package com.eciner.ecommerce.payment;

public record SavedCardSummaryResponse(Long id, String cardNo, Integer expireMonth,
        Integer expireYear, String nameOnCard) {
    public static SavedCardSummaryResponse from(SavedCard card) {
        String number = card.getCardNo();
        return new SavedCardSummaryResponse(card.getId(), "**** " + number.substring(number.length() - 4),
                card.getExpireMonth(), card.getExpireYear(), card.getNameOnCard());
    }
}
