package com.eciner.ecommerce.fulfillment;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record ShipmentUpdate(@NotNull UUID requestId, @NotNull @PositiveOrZero Long version,
        @NotNull ShipmentStatus status, @Size(max=100) String carrier, @Size(max=100) String trackingNumber) {}
