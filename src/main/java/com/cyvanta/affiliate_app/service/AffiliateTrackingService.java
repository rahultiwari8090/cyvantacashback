package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.Transaction;
import com.cyvanta.affiliate_app.model.User;
import com.cyvanta.affiliate_app.repository.TransactionRepository;
import com.cyvanta.affiliate_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AffiliateTrackingService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    // Typically this would be called by a webhook from EarnKaro, Cuelinks, etc.
    public void processWebhook(String orderId, String referralCode, Double totalCommission, String statusString) {
        
        Transaction.TransactionStatus status;
        try {
            status = Transaction.TransactionStatus.valueOf(statusString.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid status received in webhook: {}", statusString);
            return;
        }

        Optional<Transaction> existingTx = transactionRepository.findByOrderId(orderId);
        
        if (existingTx.isPresent()) {
            Transaction tx = existingTx.get();
            // If status changed to APPROVED
            if (tx.getStatus() == Transaction.TransactionStatus.PENDING && status == Transaction.TransactionStatus.APPROVED) {
                tx.setStatus(status);
                tx.setUpdatedAt(java.time.LocalDateTime.now());
                transactionRepository.save(tx);
                if (tx.getReferrerId() != null) {
                    walletService.processApprovedCommission(tx.getReferrerId(), tx.getUserShare());
                }
            }
            // If status changed to REJECTED
            else if (tx.getStatus() == Transaction.TransactionStatus.PENDING && status == Transaction.TransactionStatus.REJECTED) {
                tx.setStatus(status);
                tx.setUpdatedAt(java.time.LocalDateTime.now());
                transactionRepository.save(tx);
                if (tx.getReferrerId() != null) {
                    walletService.processRejectedCommission(tx.getReferrerId(), tx.getUserShare());
                }
            }
        } else {
            // New transaction (Pending)
            User referrer = userRepository.findByReferralCode(referralCode).orElse(null);
            String referrerId = referrer != null ? referrer.getId() : null;
            
            Double userShare = 0.0;
            Double adminShare = totalCommission;
            
            if (referrer != null) {
                // e.g., 30% User, 70% Admin
                userShare = totalCommission * 0.30;
                adminShare = totalCommission * 0.70;
            }

            Transaction tx = Transaction.builder()
                    .orderId(orderId)
                    .referrerId(referrerId)
                    .totalCommission(totalCommission)
                    .adminShare(adminShare)
                    .userShare(userShare)
                    .status(status)
                    .build();

            transactionRepository.save(tx);

            if (referrerId != null && status == Transaction.TransactionStatus.PENDING) {
                walletService.processPendingCommission(referrerId, userShare);
            } else if (referrerId != null && status == Transaction.TransactionStatus.APPROVED) {
                walletService.processApprovedCommission(referrerId, userShare);
            }
        }
    }
}
