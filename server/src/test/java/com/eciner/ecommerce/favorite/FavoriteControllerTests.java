package com.eciner.ecommerce.favorite;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.eciner.ecommerce.role.RoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FavoriteControllerTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired RoleRepository roles;
    @Autowired JdbcTemplate jdbc;

    @Test
    void favoritesPersistAreIdempotentAndStayOwnerScoped() throws Exception {
        String a = account(); String b = account();
        mvc.perform(get("/user/favorites")).andExpect(status().isUnauthorized());
        mvc.perform(put("/user/favorites/1")).andExpect(status().isUnauthorized());
        for (int i = 0; i < 2; i++) mvc.perform(put("/user/favorites/1").header("Authorization", a)).andExpect(status().isNoContent());
        mvc.perform(get("/user/favorites").header("Authorization", a)).andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(1));
        mvc.perform(get("/user/favorites").header("Authorization", b)).andExpect(jsonPath("$").isEmpty());
        mvc.perform(delete("/user/favorites/1").header("Authorization", b)).andExpect(status().isNoContent());
        mvc.perform(get("/user/favorites").header("Authorization", a)).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(put("/user/favorites/999999").header("Authorization", a)).andExpect(status().isNotFound());
        mvc.perform(put("/user/favorites/0").header("Authorization", a)).andExpect(status().isBadRequest());
        mvc.perform(delete("/user/favorites/1").header("Authorization", a)).andExpect(status().isNoContent());
        mvc.perform(get("/user/favorites").header("Authorization", a)).andExpect(jsonPath("$").isEmpty());
        assertThat(jdbc.queryForObject("select count(*) from user_favorite where product_id=999999", Integer.class)).isZero();
    }

    private String account() throws Exception {
        String email = "favorites-" + UUID.randomUUID() + "@example.test";
        long role = roles.findByCode("customer").orElseThrow().getId();
        mvc.perform(post("/signup").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Favorite User\",\"email\":\"" + email + "\",\"password\":\"StrongPass1!\",\"role_id\":" + role + "}"))
            .andExpect(status().isCreated());
        return mapper.readTree(mvc.perform(post("/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"" + email + "\",\"password\":\"StrongPass1!\"}"))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).path("token").asText();
    }
}
