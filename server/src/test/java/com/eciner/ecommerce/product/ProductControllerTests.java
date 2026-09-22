package com.eciner.ecommerce.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Contract tests derived from src/services/api.js, src/utils/query.js, src/utils/productModel.js
 * and the Postman collection: {total, limit, offset, products} list shape, category/filter/sort/
 * pagination query params, and the product detail field set productModel.js reads.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void defaultListReturnsSeededProductsWithDeterministicShape() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(9))
                .andExpect(jsonPath("$.limit").value(25))
                .andExpect(jsonPath("$.offset").value(0))
                .andExpect(jsonPath("$.products.length()").value(9))
                .andExpect(jsonPath("$.products[0].id").exists())
                .andExpect(jsonPath("$.products[0].name").exists())
                .andExpect(jsonPath("$.products[0].description").exists())
                .andExpect(jsonPath("$.products[0].price").exists())
                .andExpect(jsonPath("$.products[0].stock").exists())
                .andExpect(jsonPath("$.products[0].store_id").value(1))
                .andExpect(jsonPath("$.products[0].rating").exists())
                .andExpect(jsonPath("$.products[0].sell_count").exists())
                .andExpect(jsonPath("$.products[0].category_id").exists())
                .andExpect(jsonPath("$.products[0].images[0].url").exists())
                .andExpect(jsonPath("$.products[0].images[0].index").exists());
    }

    @Test
    void filterByNameReturnsOnlyMatchingProducts() throws Exception {
        mockMvc.perform(get("/products").param("filter", "siyah"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.products.length()").value(2))
                .andExpect(jsonPath("$.products[0].name").value(org.hamcrest.Matchers.containsStringIgnoringCase("siyah")))
                .andExpect(jsonPath("$.products[1].name").value(org.hamcrest.Matchers.containsStringIgnoringCase("siyah")));
    }

    @Test
    void filterByCategoryReturnsOnlyThatCategoryProducts() throws Exception {
        MvcResult categoriesResult = mockMvc.perform(get("/categories")).andReturn();
        JsonNode categories = objectMapper.readTree(categoriesResult.getResponse().getContentAsString());
        long categoryId = findCategoryIdByCode(categories, "e:Erkek Ceket");

        mockMvc.perform(get("/products").param("category", String.valueOf(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.products.length()").value(3))
                .andExpect(jsonPath("$.products[0].category_id").value(categoryId))
                .andExpect(jsonPath("$.products[1].category_id").value(categoryId))
                .andExpect(jsonPath("$.products[2].category_id").value(categoryId));
    }

    @Test
    void sortByPriceAscendingOrdersResults() throws Exception {
        MvcResult result = mockMvc.perform(get("/products").param("sort", "price:asc"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode products = body.get("products");

        double previous = -1;
        for (JsonNode product : products) {
            double price = product.get("price").asDouble();
            assertThat(price).isGreaterThanOrEqualTo(previous);
            previous = price;
        }
    }

    @Test
    void sortByPriceDescendingOrdersResults() throws Exception {
        MvcResult result = mockMvc.perform(get("/products").param("sort", "price:desc"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode products = objectMapper.readTree(result.getResponse().getContentAsString()).get("products");
        for (int index = 1; index < products.size(); index++) {
            assertThat(products.get(index - 1).get("price").asDouble())
                    .isGreaterThanOrEqualTo(products.get(index).get("price").asDouble());
        }
    }

    @Test
    void sortByRatingDescendingUsesIdAsStableTieBreaker() throws Exception {
        MvcResult result = mockMvc.perform(get("/products").param("sort", "rating:desc"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode products = objectMapper.readTree(result.getResponse().getContentAsString()).get("products");
        for (int index = 1; index < products.size(); index++) {
            JsonNode previous = products.get(index - 1);
            JsonNode current = products.get(index);
            assertThat(previous.get("rating").asDouble()).isGreaterThanOrEqualTo(current.get("rating").asDouble());
            if (previous.get("rating").asDouble() == current.get("rating").asDouble()) {
                assertThat(previous.get("id").asLong()).isLessThan(current.get("id").asLong());
            }
        }
    }

    @Test
    void invalidSortValueReturnsDeterministicBadRequest() throws Exception {
        mockMvc.perform(get("/products").param("sort", "invalid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("INVALID_SORT_PARAMETER"));
    }

    @Test
    void invalidLimitReturnsDeterministicBadRequest() throws Exception {
        mockMvc.perform(get("/products").param("limit", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void paginationSlicesResultsById() throws Exception {
        MvcResult fullResult = mockMvc.perform(get("/products").param("limit", "25").param("offset", "0"))
                .andReturn();
        JsonNode fullProducts = objectMapper.readTree(fullResult.getResponse().getContentAsString()).get("products");

        mockMvc.perform(get("/products").param("limit", "2").param("offset", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.limit").value(2))
                .andExpect(jsonPath("$.offset").value(2))
                .andExpect(jsonPath("$.products.length()").value(2))
                .andExpect(jsonPath("$.products[0].id").value(fullProducts.get(2).get("id").asLong()))
                .andExpect(jsonPath("$.products[1].id").value(fullProducts.get(3).get("id").asLong()));
    }

    @Test
    void equalPriceProductsRemainStableAcrossPages() throws Exception {
        MvcResult result = mockMvc.perform(get("/products").param("sort", "price:asc"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode products = objectMapper.readTree(result.getResponse().getContentAsString()).get("products");
        long firstEqualPriceId = -1;
        long secondEqualPriceId = -1;
        for (JsonNode product : products) {
            if (product.get("price").asDouble() == 349.50) {
                if (firstEqualPriceId < 0) {
                    firstEqualPriceId = product.get("id").asLong();
                } else {
                    secondEqualPriceId = product.get("id").asLong();
                    break;
                }
            }
        }

        assertThat(firstEqualPriceId).isPositive();
        assertThat(secondEqualPriceId).isGreaterThan(firstEqualPriceId);
    }

    @Test
    void combinedCategoryFilterSortAndPaginationPreservesActiveTotal() throws Exception {
        JsonNode categories = objectMapper.readTree(mockMvc.perform(get("/categories")).andReturn()
                .getResponse().getContentAsString());
        long categoryId = findCategoryIdByCode(categories, "e:Erkek Ceket");

        mockMvc.perform(get("/products")
                .param("category", String.valueOf(categoryId))
                .param("filter", "SIYAH")
                .param("sort", "price:desc")
                .param("limit", "1")
                .param("offset", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.limit").value(1))
                .andExpect(jsonPath("$.products.length()").value(1))
                .andExpect(jsonPath("$.products[0].name").value("Siyah Erkek Ceket"));
    }

    @Test
    void productDetailReturnsFullShapeMatchingList() throws Exception {
        MvcResult listResult = mockMvc.perform(get("/products").param("limit", "1")).andReturn();
        JsonNode firstProduct = objectMapper
                .readTree(listResult.getResponse().getContentAsString())
                .get("products")
                .get(0);
        long productId = firstProduct.get("id").asLong();

        mockMvc.perform(get("/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId))
                .andExpect(jsonPath("$.name").value(firstProduct.get("name").asText()))
                .andExpect(jsonPath("$.store_id").value(1))
                .andExpect(jsonPath("$.category_id").exists())
                .andExpect(jsonPath("$.sell_count").exists())
                .andExpect(jsonPath("$.images[0].url").exists());
    }

    @Test
    void productDetailUnknownIdReturnsDeterministicNotFound() throws Exception {
        mockMvc.perform(get("/products/{id}", 999_999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    void productDetailNonNumericIdReturnsDeterministicBadRequest() throws Exception {
        mockMvc.perform(get("/products/{id}", "not-a-number"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST_PARAMETER"));
    }

    private long findCategoryIdByCode(JsonNode categories, String code) {
        for (JsonNode category : categories) {
            if (code.equals(category.get("code").asText())) {
                return category.get("id").asLong();
            }
        }
        throw new IllegalStateException("Category with code " + code + " not found in seed data.");
    }

}
