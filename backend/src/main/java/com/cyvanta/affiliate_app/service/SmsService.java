package com.cyvanta.affiliate_app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${sms.provider:}")
    private String provider;

    @Value("${sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${sms.twilio.from-number:}")
    private String twilioFromNumber;

    @Value("${sms.twilio.service-id:}")
    private String twilioServiceId;

    /**
     * Send OTP via SMS using the configured provider.
     * Tries Twilio Verify API first (if service ID is configured), then falls back
     * to the raw Messages API, then to a console-only simulator.
     */
    public boolean sendOtpSms(String phone, String otp) {
        log.info("[SMS] Attempting to send OTP to {} via provider={}", phone, provider);

        if (provider != null && provider.equalsIgnoreCase("twilio") && hasTwilioConfig()) {
            // Prefer Twilio Verify API when a Service ID is available
            if (twilioServiceId != null && !twilioServiceId.isBlank()) {
                boolean sent = sendTwilioVerify(phone);
                if (sent) return true;
                log.warn("[SMS] Twilio Verify API failed, falling back to Messages API");
            }

            // Fallback: raw Twilio Messages API
            boolean sent = sendTwilioSms(phone, otp);
            if (sent) return true;

            log.warn("[SMS] Both Twilio APIs failed for {}. OTP is logged below for manual testing.", phone);
        } else {
            log.warn("[SMS] SMS provider is not configured or Twilio credentials are missing.");
        }

        // Simulator fallback — always log the OTP for dev/testing
        log.info("===========================================");
        log.info("[SMS SIMULATOR] OTP for {}: {}", phone, otp);
        log.info("===========================================");
        return false;
    }

    /**
     * Verify an OTP code that was sent via Twilio Verify API.
     * Call this from the controller when verifying a phone-based OTP.
     * Returns true if Twilio confirms the code is correct.
     */
    public boolean verifyTwilioCode(String phone, String code) {
        if (twilioServiceId == null || twilioServiceId.isBlank() || !hasTwilioConfig()) {
            return false;
        }

        String url = String.format(
            "https://verify.twilio.com/v2/Services/%s/VerificationCheck",
            twilioServiceId
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(twilioAccountSid, twilioAuthToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("To", phone);
        body.add("Code", code);

        try {
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                String status = json.has("status") ? json.get("status").asText() : "";
                if ("approved".equals(status)) {
                    log.info("[SMS] Twilio Verify confirmed OTP for {}", phone);
                    return true;
                }
                log.warn("[SMS] Twilio Verify check returned status={} for {}", status, phone);
            }
        } catch (Exception e) {
            log.error("[SMS] Twilio Verify check failed for {}: {}", phone, e.getMessage());
        }
        return false;
    }

    private boolean hasTwilioConfig() {
        boolean configured = twilioAccountSid != null && !twilioAccountSid.isBlank()
            && twilioAuthToken != null && !twilioAuthToken.isBlank();
        if (!configured) {
            log.warn("[SMS] Twilio config check failed — accountSid={}, authToken={}",
                twilioAccountSid != null ? "SET" : "MISSING",
                twilioAuthToken != null ? "SET" : "MISSING");
        }
        return configured;
    }

    /**
     * Use Twilio Verify API to send a verification code.
     * This is preferred because Verify handles rate limiting, code generation,
     * and delivery on its own. The OTP code parameter is ignored — Twilio generates its own.
     */
    private boolean sendTwilioVerify(String phone) {
        String url = String.format(
            "https://verify.twilio.com/v2/Services/%s/Verifications",
            twilioServiceId
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(twilioAccountSid, twilioAuthToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("To", phone);
        body.add("Channel", "sms");

        try {
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[SMS] OTP sent via Twilio Verify API to {}", phone);
                log.info("[SMS] Twilio Verify response: {}", response.getBody());
                return true;
            }

            log.error("[SMS] Twilio Verify API responded with status {} for {}. Response: {}",
                response.getStatusCode(), phone, response.getBody());
        } catch (Exception e) {
            log.error("[SMS] Twilio Verify API failed for {}: {}", phone, e.getMessage());
            // Log the full exception for debugging
            if (e.getMessage() != null && e.getMessage().contains("60200")) {
                log.error("[SMS] Twilio Error 60200: The phone number {} is not verified. " +
                    "On Twilio trial accounts, you can only send to verified numbers. " +
                    "Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified " +
                    "to add verified numbers, or upgrade your Twilio account.", phone);
            }
        }
        return false;
    }

    /**
     * Fallback: use raw Twilio Messages API to send a custom OTP message.
     * This requires the "From" number to be a Twilio-owned number.
     */
    private boolean sendTwilioSms(String to, String otp) {
        String url = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", twilioAccountSid);
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(twilioAccountSid, twilioAuthToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("From", twilioFromNumber);
        body.add("To", to);
        body.add("Body", "Your Cyvanta Cashback OTP is " + otp + ". It expires in 10 minutes.");

        try {
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[SMS] OTP sent via Twilio Messages API to {}", to);
                return true;
            }
            log.error("[SMS] Twilio Messages API responded with status {} for {}. Response: {}",
                response.getStatusCode(), to, response.getBody());
        } catch (Exception e) {
            log.error("[SMS] Twilio Messages API failed for {}: {}", to, e.getMessage());
            // Detect trial account limitation
            if (e.getMessage() != null && e.getMessage().contains("21608")) {
                log.error("[SMS] Twilio Error 21608: The 'To' number {} is unverified. " +
                    "Trial accounts can only send to verified caller IDs. " +
                    "Verify the number at https://console.twilio.com or upgrade your account.", to);
            }
        }
        return false;
    }
}
