package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.*;
import com.cyvanta.affiliate_app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
    private final WalletService walletService;
    private final MockAmazonService mockAmazonService;

    @Override
    public void processClick(AffiliateClick click) {
        // Mocking an initial tracking registration with the "network"
        // Then auto-triggering the 5 second purchase simulation
        mockAmazonService.simulatePurchaseAsync(click.getTrackingId());
    }

    @Override
    public void approveCommission(String trackingId) {
        Optional<AffiliateClick> clickOpt = affiliateClickRepository.findByTrackingId(trackingId);
        if (clickOpt.isEmpty()) return;

        AffiliateClick click = clickOpt.get();
        if (!"PURCHASED".equals(click.getStatus())) return;

        click.setStatus("APPROVED");
        affiliateClickRepository.save(click);

        if (click.getShareId() == null) return;

        Optional<ShareAction> shareOpt = shareActionRepository.findByShareId(click.getShareId());
        if (shareOpt.isEmpty()) return;
        ShareAction share = shareOpt.get();

        String referrerId = share.getReferrerId();
        if (referrerId == null) return;

        Optional<Product> productOpt = productRepository.findById(click.getProductId());
        Double productCommission = productOpt.map(Product::getDummyCommission).orElse(100.0);
        
        // Let's assume user gets 30% of the dummy commission
        Double userPayout = productCommission * 0.30;

        // 1. Record Commission History
        CommissionHistory history = CommissionHistory.builder()
                .trackingId(trackingId)
                .referrerId(referrerId)
                .amount(userPayout)
                .status("APPROVED")
                .build();
        commissionHistoryRepository.save(history);

        // 2. Update actual wallet
        walletService.processApprovedCommission(referrerId, userPayout);

        // 3. Record WalletTransaction audit log
        WalletTransaction wt = WalletTransaction.builder()
                .userId(referrerId)
                .trackingId(trackingId)
                .amount(userPayout)
                .type("CREDIT")
                .description("Affiliate Commission Approved for Order: " + click.getOrderId())
                .build();
        walletTransactionRepository.save(wt);

        log.info("Commission approved for trackingId: {}, Payout: {}", trackingId, userPayout);
    }

    @Override
    public void rejectCommission(String trackingId) {
        Optional<AffiliateClick> clickOpt = affiliateClickRepository.findByTrackingId(trackingId);
        if (clickOpt.isEmpty()) return;

        AffiliateClick click = clickOpt.get();
        if (!"PURCHASED".equals(click.getStatus())) return;

        click.setStatus("REJECTED");
        affiliateClickRepository.save(click);

        if (click.getShareId() != null) {
            shareActionRepository.findByShareId(click.getShareId()).ifPresent(share -> {
                CommissionHistory history = CommissionHistory.builder()
                        .trackingId(trackingId)
                        .referrerId(share.getReferrerId())
                        .amount(0.0)
                        .status("REJECTED")
                        .build();
                commissionHistoryRepository.save(history);
            });
        }

        log.info("Commission rejected for trackingId: {}", trackingId);
    }
}
