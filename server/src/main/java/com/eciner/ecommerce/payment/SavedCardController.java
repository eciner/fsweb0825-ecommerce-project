package com.eciner.ecommerce.payment;

import com.eciner.ecommerce.auth.AuthPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/card")
public class SavedCardController {

    private final SavedCardService savedCardService;

    public SavedCardController(SavedCardService savedCardService) {
        this.savedCardService = savedCardService;
    }

    @GetMapping
    public List<SavedCardResponse> list(@AuthenticationPrincipal AuthPrincipal principal) {
        return savedCardService.list(principal.getUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavedCardResponse create(@AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody SavedCardRequest request) {
        return savedCardService.create(principal.getUserId(), request);
    }

    @PutMapping
    public SavedCardResponse update(@AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody SavedCardUpdateRequest request) {
        return savedCardService.update(principal.getUserId(), request);
    }

    @DeleteMapping("/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long cardId) {
        savedCardService.delete(principal.getUserId(), cardId);
    }
}