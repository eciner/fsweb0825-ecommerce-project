package com.eciner.ecommerce.order;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    java.util.Optional<Order> findByIdAndOwner_Id(Long id, Long ownerId);
    java.util.Optional<Order> findByOwner_IdAndRequestId(Long ownerId, java.util.UUID requestId);
    List<Order> findAllByOwner_IdOrderByIdDesc(Long ownerId);
}
