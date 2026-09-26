package com.eciner.ecommerce.payment;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedCardRepository extends JpaRepository<SavedCard, Long> {
    List<SavedCard> findAllByOwner_IdOrderByIdAsc(Long ownerId);
    Optional<SavedCard> findByIdAndOwner_Id(Long id, Long ownerId);
}