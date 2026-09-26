package com.eciner.ecommerce.order;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOwner_IdOrderByIdDesc(Long ownerId);
}
