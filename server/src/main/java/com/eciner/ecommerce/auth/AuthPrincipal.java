package com.eciner.ecommerce.auth;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public final class AuthPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final String roleCode;
    private final Collection<? extends GrantedAuthority> authorities;

    public AuthPrincipal(Long userId, String email, String roleCode) {
        this.userId = userId;
        this.email = email;
        this.roleCode = roleCode;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleCode.toUpperCase(java.util.Locale.ROOT)));
    }

    public Long getUserId() {
        return userId;
    }

    public String getRoleCode() {
        return roleCode;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }
}