package com.eciner.ecommerce.favorite;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    @EntityGraph(attributePaths = {"product", "product.category", "product.images"})
    List<Favorite> findAllByOwner_IdOrderByIdDesc(Long ownerId);
    boolean existsByOwner_IdAndProduct_Id(Long ownerId, Long productId);
    void deleteByOwner_IdAndProduct_Id(Long ownerId, Long productId);
}
