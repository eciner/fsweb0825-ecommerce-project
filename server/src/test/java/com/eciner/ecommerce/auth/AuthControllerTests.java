package com.eciner.ecommerce.auth;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eciner.ecommerce.role.Role;
import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.user.User;
import com.eciner.ecommerce.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void signupHashesPasswordAndReturnsSanitizedUserResponse() throws Exception {
        String email = uniqueEmail();
        String password = "StrongPass1!";
        long customerRoleId = roleId("customer");

        MvcResult result = mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Test Customer","email":"%s","password":"%s","role_id":%d}
                        """.formatted(email, password, customerRoleId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.password_hash").doesNotExist())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(user.getPasswordHash())
                .isNotEqualTo(password)
                .satisfies(hash -> org.assertj.core.api.Assertions.assertThat(passwordEncoder.matches(password, hash)).isTrue());
        org.assertj.core.api.Assertions.assertThat(body.get("id").asLong()).isEqualTo(user.getId());
    }

    @Test
    void storeSignupPersistsNestedStoreData() throws Exception {
        String email = uniqueEmail();
        String taxNo = uniqueTaxNo();
        String bankAccount = uniqueValidBankAccount();
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"IBAN Normalization User","email":"%s","password":"StrongPass1!","role_id":%d,"store":{"name":"IBAN Store","phone":"05555555555","tax_no":"%s","bank_account":"%s"}}
                        """.formatted(email, roleId("store"), taxNo, bankAccount)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.store_id").isNumber());
    }

    @Test
    void validTurkishIbanIsAcceptedForStoreSignup() throws Exception {
        String email = uniqueEmail();
        String taxNo = uniqueTaxNo();
        String bankAccount = uniqueValidBankAccount();
        String spacedBankAccount = bankAccount.substring(0, 4) + " " + bankAccount.substring(4, 8) + " "
                + bankAccount.substring(8, 12) + " " + bankAccount.substring(12, 16) + " "
                + bankAccount.substring(16, 20) + " " + bankAccount.substring(20, 24) + " "
                + bankAccount.substring(24);
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Demo Store User","email":"%s","password":"StrongPass1!","role_id":%d,"store":{"name":"Demo Store","phone":"05555555555","tax_no":"%s","bank_account":"%s"}}
                        """.formatted(email, roleId("store"), taxNo, spacedBankAccount)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.store_id").isNumber());
    }

    @Test
    void invalidTurkishIbanPatternIsRejected() throws Exception {
                String taxNo = uniqueTaxNo();
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Demo Store User","email":"%s","password":"StrongPass1!","role_id":%d,"store":{"name":"Demo Store","phone":"05555555555","tax_no":"%s","bank_account":"TR123"}}
                        """.formatted(uniqueEmail(), roleId("store"), taxNo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void checksumInvalidTurkishIbanIsRejected() throws Exception {
        String taxNo = uniqueTaxNo();
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Demo Store User","email":"%s","password":"StrongPass1!","role_id":%d,"store":{"name":"Demo Store","phone":"05555555555","tax_no":"%s","bank_account":"TR330006100519786457841327"}}
                        """.formatted(uniqueEmail(), roleId("store"), taxNo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void signupRejectsMissingStoreDetailsForStoreRole() throws Exception {
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Missing Store","email":"%s","password":"StrongPass1!","role_id":%d}
                        """.formatted(uniqueEmail(), roleId("store"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_STORE_PAYLOAD"));
    }

    @Test
    void signupRejectsStoreDetailsForNonStoreRole() throws Exception {
        String taxNo = uniqueTaxNo();
        String bankAccount = uniqueValidBankAccount();
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Wrong Store","email":"%s","password":"StrongPass1!","role_id":%d,"store":{"name":"Not Allowed","phone":"05555555555","tax_no":"%s","bank_account":"%s"}}
                        """.formatted(uniqueEmail(), roleId("customer"), taxNo, bankAccount)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_STORE_PAYLOAD"));
    }

    @Test
    void signupRejectsUnknownRole() throws Exception {
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Unknown Role","email":"%s","password":"StrongPass1!","role_id":999999}
                        """.formatted(uniqueEmail())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ROLE"));
    }

    @Test
    void loginReturnsTokenAndVerifyAcceptsBearerToken() throws Exception {
        String email = uniqueEmail();
        signup(email, roleId("customer"));

        MvcResult login = mockMvc.perform(post("/login")
                .contentType("application/json")
                .content("""
                        {"email":"%s","password":"StrongPass1!"}
                        """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role_id").value(roleId("customer")))
                .andExpect(jsonPath("$.password_hash").doesNotExist())
                .andReturn();
        String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/verify").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.role_id").value(roleId("customer")))
                .andExpect(jsonPath("$.token").isNotEmpty());
        String renewedToken = objectMapper.readTree(
                mockMvc.perform(get("/verify").header("Authorization", "Bearer " + token))
                        .andReturn().getResponse().getContentAsString()).get("token").asText();
        org.assertj.core.api.Assertions.assertThat(renewedToken).isNotEqualTo(token);
    }

    @Test
    void verifyAcceptsHistoricallyRawAuthorizationToken() throws Exception {
        String email = uniqueEmail();
        signup(email, roleId("customer"));
        MvcResult login = mockMvc.perform(post("/login")
                .contentType("application/json")
                .content("""
                        {"email":"%s","password":"StrongPass1!"}
                        """.formatted(email)))
                .andReturn();
        String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/verify").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void invalidCredentialsAndMissingOrInvalidTokensAreRejected() throws Exception {
        String email = uniqueEmail();
        signup(email, roleId("customer"));

        mockMvc.perform(post("/login")
                .contentType("application/json")
                .content("""
                        {"email":"%s","password":"WrongPass1!"}
                        """.formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

        mockMvc.perform(get("/verify"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(get("/verify").header("Authorization", "not-a-jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        String expiredToken = signedToken(email, Instant.now().minusSeconds(120), Instant.now().minusSeconds(60),
                "test-secret-key-that-is-at-least-32-characters-long");
        mockMvc.perform(get("/verify").header("Authorization", expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        String invalidSignatureToken = signedToken(email, Instant.now(), Instant.now().plusSeconds(60),
                "different-test-secret-key-that-is-at-least-32-characters-long");
        mockMvc.perform(get("/verify").header("Authorization", invalidSignatureToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void duplicateEmailIsCaseInsensitiveAndReturnsConflict() throws Exception {
        String email = uniqueEmail();
        signup(email, roleId("customer"));

        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Duplicate User","email":"%s","password":"StrongPass1!","role_id":%d}
                        """.formatted(email.toUpperCase(), roleId("customer"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
    }

    @Test
    void signupValidationReturnsCoherentBadRequest() throws Exception {
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"x","email":"invalid","password":"weak","role_id":null}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void publicGetProductsDoesNotRequireToken() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk());
    }

    @Test
    void publicPostSignupReachesSignupEndpointWithoutToken() throws Exception {
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Public Signup","email":"%s","password":"StrongPass1!","role_id":%d}
                        """.formatted(uniqueEmail(), roleId("customer"))))
                .andExpect(status().isCreated());
    }

    @Test
    void publicPostLoginReachesLoginEndpointWithoutToken() throws Exception {
        mockMvc.perform(post("/login")
                .contentType("application/json")
                .content("""
                        {"email":"missing-%s@example.com","password":"WrongPass1!"}
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void verifyRequiresToken() throws Exception {
        mockMvc.perform(get("/verify"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void postProductsDoesNotBecomePublicFromReadMatcher() throws Exception {
        mockMvc.perform(post("/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    private void signup(String email, long roleId) throws Exception {
        mockMvc.perform(post("/signup")
                .contentType("application/json")
                .content("""
                        {"name":"Test User","email":"%s","password":"StrongPass1!","role_id":%d}
                        """.formatted(email, roleId)))
                .andExpect(status().isCreated());
    }

    private long roleId(String code) {
        return roleRepository.findByCode(code).map(Role::getId).orElseThrow();
    }

    private String uniqueEmail() {
        return "phase4-" + UUID.randomUUID() + "@example.com";
    }

        private String uniqueTaxNo() {
                return "T" + String.format("%04d", Math.abs(UUID.randomUUID().hashCode()) % 10000)
                                + "V" + String.format("%06d", Math.abs(UUID.randomUUID().hashCode()) % 1000000);
        }

        private String uniqueValidBankAccount() {
                String bban = UUID.randomUUID().toString().replace("-", "").substring(0, 22)
                                .replaceAll("[a-f]", "0")
                                .replaceAll("[b-z]", "1");
                String checkDigits = String.format("%02d", 98 - new BigInteger(bban + "2927" + "00").mod(BigInteger.valueOf(97)).intValue());
                return "TR" + checkDigits + bban;
        }

        private String signedToken(String email, Instant issuedAt, Instant expiration, String secret) {
                return Jwts.builder()
                                .subject(email)
                                .issuedAt(Date.from(issuedAt))
                                .expiration(Date.from(expiration))
                                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                                .compact();
        }
}