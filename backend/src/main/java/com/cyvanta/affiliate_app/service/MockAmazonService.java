package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.AffiliateClick;
import com.cyvanta.affiliate_app.model.Product;
import com.cyvanta.affiliate_app.model.ShareAction;
import com.cyvanta.affiliate_app.model.SharedCommission;
import com.cyvanta.affiliate_app.model.User;
import com.cyvanta.affiliate_app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockAmazonService {

    private final AffiliateClickRepository affiliateClickRepository;
    private final ShareActionRepository shareActionRepository;
    private final ProductRepository productRepository;
    private final SharedCommissionRepository sharedCommissionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    @Async
    public void simulatePurchaseAsync(String trackingId) {
        log.info("[MOCK-MERCHANT] Simulating purchase tracking for trackingId: {}", trackingId);
        try {
            // Wait 5 seconds to simulate user browsing and buying
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        affiliateClickRepository.findByTrackingId(trackingId).ifPresent(click -> {
            if ("PENDING".equals(click.getStatus())) {
                String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                click.setStatus("PURCHASED");
                click.setOrderId(orderId);
                affiliateClickRepository.save(click);
                log.info("[MOCK-MERCHANT] ✅ Purchase simulated! Order {} created for trackingId: {}", orderId, trackingId);

                // Create a pending SharedCommission so it shows in the admin panel immediately
                createPendingCommission(click);
            }
        });
    }

    private void createPendingCommission(AffiliateClick click) {
        try {
            // Resolve referrer
            String referrerId = click.getReferrerId();
            if (referrerId == null && click.getShareId() != null) {
                referrerId = shareActionRepository.findByShareId(click.getShareId())
                        .map(ShareAction::getReferrerId).orElse(null);
            }
            if (referrerId == null) {
                log.info("[MOCK-MERCHANT] No referrer for trackingId={}, skipping commission", click.getTrackingId());
                return;
            }

            // Get product info
            Optional<Product> productOpt = click.getProductId() != null
                    ? productRepository.findById(click.getProductId())
                    : Optional.empty();

            Double productPrice = productOpt.map(Product::getPrice).orElse(500.0);
            Double commissionPct = productOpt.map(Product::getCommissionPercentage).orElse(10.0);
            Double totalCommission = productPrice * (commissionPct / 100.0);
            Double userPayout = totalCommission; // 100% to sharer
            String productName = productOpt.map(Product::getName).orElse("Product");
            String platform = productOpt.map(Product::getPlatform).orElse("Amazon");
            String referrerName = userRepository.findById(referrerId).map(User::getName).orElse("Affiliate");

            // Create pending SharedCommission
            SharedCommission sc = SharedCommission.builder()
                    .userId(referrerId)
                    .userName(referrerName)
                    .linkId(click.getShareId())
                    .shareId(click.getShareId())
                    .clickId(click.getTrackingId())
                    .orderId(click.getOrderId())
                    .productName(productName)
                    .store(platform)
                    .purchaseAmount(productPrice)
                    .commissionRate(commissionPct)
                    .commissionAmount(totalCommission)
                    .userSharePercent(100.0)
                    .userCommissionAmount(userPayout)
                    .adminCommissionPercent(0.0)
                    .adminCommissionAmount(0.0)
                    .status("pending")
                    .date(LocalDate.now())
                    .build();
            sharedCommissionRepository.save(sc);

            // Add to pending wallet
            walletService.processPendingCommission(referrerId, userPayout);

            log.info("[MOCK-MERCHANT] Pending commission ₹{} created for referrer {} (order {})",
                    userPayout, referrerName, click.getOrderId());
        } catch (Exception e) {
            log.error("[MOCK-MERCHANT] Failed to create pending commission: {}", e.getMessage());
        }
    }
}
