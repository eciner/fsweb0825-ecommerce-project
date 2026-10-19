package com.eciner.ecommerce.favorite;

import com.eciner.ecommerce.product.ProductRepository;
import com.eciner.ecommerce.product.ProductResponse;
import com.eciner.ecommerce.user.UserRepository;
import com.eciner.ecommerce.common.error.ResourceNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FavoriteService {
    private final FavoriteRepository favorites;
    private final ProductRepository products;
    private final UserRepository users;
    public FavoriteService(FavoriteRepository favorites, ProductRepository products, UserRepository users) {
        this.favorites = favorites; this.products = products; this.users = users;
    }
    @Transactional(readOnly = true)
    public List<ProductResponse> list(Long userId) {
        return favorites.findAllByOwner_IdOrderByIdDesc(userId).stream().map(f -> ProductResponse.from(f.getProduct())).toList();
    }
    public void add(Long userId, Long productId) {
        // Serialize repeated adds to the same product before checking the unique owner/product pair.
        var product = products.findByIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND", "Product was not found."));
        if (!favorites.existsByOwner_IdAndProduct_Id(userId, productId)) {
            var owner = users.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Authenticated user was not found."));
            favorites.save(new Favorite(owner, product));
        }
    }
    public void remove(Long userId, Long productId) { favorites.deleteByOwner_IdAndProduct_Id(userId, productId); }
}
