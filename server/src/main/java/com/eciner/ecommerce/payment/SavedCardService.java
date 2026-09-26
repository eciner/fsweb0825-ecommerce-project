package com.eciner.ecommerce.payment;

import com.eciner.ecommerce.common.error.InvalidRequestException;
import com.eciner.ecommerce.common.error.ResourceNotFoundException;
import com.eciner.ecommerce.user.User;
import com.eciner.ecommerce.user.UserRepository;
import java.util.List;
import java.time.YearMonth;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SavedCardService {

    private final SavedCardRepository savedCardRepository;
    private final UserRepository userRepository;

    public SavedCardService(SavedCardRepository savedCardRepository, UserRepository userRepository) {
        this.savedCardRepository = savedCardRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<SavedCardResponse> list(Long ownerId) {
        return savedCardRepository.findAllByOwner_IdOrderByIdAsc(ownerId).stream()
                .map(SavedCardResponse::from).toList();
    }

    public SavedCardResponse create(Long ownerId, SavedCardRequest request) {
        validateExpiration(request.expireMonth(), request.expireYear());
        User owner = requireUser(ownerId);
        SavedCard card = new SavedCard(owner, request.cardNo(), request.expireMonth(),
                request.expireYear(), request.nameOnCard().trim());
        return SavedCardResponse.from(savedCardRepository.save(card));
    }

    public SavedCardResponse update(Long ownerId, SavedCardUpdateRequest request) {
        validateExpiration(request.expireMonth(), request.expireYear());
        SavedCard card = requireOwnedCard(request.id(), ownerId);
        card.update(request.cardNo(), request.expireMonth(), request.expireYear(), request.nameOnCard().trim());
        return SavedCardResponse.from(savedCardRepository.save(card));
    }

    public void delete(Long ownerId, Long cardId) {
        savedCardRepository.delete(requireOwnedCard(cardId, ownerId));
    }

    private User requireUser(Long ownerId) {
        return userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Authenticated user was not found."));
    }

    private SavedCard requireOwnedCard(Long cardId, Long ownerId) {
        return savedCardRepository.findByIdAndOwner_Id(cardId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("CARD_NOT_FOUND", "Saved card was not found."));
    }

    private void validateExpiration(Integer month, Integer year) {
        if (YearMonth.of(year, month).isBefore(YearMonth.now())) {
            throw new InvalidRequestException("EXPIRED_CARD", "Card expiration date must be current or future.");
        }
    }
}