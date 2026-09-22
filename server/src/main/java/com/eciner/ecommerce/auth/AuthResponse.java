package com.eciner.ecommerce.auth;

import com.eciner.ecommerce.user.User;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        Long roleId,
        String roleCode,
        Long storeId) {

    public static AuthResponse from(String token, User user) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getId(),
                user.getRole().getCode(),
                user.getStore() == null ? null : user.getStore().getId());
    }
}