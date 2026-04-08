package com.pthttmdt.bookstore.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pthttmdt.bookstore.entity.Order;
import com.pthttmdt.bookstore.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayOSPaymentService {

    private static final String PAYOS_API_URL = "https://api-merchant.payos.vn/v2/payment-requests";

    private final ObjectMapper objectMapper;

    @Value("${app.payos.client-id:}")
    private String clientId;

    @Value("${app.payos.api-key:}")
    private String apiKey;

    @Value("${app.payos.checksum-key:}")
    private String checksumKey;

    @Value("${app.payos.return-url:http://localhost:5173/my-orders}")
    private String returnUrl;

    @Value("${app.payos.cancel-url:http://localhost:5173/my-orders}")
    private String cancelUrl;

    public PaymentLinkResult createPaymentLink(Order order, List<OrderItem> orderItems) {
        String normalizedClientId = normalize(clientId);
        String normalizedApiKey = normalize(apiKey);
        String normalizedChecksumKey = normalize(checksumKey);
        String normalizedReturnUrl = normalize(returnUrl);
        String normalizedCancelUrl = normalize(cancelUrl);

        if (order == null || order.getId() == null || order.getTotalAmount() == null || order.getTotalAmount() <= 0) {
            return new PaymentLinkResult(null, null, null, "FAILED", "Order data is invalid for PayOS");
        }

        if (isBlank(normalizedClientId) || isBlank(normalizedApiKey) || isBlank(normalizedChecksumKey)) {
            return new PaymentLinkResult(null, null, null, "FAILED_CONFIG", "Missing PayOS credentials");
        }

        if (isBlank(normalizedReturnUrl) || isBlank(normalizedCancelUrl)) {
            return new PaymentLinkResult(null, null, null, "FAILED_CONFIG", "Missing PayOS return/cancel URL");
        }

        try {
            long payosOrderCode = order.getId();
            String description = buildDescription(order);
            int amount = order.getTotalAmount().intValue();

            Map<String, String> signatureFields = new LinkedHashMap<>();
            signatureFields.put("amount", String.valueOf(amount));
            signatureFields.put("cancelUrl", normalizedCancelUrl);
            signatureFields.put("description", description);
            signatureFields.put("orderCode", String.valueOf(payosOrderCode));
            signatureFields.put("returnUrl", normalizedReturnUrl);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("orderCode", payosOrderCode);
            payload.put("amount", amount);
            payload.put("description", description);
            payload.put("buyerName", order.getCustomerName());
            payload.put("buyerEmail", order.getEmail());
            payload.put("buyerPhone", order.getPhone());
            payload.put("items", orderItems.stream().map(item -> Map.of(
                    "name", safeText(item.getBookTitle(), order.getOrderCode()),
                    "quantity", item.getQuantity(),
                    "price", item.getPrice().intValue(),
                    "unit", "piece"
            )).toList());
                    payload.put("cancelUrl", normalizedCancelUrl);
                    payload.put("returnUrl", normalizedReturnUrl);
                    payload.put("signature", generateSignature(signatureFields, normalizedChecksumKey));

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PAYOS_API_URL))
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .header("x-client-id", normalizedClientId)
                        .header("x-api-key", normalizedApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String responseBody = response.body();
                System.err.println("[PayOS] Create payment link failed: HTTP " + response.statusCode() + " - " + responseBody);
                return new PaymentLinkResult(null, null, null, "FAILED", summarizeFailure(responseBody, "HTTP " + response.statusCode()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode data = root.path("data");
            String payosStatus = textValue(data, "status");
            if (payosStatus == null || payosStatus.trim().isEmpty()) {
                payosStatus = "PENDING";
            }

            String checkoutUrl = textValue(data, "checkoutUrl");
            String qrCode = textValue(data, "qrCode");
            String paymentLinkId = textValue(data, "paymentLinkId");

            if (isBlank(checkoutUrl) && isBlank(qrCode)) {
                String responseBody = response.body();
                System.err.println("[PayOS] Missing checkoutUrl/qrCode in response: " + responseBody);
                return new PaymentLinkResult(null, null, paymentLinkId, "FAILED", summarizeFailure(responseBody, "PayOS did not return QR/link"));
            }

            return new PaymentLinkResult(
                    checkoutUrl,
                    qrCode,
                    paymentLinkId,
                    payosStatus,
                    null
            );
        } catch (Exception e) {
            System.err.println("[PayOS] Exception while creating payment link: " + e.getMessage());
            return new PaymentLinkResult(null, null, null, "FAILED", e.getMessage());
        }
    }

    public PaymentStatusResult getPaymentStatus(Order order) {
        if (order == null || order.getId() == null) {
            return new PaymentStatusResult(null, "Order data is invalid");
        }

        String normalizedClientId = normalize(clientId);
        String normalizedApiKey = normalize(apiKey);

        if (isBlank(normalizedClientId) || isBlank(normalizedApiKey)) {
            return new PaymentStatusResult(null, "Missing PayOS credentials");
        }

        List<String> candidateUrls = new java.util.ArrayList<>();
        if (!isBlank(order.getPaymentLinkId())) {
            candidateUrls.add(PAYOS_API_URL + "/" + order.getPaymentLinkId().trim());
        }
        candidateUrls.add(PAYOS_API_URL + "/" + order.getId());

        for (String url : candidateUrls) {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .header("x-client-id", normalizedClientId)
                        .header("x-api-key", normalizedApiKey)
                        .GET()
                        .build();

                HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    continue;
                }

                JsonNode root = objectMapper.readTree(response.body());
                JsonNode data = root.path("data");
                String payosStatus = textValue(data, "status");
                if (!isBlank(payosStatus)) {
                    return new PaymentStatusResult(payosStatus.trim().toUpperCase(), null);
                }
            } catch (Exception ignored) {
                // Try next candidate URL.
            }
        }

        return new PaymentStatusResult(null, "Could not fetch PayOS status");
    }

    private String buildDescription(Order order) {
        String orderCode = order.getOrderCode() == null ? "ORDER" : order.getOrderCode().replaceAll("[^A-Za-z0-9]", "");
        if (orderCode.isEmpty()) {
            orderCode = "ORDER";
        }
        return orderCode.length() > 20 ? orderCode.substring(0, 20) : orderCode;
    }

    private String generateSignature(Map<String, String> fields, String secretKey) throws Exception {
        String data = fields.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));

        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    private String textValue(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private String safeText(String text, String fallback) {
        if (text == null || text.trim().isEmpty()) {
            return fallback;
        }
        return text.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String summarizeFailure(String responseBody, String fallback) {
        if (responseBody == null || responseBody.trim().isEmpty()) {
            return fallback;
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String desc = textValue(root, "desc");
            if (!isBlank(desc)) {
                return desc;
            }

            JsonNode data = root.path("data");
            String dataDesc = textValue(data, "desc");
            if (!isBlank(dataDesc)) {
                return dataDesc;
            }
        } catch (Exception ignored) {
            // Ignore parse errors and return fallback.
        }

        return fallback;
    }

    public record PaymentLinkResult(String checkoutUrl, String qrCode, String paymentLinkId, String status, String reason) {}
    public record PaymentStatusResult(String status, String reason) {}
}