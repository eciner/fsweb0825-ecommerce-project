package com.eciner.ecommerce.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AuthSignupRequest(
        @NotBlank @Size(min = 3, max = 150) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$") String password,
        @NotNull Long roleId,
        @Valid StoreSignupRequest store) {

    public record StoreSignupRequest(
            @NotBlank @Size(min = 3, max = 150) String name,
            @NotBlank @Pattern(regexp = "^05\\d{9}$") String phone,
            @NotBlank @Pattern(regexp = "^T\\d{4}V\\d{6}$") String taxNo,
            @NotBlank @TurkishIban String bankAccount) {
    }
}