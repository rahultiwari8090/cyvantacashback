package com.cyvanta.affiliate_app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


/**
 * SmsService — MessageCentral VerifyNow OTP Integration
 *
 * Uses a static pre-generated authToken from the MessageCentral console
 * (avoids re-generating tokens which requires an active subscription).
 *
 * Flow:
 *  1. sendOtpSms()              — POST /verification/v3/send → OTP sent to phone, verificationId stored
 *  2. verifyMessageCentralOtp() — POST /verification/v3/validateOtp → validates code entered by user
 */
@Slf4j
@Service
public class SmsService {

    private static final String BASE_URL = "https://cpaas.messagecentral.com";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${sms.messagecentral.customer-id:}")
    private String customerId;

    /** Static long-lived auth token from MessageCentral console → Developer Guide → API Credentials */
    @Value("${sms.messagecentral.auth-token:}")
    private String authToken;

    @Value("${sms.messagecentral.country-code:91}")
    private String countryCode;

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Send OTP via MessageCentral VerifyNow SMS.
     * Returns the verificationId so the caller can persist it in the database.
     *
     * @return verificationId from MessageCentral (never null — throws on failure)
     */
    public String sendOtpSms(String phone, String otp) {
        log.info("[SMS] MessageCentral: Sending OTP to {}", phone);

        if (!hasConfig()) {
            log.error("[SMS] MessageCentral not configured — customerId or authToken missing");
            logFallbackOtp(phone, otp);
            throw new RuntimeException("SMS provider not configured. Please contact support.");
        }

        String mobile = extractMobileNumber(phone);
        if (mobile.isEmpty()) {
            throw new RuntimeException("Invalid phone number: " + phone);
        }

        String verificationId = sendOtpRequest(mobile);
        if (verificationId == null) {
            logFallbackOtp(phone, otp);
            throw new RuntimeException("Failed to send OTP via MessageCentral. Please try again.");
        }

        log.info("[SMS] OTP sent to {}. verificationId={}", mobile, verificationId);
        return verificationId;
    }

    /**
     * Validate OTP code entered by user against MessageCentral.
     * The verificationId must be retrieved from the database and passed in.
     *
     * @param verificationId verificationId stored in DB from the send step
     * @param code           OTP entered by user
     * @return true if valid
     */
    public boolean verifyMessageCentralOtp(String verificationId, String code) {
        if (verificationId == null || verificationId.isBlank()) {
            log.warn("[SMS] verificationId is null/blank — cannot validate OTP.");
            return false;
        }

        boolean valid = validateOtpRequest(verificationId, code);
        if (valid) {
            log.info("[SMS] OTP validated for verificationId={}", verificationId);
        } else {
            log.warn("[SMS] OTP validation failed for verificationId={}", verificationId);
        }
        return valid;
    }

    /** Returns true if MessageCentral is configured and active. */
    public boolean isMessageCentralActive() {
        return hasConfig();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE — MessageCentral API Calls
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /verification/v3/send?countryCode=&customerId=&flowType=SMS&mobileNumber=
     * Header: authToken: <static token>
     *
     * @return verificationId or null on failure
     */
    private String sendOtpRequest(String mobile) {
        String url = BASE_URL + "/verification/v3/send"
                + "?countryCode=" + countryCode
                + "&customerId=" + customerId
                + "&flowType=SMS"
                + "&mobileNumber=" + mobile;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("authToken", authToken.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("[SMS] Send OTP response: status={}, body={}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());

                // Try common response shapes
                if (json.has("verificationId")) return json.get("verificationId").asText();
                if (json.has("data") && json.get("data").has("verificationId"))
                    return json.get("data").get("verificationId").asText();
                if (json.has("id")) return json.get("id").asText();

                log.error("[SMS] No verificationId in response: {}", response.getBody());
            } else {
                log.error("[SMS] Send OTP failed: status={}, body={}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("[SMS] sendOtpRequest exception for {}: {}", mobile, e.getMessage());
        }
        return null;
    }

    /**
     * POST /verification/v3/validateOtp?countryCode=&verificationId=&code=
     * Header: authToken: <static token>
     */
    private boolean validateOtpRequest(String verificationId, String code) {
        String url = BASE_URL + "/verification/v3/validateOtp"
                + "?countryCode=" + countryCode
                + "&verificationId=" + verificationId
                + "&code=" + code;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("authToken", authToken.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("[SMS] Validate OTP response: status={}, body={}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());

                if (json.has("verificationStatus"))
                    return "VERIFICATION_COMPLETED".equalsIgnoreCase(json.get("verificationStatus").asText());
                if (json.has("data") && json.get("data").has("verificationStatus"))
                    return "VERIFICATION_COMPLETED".equalsIgnoreCase(json.get("data").get("verificationStatus").asText());
                if (json.has("responseCode"))
                    return json.get("responseCode").asInt() == 200;
            }
        } catch (Exception e) {
            log.error("[SMS] validateOtpRequest exception: {}", e.getMessage());
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    private boolean hasConfig() {
        return customerId != null && !customerId.isBlank()
                && authToken != null && !authToken.isBlank();
    }

    private String extractMobileNumber(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^\\d]", "");
        if (digits.length() == 10) return digits;
        if (digits.length() == 12 && digits.startsWith("91")) return digits.substring(2);
        if (digits.length() == 11 && digits.startsWith("0")) return digits.substring(1);
        if (digits.length() > 10) return digits.substring(digits.length() - 10);
        return digits;
    }


    private void logFallbackOtp(String phone, String otp) {
        log.info("==========================================");
        log.info("[SMS FALLBACK] OTP for {}: {}", phone, otp);
        log.info("==========================================");
    }
}
