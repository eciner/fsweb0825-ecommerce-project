package com.eciner.ecommerce.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AddressUpdateRequest(
        @NotNull @Positive Long id,
        @NotBlank @Size(max = 150) String title,
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 150) String surname,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String district,
        @NotBlank @Size(max = 500) String neighborhood) {
}