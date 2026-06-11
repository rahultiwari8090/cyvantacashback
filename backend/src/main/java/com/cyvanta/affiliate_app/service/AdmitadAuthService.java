package com.cyvanta.affiliate_app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
@Slf4j
public class AdmitadAuthService {

    @Value("${admitad.client-id}")
    private String clientId;

    @Value("${admitad.client-secret}")
    private String clientSecret;

    private String accessToken;
    private long tokenExpiryTime;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getAccessToken() {
        if (accessToken != null && System.currentTimeMillis() < tokenExpiryTime) {
            return accessToken;
        }

        return requestNewToken();
    }

    private synchronized String requestNewToken() {
        // Double checked locking
        if (accessToken != null && System.currentTimeMillis() < tokenExpiryTime) {
            return accessToken;
        }

        try {
            String url = "https://api.admitad.com/token/";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String authHeader = "Basic " + Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());
            headers.set("Authorization", authHeader);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("client_id", clientId);
            body.add("scope", "statistics");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> bodyMap = response.getBody();
                accessToken = (String) bodyMap.get("access_token");
                Integer expiresIn = (Integer) bodyMap.get("expires_in"); // typically 604800 (7 days)
                
                // Set expiry time (subtract 5 minutes for buffer)
                tokenExpiryTime = System.currentTimeMillis() + ((expiresIn - 300) * 1000L);
                
                log.info("Successfully fetched new Admitad access token.");
                return accessToken;
            }
        } catch (Exception e) {
            log.error("Failed to fetch Admitad access token: {}", e.getMessage());
        }

        return null;
    }
}
