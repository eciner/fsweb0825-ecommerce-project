package com.eciner.ecommerce.auth;

import com.eciner.ecommerce.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(username)
            .map(user -> new AuthPrincipal(user.getId(), user.getEmail(), user.getRole().getCode()))
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
    }
}