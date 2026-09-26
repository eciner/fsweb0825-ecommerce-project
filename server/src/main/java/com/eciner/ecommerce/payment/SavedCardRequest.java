package com.eciner.ecommerce.payment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SavedCardRequest(
        @NotBlank @Pattern(regexp = "^\\d{12,19}$") String cardNo,
        @NotNull @Min(1) @Max(12) Integer expireMonth,
        @NotNull @Min(2000) @Max(9999) Integer expireYear,
        @NotBlank @Size(max = 150) String nameOnCard) {
}