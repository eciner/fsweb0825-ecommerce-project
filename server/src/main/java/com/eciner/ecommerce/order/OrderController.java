package com.eciner.ecommerce.order;

import com.eciner.ecommerce.auth.AuthPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody OrderRequest request) {
        return service.create(principal.getUserId(), request);
    }

    @GetMapping
    public List<OrderResponse> list(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.list(principal.getUserId());
    }
}
