package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.AffiliateClick;
import com.cyvanta.affiliate_app.repository.AffiliateClickRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockAmazonService {

    private final AffiliateClickRepository affiliateClickRepository;

    @Async
    public void simulatePurchaseAsync(String trackingId) {
        log.info("Simulating Amazon purchase tracking for trackingId: {}", trackingId);
        try {
            // Wait 5 seconds to simulate user browsing and buying
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        affiliateClickRepository.findByTrackingId(trackingId).ifPresent(click -> {
            if ("PENDING".equals(click.getStatus())) {
                click.setStatus("PURCHASED");
                click.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                affiliateClickRepository.save(click);
                log.info("Purchase simulated! Order ID {} created for trackingId: {}", click.getOrderId(), trackingId);
            }
        });
    }
}
