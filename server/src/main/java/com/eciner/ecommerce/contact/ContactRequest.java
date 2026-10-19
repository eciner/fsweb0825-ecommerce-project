package com.eciner.ecommerce.contact;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record ContactRequest(@NotNull UUID submissionId,
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 150) String subject,
        @NotBlank @Size(min = 10, max = 3000) String message,
        @NotNull @AssertTrue Boolean consent,
        @Size(max = 0) String website) {
    @Override public String toString() { return "ContactRequest[redacted]"; }
}
