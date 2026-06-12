package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.*;
import com.cyvanta.affiliate_app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockAffiliateService implements AffiliateNetworkService {

    private final AffiliateClickRepository affiliateClickRepository;
    private final ShareActionRepository shareActionRepository;
    private final ProductRepository productRepository;
    private final CommissionHistoryRepository commissionHistoryRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final SharedCommissionRepository sharedCommissionRepository;
    private final SharedLinkRepository sharedLinkRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final MockAmazonService mockAmazonService;

    @Override
    public void processClick(AffiliateClick click) {
        log.info("[AFFILIATE] Click created — trackingId={}, shareId={}, productId={}, buyerId={}",
                click.getTrackingId(), click.getShareId(), click.getProductId(), click.getBuyerId());

        // Resolve referrer from shareId and store on the click
        if (click.getShareId() != null) {
            shareActionRepository.findByShareId(click.getShareId()).ifPresent(share -> {
                click.setReferrerId(share.getReferrerId());
                affiliateClickRepository.save(click);
                log.info("[AFFILIATE] Resolved referrer {} from shareId {}", share.getReferrerId(), click.getShareId());
            });
        }

        // Simulate the merchant purchase (after 5 seconds, status → PURCHASED)
        mockAmazonService.simulatePurchaseAsync(click.getTrackingId());
    }

    @Override
    public void approveCommission(String trackingId) {
        Optional<AffiliateClick> clickOpt = affiliateClickRepository.findByTrackingId(trackingId);
        if (clickOpt.isEmpty()) {
            log.warn("[AFFILIATE] approveCommission — trackingId {} not found", trackingId);
            return;
        }

        AffiliateClick click = clickOpt.get();
        if (!"PURCHASED".equals(click.getStatus())) {
            log.warn("[AFFILIATE] approveCommission — trackingId {} status is {} (expected PURCHASED)", trackingId, click.getStatus());
            return;
        }

        click.setStatus("APPROVED");
        affiliateClickRepository.save(click);
        log.info("[AFFILIATE] Click {} status → APPROVED", trackingId);

        // Resolve referrer
        String referrerId = click.getReferrerId();
        if (referrerId == null && click.getShareId() != null) {
            Optional<ShareAction> shareOpt = shareActionRepository.findByShareId(click.getShareId());
            if (shareOpt.isPresent()) {
                referrerId = shareOpt.get().getReferrerId();
            }
        }
        if (referrerId == null) {
            log.warn("[AFFILIATE] No referrer found for trackingId {}", trackingId);
            return;
        }

        // Calculate commission
        Optional<Product> productOpt = click.getProductId() != null
                ? productRepository.findById(click.getProductId())
                : Optional.empty();

        Double productPrice = productOpt.map(Product::getPrice).orElse(500.0);
        Double commissionPct = productOpt.map(Product::getCommissionPercentage).orElse(10.0);
        Double totalCommission = productPrice * (commissionPct / 100.0);
        Double userPayout = totalCommission; // 100% to sharer
        Double adminProfit = 0.0;

        String productName = productOpt.map(Product::getName).orElse("Unknown Product");
        String platform = productOpt.map(Product::getPlatform).orElse("Amazon");
        String referrerName = userRepository.findById(referrerId).map(User::getName).orElse("Unknown");

        // 1. Record CommissionHistory
        CommissionHistory history = CommissionHistory.builder()
                .trackingId(trackingId)
                .referrerId(referrerId)
                .amount(userPayout)
                .status("APPROVED")
                .build();
        commissionHistoryRepository.save(history);
        log.info("[AFFILIATE] CommissionHistory created — trackingId={}, referrer={}, amount={}", trackingId, referrerId, userPayout);

        // 2. Credit referrer wallet
        walletService.processApprovedCommission(referrerId, userPayout);
        log.info("[AFFILIATE] Wallet credited — referrer={}, amount={}", referrerId, userPayout);

        // 3. Record WalletTransaction audit log
        WalletTransaction wt = WalletTransaction.builder()
                .userId(referrerId)
                .trackingId(trackingId)
                .amount(userPayout)
                .type("CREDIT")
                .description("Affiliate Commission Approved for Order: " + click.getOrderId())
                .build();
        walletTransactionRepository.save(wt);

        // 4. Create/update SharedCommission for admin dashboard visibility
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
                .adminCommissionAmount(adminProfit)
                .status("approved")
                .date(LocalDate.now())
                .build();
        sharedCommissionRepository.save(sc);
        log.info("[AFFILIATE] SharedCommission record created for admin dashboard — referrer={}", referrerName);

        // 5. Update SharedLink stats if exists
        if (click.getShareId() != null) {
            sharedLinkRepository.findById(click.getShareId()).ifPresent(link -> {
                link.setConversionsCount((link.getConversionsCount() != null ? link.getConversionsCount() : 0) + 1);
                link.setTotalEarnings((link.getTotalEarnings() != null ? link.getTotalEarnings() : 0.0) + userPayout);
                sharedLinkRepository.save(link);
            });
        }

        log.info("[AFFILIATE] ✅ Commission fully processed — trackingId={}, Payout=₹{}", trackingId, userPayout);
    }

    @Override
    public void rejectCommission(String trackingId) {
        Optional<AffiliateClick> clickOpt = affiliateClickRepository.findByTrackingId(trackingId);
        if (clickOpt.isEmpty()) return;

        AffiliateClick click = clickOpt.get();
        if (!"PURCHASED".equals(click.getStatus())) return;

        click.setStatus("REJECTED");
        affiliateClickRepository.save(click);
        log.info("[AFFILIATE] Click {} status → REJECTED", trackingId);

        String referrerId = click.getReferrerId();
        if (referrerId == null && click.getShareId() != null) {
            referrerId = shareActionRepository.findByShareId(click.getShareId())
                    .map(ShareAction::getReferrerId).orElse(null);
        }

        if (referrerId != null) {
            String referrerName = userRepository.findById(referrerId).map(User::getName).orElse("Unknown");

            CommissionHistory history = CommissionHistory.builder()
                    .trackingId(trackingId)
                    .referrerId(referrerId)
                    .amount(0.0)
                    .status("REJECTED")
                    .build();
            commissionHistoryRepository.save(history);

            // Create SharedCommission record for admin visibility
            SharedCommission sc = SharedCommission.builder()
                    .userId(referrerId)
                    .userName(referrerName)
                    .linkId(click.getShareId())
                    .shareId(click.getShareId())
                    .clickId(click.getTrackingId())
                    .orderId(click.getOrderId())
                    .productName("Product")
                    .store("Merchant")
                    .purchaseAmount(0.0)
                    .commissionAmount(0.0)
                    .userCommissionAmount(0.0)
                    .adminCommissionAmount(0.0)
                    .status("rejected")
                    .date(LocalDate.now())
                    .build();
            sharedCommissionRepository.save(sc);
        }

        log.info("[AFFILIATE] Commission rejected for trackingId: {}", trackingId);
    }
}
