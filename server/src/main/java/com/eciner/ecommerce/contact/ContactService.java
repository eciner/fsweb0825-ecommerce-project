package com.eciner.ecommerce.contact;

import com.eciner.ecommerce.common.error.ConflictException;
import com.eciner.ecommerce.common.error.InvalidRequestException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {
    public record Acknowledgement(UUID reference, Instant receivedAt) {}
    private final ContactRepository repository;
    private final ContactRateLimiter limiter;
    public ContactService(ContactRepository repository, ContactRateLimiter limiter) { this.repository = repository; this.limiter = limiter; }
    @Transactional
    public Acknowledgement submit(ContactRequest request, String remoteAddress) {
        if (request.message().trim().length() < 10) throw new InvalidRequestException("INVALID_MESSAGE", "Message must contain at least ten non-padding characters.");
        var existing = repository.findBySubmissionId(request.submissionId());
        if (existing.isPresent()) {
            if (!existing.get().matches(request)) throw new ConflictException("SUBMISSION_CONFLICT", "Submission reference has already been used.");
            return acknowledge(existing.get());
        }
        limiter.check(remoteAddress);
        return acknowledge(repository.saveAndFlush(new ContactMessage(request)));
    }
    private Acknowledgement acknowledge(ContactMessage message) { return new Acknowledgement(message.getSubmissionId(), message.getCreatedAt()); }
}
