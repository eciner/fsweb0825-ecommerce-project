package com.eciner.ecommerce.auth;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "CORS_ALLOWED_ORIGINS= https://fsweb0825-ecommerce-project.vercel.app , , http://localhost:5173 , ")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CorsSecurityTests {

    private static final String VERCEL_ORIGIN = "https://fsweb0825-ecommerce-project.vercel.app";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void allowedOriginPreflightAcceptsApplicationMethodsAndHeaders() throws Exception {
        for (String method : new String[] {"GET", "POST", "PUT", "DELETE"}) {
            mockMvc.perform(options("/user/address")
                            .header("Origin", VERCEL_ORIGIN)
                            .header("Access-Control-Request-Method", method)
                            .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_ORIGIN))
                    .andExpect(header().string("Access-Control-Allow-Methods", containsString(method)))
                    .andExpect(header().string("Access-Control-Allow-Headers", containsString("Authorization")))
                    .andExpect(header().string("Access-Control-Allow-Headers", containsString("Content-Type")));
        }
    }

    @Test
    void allowedOriginsAreTrimmedAndReturnedExactly() throws Exception {
        mockMvc.perform(get("/health").header("Origin", VERCEL_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_ORIGIN))
                .andExpect(header().doesNotExist("Access-Control-Allow-Credentials"))
                .andExpect(jsonPath("$.status").value("UP"));

        mockMvc.perform(get("/health").header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void disallowedOriginIsNotGrantedCorsAccess() throws Exception {
        mockMvc.perform(options("/user/address")
                        .header("Origin", "https://unlisted.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void protectedEndpointStillRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/verify").header("Origin", VERCEL_ORIGIN))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Access-Control-Allow-Origin", VERCEL_ORIGIN));
    }

    @Test
    void publicEndpointRemainsAccessibleWithoutOrigin() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void wildcardOriginConfigurationIsRejected() {
        assertThrows(IllegalArgumentException.class,
                () -> new SecurityConfig().corsConfigurationSource("https://allowed.example, *"));
    }
}

@SpringBootTest(properties = "CORS_ALLOWED_ORIGINS=")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CorsNoAllowedOriginsTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void blankOriginConfigurationRejectsCrossOriginRequestsButStartsNormally() throws Exception {
        mockMvc.perform(get("/health").header("Origin", "https://unlisted.example"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));

        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }
}
