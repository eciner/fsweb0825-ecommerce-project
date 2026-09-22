package com.eciner.ecommerce.auth;

import java.math.BigInteger;
import java.util.Locale;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TurkishIbanValidator implements ConstraintValidator<TurkishIban, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false;
        }

        String normalized = value.replaceAll("\\s+", "").toUpperCase(Locale.ROOT);
        if (!normalized.matches("^TR\\d{24}$")) {
            return false;
        }

        String rearranged = normalized.substring(4) + normalized.substring(0, 4);
        StringBuilder digits = new StringBuilder();
        for (char ch : rearranged.toCharArray()) {
            if (Character.isDigit(ch)) {
                digits.append(ch);
            } else {
                digits.append(ch - 'A' + 10);
            }
        }

        return new BigInteger(digits.toString()).mod(BigInteger.valueOf(97)).intValue() == 1;
    }
}
