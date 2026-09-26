package com.eciner.ecommerce.address;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eciner.ecommerce.payment.SavedCard;
import com.eciner.ecommerce.payment.SavedCardRepository;
import com.eciner.ecommerce.role.Role;
import com.eciner.ecommerce.role.RoleRepository;
import com.eciner.ecommerce.user.User;
import com.eciner.ecommerce.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.lang.reflect.Field;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserResourcesControllerTests {

    private static final String ADDRESS_JSON = """
            {"title":"Home","name":"Test","surname":"Person","phone":"05551112233","city":"istanbul","district":"esenler","neighborhood":"Street 1"}
            """;
    private static final String CARD_JSON = """
            {"card_no":"1234123412341234","expire_month":12,"expire_year":2030,"name_on_card":"Test Person"}
            """;

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SavedCardRepository savedCardRepository;

    @Test
    void allAddressAndCardOperationsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/user/address")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/user/address").contentType(MediaType.APPLICATION_JSON).content(ADDRESS_JSON))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/user/address").contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":1,\"title\":\"Home\",\"name\":\"Test\",\"surname\":\"Person\",\"phone\":\"05551112233\",\"city\":\"istanbul\",\"district\":\"esenler\",\"neighborhood\":\"Street 1\"}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/user/address/1")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/user/card")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/user/card").contentType(MediaType.APPLICATION_JSON).content(CARD_JSON))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/user/card").contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":1,\"card_no\":\"1234123412341234\",\"expire_month\":12,\"expire_year\":2030,\"name_on_card\":\"Test Person\"}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/user/card/1")).andExpect(status().isUnauthorized());
    }

    @Test
    void addressCrudIsOwnerScopedAndUnknownIdsReturnNotFound() throws Exception {
        AuthenticatedUser ownerA = createAccount();
        AuthenticatedUser ownerB = createAccount();
        long addressA = createAddress(ownerA.token());
        long addressB = createAddress(ownerB.token());

        mockMvc.perform(get("/user/address").header("Authorization", ownerA.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(addressA))
                .andExpect(jsonPath("$[0].title").value("Home"))
                .andExpect(jsonPath("$[0].neighborhood").value("Street 1"))
                .andExpect(jsonPath("$[1]").doesNotExist());

        mockMvc.perform(put("/user/address").header("Authorization", ownerA.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(addressUpdateJson(addressA, "Updated home")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated home"));
        mockMvc.perform(put("/user/address").header("Authorization", ownerA.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(addressUpdateJson(addressB, "Attempted takeover")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADDRESS_NOT_FOUND"));
        mockMvc.perform(delete("/user/address/" + addressB).header("Authorization", ownerA.token()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ADDRESS_NOT_FOUND"));
        mockMvc.perform(delete("/user/address/999999").header("Authorization", ownerA.token()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/user/address").header("Authorization", ownerB.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(addressB));
        mockMvc.perform(delete("/user/address/" + addressA).header("Authorization", ownerA.token()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/user/address").header("Authorization", ownerA.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void cardCrudIsOwnerScopedAndNeverPersistsCvv() throws Exception {
        AuthenticatedUser ownerA = createAccount();
        AuthenticatedUser ownerB = createAccount();
        long cardA = createCard(ownerA.token(), "4111111111111111");
        long cardB = createCard(ownerB.token(), "5555555555554444");

        mockMvc.perform(get("/user/card").header("Authorization", ownerA.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(cardA))
                .andExpect(jsonPath("$[0].card_no").value("4111111111111111"))
                .andExpect(jsonPath("$[0].cvv").doesNotExist())
                .andExpect(jsonPath("$[1]").doesNotExist());

        mockMvc.perform(put("/user/card").header("Authorization", ownerA.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(cardUpdateJson(cardA, "4111111111111112")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.card_no").value("4111111111111112"));
        mockMvc.perform(put("/user/card").header("Authorization", ownerA.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(cardUpdateJson(cardB, "4111111111111113")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("CARD_NOT_FOUND"));
        mockMvc.perform(delete("/user/card/" + cardB).header("Authorization", ownerA.token()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("CARD_NOT_FOUND"));
        mockMvc.perform(delete("/user/card/999999").header("Authorization", ownerA.token()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/user/card").header("Authorization", ownerB.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(cardB));
        SavedCard persisted = savedCardRepository.findById(cardA).orElseThrow();
        assertThat(Arrays.stream(SavedCard.class.getDeclaredFields()).map(Field::getName))
                .doesNotContain("cvv", "cvc", "ccv");
        assertThat(persisted.getOwner().getId()).isEqualTo(ownerA.userId());

        mockMvc.perform(delete("/user/card/" + cardA).header("Authorization", ownerA.token()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/user/card").header("Authorization", ownerA.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void addressAndCardValidationFailuresReturnBadRequest() throws Exception {
        AuthenticatedUser user = createAccount();
        mockMvc.perform(post("/user/address").header("Authorization", user.token())
                .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mockMvc.perform(put("/user/address").header("Authorization", user.token())
                .contentType(MediaType.APPLICATION_JSON).content(ADDRESS_JSON))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/user/card").header("Authorization", user.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"card_no\":\"123\",\"expire_month\":13,\"expire_year\":2030,\"name_on_card\":\"Test\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

        @Test
        void futureDatedCardCreateSucceeds() throws Exception {
                AuthenticatedUser user = createAccount();
                YearMonth expiry = YearMonth.now().plusYears(1);

                mockMvc.perform(post("/user/card").header("Authorization", user.token())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(cardJson("4111111111111111", expiry)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.expire_month").value(expiry.getMonthValue()))
                                .andExpect(jsonPath("$.expire_year").value(expiry.getYear()));
        }

        @Test
        void expiredCardCreateReturnsBadRequest() throws Exception {
                AuthenticatedUser user = createAccount();
                YearMonth expiry = YearMonth.now().minusMonths(1);

                mockMvc.perform(post("/user/card").header("Authorization", user.token())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(cardJson("4111111111111111", expiry)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.code").value("EXPIRED_CARD"));
        }

        @Test
        void futureDatedCardUpdateSucceeds() throws Exception {
                AuthenticatedUser user = createAccount();
                long cardId = createCard(user.token(), "4111111111111111");
                YearMonth expiry = YearMonth.now().plusYears(1);

                mockMvc.perform(put("/user/card").header("Authorization", user.token())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(cardUpdateJson(cardId, "4111111111111112", expiry)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.expire_month").value(expiry.getMonthValue()))
                                .andExpect(jsonPath("$.expire_year").value(expiry.getYear()));
        }

        @Test
        void expiredCardUpdateReturnsBadRequest() throws Exception {
                AuthenticatedUser user = createAccount();
                long cardId = createCard(user.token(), "4111111111111111");
                YearMonth expiry = YearMonth.now().minusMonths(1);

                mockMvc.perform(put("/user/card").header("Authorization", user.token())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(cardUpdateJson(cardId, "4111111111111112", expiry)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.code").value("EXPIRED_CARD"));
        }

    private AuthenticatedUser createAccount() throws Exception {
        String email = "phase5-" + UUID.randomUUID() + "@example.com";
        long roleId = roleRepository.findByCode("customer").map(Role::getId).orElseThrow();
        String signupBody = """
                {"name":"Phase Five User","email":"%s","password":"StrongPass1!","role_id":%d}
                """.formatted(email, roleId);
        JsonNode signupResponse = objectMapper.readTree(mockMvc.perform(post("/signup")
                .contentType(MediaType.APPLICATION_JSON).content(signupBody))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        String loginBody = """
                {"email":"%s","password":"StrongPass1!"}
                """.formatted(email);
        JsonNode loginResponse = objectMapper.readTree(mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertThat(signupResponse.path("id").asLong()).isEqualTo(user.getId());
        return new AuthenticatedUser(loginResponse.path("token").asText(), user.getId());
    }

    private long createAddress(String token) throws Exception {
        String response = mockMvc.perform(post("/user/address").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON).content(ADDRESS_JSON))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("id").asLong();
    }

    private long createCard(String token, String cardNo) throws Exception {
                String body = cardJson(cardNo, YearMonth.now().plusYears(1));
        String response = mockMvc.perform(post("/user/card").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("id").asLong();
    }

    private String addressUpdateJson(long id, String title) {
        return """
                {"id":%d,"title":"%s","name":"Test","surname":"Person","phone":"05551112233","city":"istanbul","district":"esenler","neighborhood":"Street 1"}
                """.formatted(id, title);
    }

    private String cardUpdateJson(long id, String cardNo) {
                return cardUpdateJson(id, cardNo, YearMonth.now().plusYears(1));
        }

        private String cardJson(String cardNo, YearMonth expiry) {
                return """
                                {"card_no":"%s","expire_month":%d,"expire_year":%d,"name_on_card":"Test Person"}
                                """.formatted(cardNo, expiry.getMonthValue(), expiry.getYear());
        }

        private String cardUpdateJson(long id, String cardNo, YearMonth expiry) {
        return """
                                {"id":%d,"card_no":"%s","expire_month":%d,"expire_year":%d,"name_on_card":"Updated Person"}
                                """.formatted(id, cardNo, expiry.getMonthValue(), expiry.getYear());
    }

    private record AuthenticatedUser(String token, Long userId) {
    }
}
