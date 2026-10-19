package com.eciner.ecommerce.contact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
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
class ContactControllerTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ContactRepository repository;

    @Test
    void validContactPersistsAndReplayDoesNotDuplicateOrExposeMessages() throws Exception {
        UUID id = UUID.randomUUID();
        long before = repository.count();
        String body = body(id, "A synthetic message for a local test.", true, "");
        for (int i = 0; i < 2; i++) {
            String response = mvc.perform(post("/contact").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.reference").value(id.toString()))
                .andExpect(jsonPath("$.received_at").exists()).andReturn().getResponse().getContentAsString();
            assertThat(response).doesNotContain("sender@example.test", "synthetic message");
        }
        assertThat(repository.count()).isEqualTo(before + 1);
        assertThat(repository.findBySubmissionId(id)).isPresent();
        mvc.perform(post("/contact").contentType(MediaType.APPLICATION_JSON).content(body(id, "A changed message using the same reference.", true, "")))
            .andExpect(status().isConflict());
        mvc.perform(get("/contact")).andExpect(status().isUnauthorized());
    }

    @Test
    void validationAndHoneypotDoNotPersistMessages() throws Exception {
        long before = repository.count();
        for (String body : java.util.List.of(body(UUID.randomUUID(), "short", true, ""),
                body(UUID.randomUUID(), "A valid-length test message.", false, ""),
                body(UUID.randomUUID(), "A valid-length test message.", true, "spam"),
                body(UUID.randomUUID(), "          ", true, ""))) {
            mvc.perform(post("/contact").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
        }
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    void sixthNewSubmissionFromSameClientIsRateLimited() throws Exception {
        long before = repository.count();
        for (int i = 0; i < 5; i++) mvc.perform(post("/contact").with(request -> { request.setRemoteAddr("192.0.2.25"); return request; })
                .contentType(MediaType.APPLICATION_JSON).content(body(UUID.randomUUID(), "A valid rate-limit test message.", true, "")))
                .andExpect(status().isCreated());
        mvc.perform(post("/contact").with(request -> { request.setRemoteAddr("192.0.2.25"); return request; })
            .contentType(MediaType.APPLICATION_JSON).content(body(UUID.randomUUID(), "A valid rate-limit test message.", true, "")))
            .andExpect(status().isTooManyRequests()).andExpect(jsonPath("$.code").value("RATE_LIMITED"))
            .andExpect(header().string("Retry-After", "600"));
        assertThat(repository.count()).isEqualTo(before + 5);
    }
    @Test
    void arbitraryForwardedHeadersDoNotBypassDirectPeerLimit() throws Exception {
        for (int i = 0; i < 6; i++) {
            var result = mvc.perform(post("/contact")
                .with(request -> { request.setRemoteAddr("198.51.100.44"); return request; })
                .header("X-Forwarded-For", "203.0.113." + i)
                .header("Forwarded", "for=203.0.113." + i)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(UUID.randomUUID(), "Synthetic proxy-boundary test message.", true, "")));
            if (i < 5) result.andExpect(status().isCreated());
            else result.andExpect(status().isTooManyRequests());
        }
    }

    private String body(UUID id, String message, boolean consent, String website) throws Exception {
        return mapper.writeValueAsString(Map.of("submission_id", id, "name", "Synthetic Sender", "email", "sender@example.test",
            "subject", "Demo inquiry", "message", message, "consent", consent, "website", website));
    }
}
