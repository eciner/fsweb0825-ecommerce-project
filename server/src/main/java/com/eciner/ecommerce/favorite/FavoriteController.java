package com.eciner.ecommerce.favorite;

import com.eciner.ecommerce.auth.AuthPrincipal;
import com.eciner.ecommerce.product.ProductResponse;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/user/favorites")
public class FavoriteController {
    private final FavoriteService service;
    public FavoriteController(FavoriteService service) { this.service = service; }
    @GetMapping
    public List<ProductResponse> list(@AuthenticationPrincipal AuthPrincipal principal) { return service.list(principal.getUserId()); }
    @PutMapping("/{productId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable @Positive Long productId) { service.add(principal.getUserId(), productId); }
    @DeleteMapping("/{productId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable @Positive Long productId) { service.remove(principal.getUserId(), productId); }
}
