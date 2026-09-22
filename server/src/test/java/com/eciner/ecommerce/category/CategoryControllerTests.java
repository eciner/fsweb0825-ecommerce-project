package com.eciner.ecommerce.category;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Contract test: category shape must support gender/category shop routing (slug.js). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CategoryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void categoriesExposeGenderTitleImgCodeRating() throws Exception {
        MvcResult result = mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code == 'k:Kadin Elbise')].gender").value("k"))
                .andExpect(jsonPath("$[?(@.code == 'k:Kadin Elbise')].title").value("Kadin Elbise"))
                .andExpect(jsonPath("$[?(@.code == 'k:Kadin Elbise')].img").exists())
                .andExpect(jsonPath("$[?(@.code == 'k:Kadin Elbise')].rating").exists())
                .andExpect(jsonPath("$[?(@.code == 'e:Erkek Ceket')].gender").value("e"))
                .andReturn();

            JsonNode categories = objectMapper.readTree(result.getResponse().getContentAsString());
            assertThat(categories.size()).isGreaterThanOrEqualTo(5);
            java.util.Set<String> codes = new java.util.HashSet<>();
            categories.forEach(category -> codes.add(category.get("code").asText()));
            assertThat(codes).hasSize(categories.size());
    }

}
