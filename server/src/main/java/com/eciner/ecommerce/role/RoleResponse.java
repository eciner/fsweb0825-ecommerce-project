package com.eciner.ecommerce.role;

/** Matches the role shape the signup form uses to resolve customer/store selection by code. */
public record RoleResponse(Long id, String name, String code) {

    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getId(), role.getName(), role.getCode());
    }

}
