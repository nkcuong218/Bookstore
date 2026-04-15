package com.pthttmdt.bookstore.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pthttmdt.bookstore.dto.ChatDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class PythonChatbotClient {

    @Value("${app.chatbot.python.base-url:}")
    private String baseUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public ChatDto.Response chat(ChatDto.Request request) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return null;
        }

        String endpoint = baseUrl + "/chat";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ChatDto.Request> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(endpoint, HttpMethod.POST, entity, Object.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return null;
            }

            return objectMapper.convertValue(response.getBody(), ChatDto.Response.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    public Integer reindex() {
        if (baseUrl == null || baseUrl.isBlank()) {
            return null;
        }

        String endpoint = baseUrl + "/reindex";

        try {
            ResponseEntity<java.util.Map<String, Object>> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    HttpEntity.EMPTY,
                    new ParameterizedTypeReference<>() {
                    }
            );
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return null;
            }

            Object value = response.getBody().get("totalDocuments");
            if (value instanceof Number number) {
                return number.intValue();
            }
            return null;
        } catch (Exception ignored) {
            return null;
        }
    }
}
