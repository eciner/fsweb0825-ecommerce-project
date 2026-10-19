package com.eciner.ecommerce.contact;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "contact_message")
public class ContactMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "submission_id", nullable = false, unique = true) private UUID submissionId;
    @Column(name = "sender_name", nullable = false, length = 150) private String senderName;
    @Column(nullable = false, length = 254) private String email;
    @Column(nullable = false, length = 150) private String subject;
    @Column(nullable = false, length = 3000) private String message;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    protected ContactMessage() {}
    public ContactMessage(ContactRequest request) {
        submissionId = request.submissionId(); senderName = request.name().trim();
        email = request.email().trim(); subject = request.subject().trim();
        message = request.message().trim(); createdAt = Instant.now();
    }
    public boolean matches(ContactRequest r) {
        return senderName.equals(r.name().trim()) && email.equals(r.email().trim())
            && subject.equals(r.subject().trim()) && message.equals(r.message().trim());
    }
    public UUID getSubmissionId() { return submissionId; }
    public Instant getCreatedAt() { return createdAt; }
}
