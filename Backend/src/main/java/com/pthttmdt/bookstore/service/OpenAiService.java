package com.pthttmdt.bookstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenAiService {

    @Value("${app.openai.api-key:}")
    private String apiKey;

    @Value("${app.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${app.openai.model:gpt-4o-mini}")
    private String model;

    @Value("${app.openai.embedding-model:text-embedding-3-small}")
    private String embeddingModel;

    @Value("${app.openai.openrouter.referer:}")
    private String openRouterReferer;

    @Value("${app.openai.openrouter.title:Bookstore Chatbot}")
    private String openRouterTitle;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public String ask(String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }

        String endpoint = resolveBaseUrl() + "/chat/completions";

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("temperature", 0.3);
        payload.put("messages", List.of(
                Map.of("role", "system", "content", "You are a helpful e-commerce customer support chatbot. Keep responses short, friendly, and practical in Vietnamese."),
                Map.of("role", "user", "content", userMessage)
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        applyOpenRouterHeaders(headers);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {
                    }
            );
            Map<String, Object> body = response.getBody();
            if (body == null) {
                return null;
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            if (choices == null || choices.isEmpty()) {
                return null;
            }

            Map<String, Object> first = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) first.get("message");
            if (message == null) {
                return null;
            }

            Object content = message.get("content");
            return content != null ? content.toString().trim() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String askWithRagContext(String userMessage, List<RagService.RetrievedContext> contexts) {
        if (!isConfigured()) {
            return null;
        }

        StringBuilder contextBuilder = new StringBuilder();
        if (contexts != null) {
            for (int i = 0; i < contexts.size(); i++) {
                RagService.RetrievedContext context = contexts.get(i);
                contextBuilder.append("[Context ")
                        .append(i + 1)
                        .append("] Source=")
                        .append(context.sourceType())
                        .append(" | Title=")
                        .append(context.title())
                        .append(" | Score=")
                        .append(String.format(Locale.ROOT, "%.4f", context.score()))
                        .append("\n")
                        .append(context.content())
                        .append("\n\n");
            }
        }

        String systemPrompt = "Ban la tro ly cham soc khach hang cho website ban sach. "
                + "Chi tra loi dua tren context truy xuat duoc. "
                + "Neu context khong du thong tin, hay noi ro la chua du du lieu va de xuat thong tin can bo sung. "
                + "Tra loi ngan gon, ro rang, tieng Viet.";

        String enrichedPrompt = "Nguoi dung hoi: " + userMessage + "\n\n"
                + "Context truy xuat:\n" + contextBuilder;

        return askWithMessages(List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", enrichedPrompt)
        ));
    }

    @SuppressWarnings("unchecked")
    public List<Double> createEmbedding(String text) {
        if (!isConfigured() || text == null || text.isBlank()) {
            return null;
        }

        String endpoint = resolveBaseUrl() + "/embeddings";

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", embeddingModel);
        payload.put("input", text);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        applyOpenRouterHeaders(headers);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {
                    }
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                return null;
            }

            List<Map<String, Object>> data = (List<Map<String, Object>>) body.get("data");
            if (data == null || data.isEmpty()) {
                return null;
            }

            Object rawEmbedding = data.get(0).get("embedding");
            if (!(rawEmbedding instanceof List<?> rawList)) {
                return null;
            }

            List<Double> embedding = new ArrayList<>(rawList.size());
            for (Object value : rawList) {
                if (value instanceof Number number) {
                    embedding.add(number.doubleValue());
                }
            }

            return embedding.isEmpty() ? null : embedding;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String askWithMessages(List<Map<String, Object>> messages) {
        String endpoint = resolveBaseUrl() + "/chat/completions";

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("temperature", 0.2);
        payload.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        applyOpenRouterHeaders(headers);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<>() {
                    }
            );
            return extractContent(response.getBody());
        } catch (Exception ignored) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> body) {
        if (body == null) {
            return null;
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
        if (choices == null || choices.isEmpty()) {
            return null;
        }

        Map<String, Object> first = choices.get(0);
        Map<String, Object> message = (Map<String, Object>) first.get("message");
        if (message == null) {
            return null;
        }

        Object content = message.get("content");
        return content != null ? content.toString().trim() : null;
    }

    private String resolveBaseUrl() {
        String configuredBaseUrl = baseUrl == null ? "" : baseUrl.trim();
        if (configuredBaseUrl.isBlank()) {
            configuredBaseUrl = "https://api.openai.com/v1";
        }

        if (apiKey != null && apiKey.startsWith("sk-or-v1") && "https://api.openai.com/v1".equals(configuredBaseUrl)) {
            return "https://openrouter.ai/api/v1";
        }

        return configuredBaseUrl.endsWith("/") ? configuredBaseUrl.substring(0, configuredBaseUrl.length() - 1) : configuredBaseUrl;
    }

    private void applyOpenRouterHeaders(HttpHeaders headers) {
        if (!resolveBaseUrl().contains("openrouter.ai")) {
            return;
        }

        if (openRouterReferer != null && !openRouterReferer.isBlank()) {
            headers.add("HTTP-Referer", openRouterReferer.trim());
        }

        if (openRouterTitle != null && !openRouterTitle.isBlank()) {
            headers.add("X-Title", openRouterTitle.trim());
        }
    }
}
