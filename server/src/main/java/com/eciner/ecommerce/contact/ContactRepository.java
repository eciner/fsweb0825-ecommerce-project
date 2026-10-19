package com.eciner.ecommerce.contact;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
    Optional<ContactMessage> findBySubmissionId(UUID submissionId);
}
