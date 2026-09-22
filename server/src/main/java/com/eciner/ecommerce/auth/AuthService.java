package com.eciner.ecommerce.auth;

import com.eciner.ecommerce.common.error.InvalidRequestException;
import com.eciner.ecommerce.common.error.ConflictException;
import com.eciner.ecommerce.common.error.ResourceNotFoundException;
import com.eciner.ecommerce.role.Role;
import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.store.Store;
import com.eciner.ecommerce.store.StoreRepository;
import com.eciner.ecommerce.user.User;
import com.eciner.ecommerce.user.UserRepository;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            StoreRepository storeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.storeRepository = storeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(AuthSignupRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("EMAIL_ALREADY_REGISTERED", "Email is already registered.");
        }

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new InvalidRequestException("INVALID_ROLE", "The selected role does not exist."));
        boolean storeRole = "store".equalsIgnoreCase(role.getCode());
        if (storeRole != (request.store() != null)) {
            throw new InvalidRequestException(
                    "INVALID_STORE_PAYLOAD",
                    storeRole ? "Store details are required for the store role." : "Store details are only valid for the store role.");
        }

        Store store = request.store() == null ? null : storeRepository.save(new Store(
                request.store().name().trim(),
                request.store().phone(),
                request.store().taxNo().toUpperCase(Locale.ROOT),
                request.store().bankAccount().toUpperCase(Locale.ROOT)));
        User user = userRepository.save(new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                role,
                store));
        return AuthResponse.from(null, user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return AuthResponse.from(jwtService.issue(user), user);
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Authenticated user was not found."));
    }

    public AuthResponse verify(String email) {
        User user = findByEmail(email);
        return AuthResponse.from(jwtService.issue(user), user);
    }
}