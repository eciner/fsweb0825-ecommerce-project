package com.eciner.ecommerce.address;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findAllByOwner_IdOrderByIdAsc(Long ownerId);
    Optional<Address> findByIdAndOwner_Id(Long id, Long ownerId);
}