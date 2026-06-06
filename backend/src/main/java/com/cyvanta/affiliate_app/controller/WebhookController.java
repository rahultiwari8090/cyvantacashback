package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.service.AffiliateTrackingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final AffiliateTrackingService affiliateTrackingService;

    @PostMapping("/affiliate-update")
    public ResponseEntity<String> handleAffiliateUpdate(@RequestBody WebhookPayload payload) {
        // e.g. Extracting the tracking parameters
        // Example: payload from network contains orderId, totalCommission, status, subid1
        
        affiliateTrackingService.processWebhook(
                payload.getOrderId(),
                payload.getSubid1(),
                payload.getCommission(),
                payload.getStatus()
        );

        return ResponseEntity.ok("Webhook processed successfully");
    }

    @Data
    public static class WebhookPayload {
        private String orderId;
        private Double commission;
        private String status; // "PENDING", "APPROVED", "REJECTED"
        private String subid1; // This is the referralCode we sent
    }
}
