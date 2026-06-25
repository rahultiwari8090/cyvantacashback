package com.cyvanta.affiliate_app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class KeepAwakeService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String RENDER_URL = "https://cyvantacashback-3.onrender.com/api/users/health";

    // Run every 10 minutes (600000 ms) to keep the Render free tier instance awake
    @Scheduled(fixedRate = 600000)
    public void pingRender() {
        try {
            log.info("[KEEP-AWAKE] Pinging Render server to prevent it from sleeping...");
            String response = restTemplate.getForObject(RENDER_URL, String.class);
            log.info("[KEEP-AWAKE] Ping successful: {}", response);
        } catch (Exception e) {
            log.error("[KEEP-AWAKE] Ping failed. The server might have gone to sleep or URL is incorrect: {}", e.getMessage());
        }
    }
}
