package com.eciner.ecommerce.role;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Contract test: role shape must let the signup form resolve customer/store selection by code. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoleControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rolesIncludeCustomerAndStoreWithIdNameCode() throws Exception {
        mockMvc.perform(get("/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code == 'customer')].name").value("Customer"))
                .andExpect(jsonPath("$[?(@.code == 'customer')].id").exists())
                .andExpect(jsonPath("$[?(@.code == 'store')].name").value("Store"))
                .andExpect(jsonPath("$[?(@.code == 'store')].id").exists());
    }

}
