package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.Transaction;
import com.cyvanta.affiliate_app.model.Wallet;
import com.cyvanta.affiliate_app.model.WalletTransaction;
import com.cyvanta.affiliate_app.repository.WalletRepository;
import com.cyvanta.affiliate_app.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public Wallet getOrCreateWallet(String userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .userId(userId)
                            .build();
                    return walletRepository.save(newWallet);
                });
    }

    public void processPendingCommission(String userId, Double amount) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setPendingBalance(wallet.getPendingBalance() + amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    public void processApprovedCommission(String userId, Double amount) {
        Wallet wallet = getOrCreateWallet(userId);
        if (wallet.getPendingBalance() >= amount) {
            wallet.setPendingBalance(wallet.getPendingBalance() - amount);
        } else {
            // Fallback if pending wasn't recorded correctly, still adjust pending if > 0
            wallet.setPendingBalance(Math.max(0, wallet.getPendingBalance() - amount));
        }
        wallet.setApprovedBalance(wallet.getApprovedBalance() + amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    public void processRejectedCommission(String userId, Double amount) {
        Wallet wallet = getOrCreateWallet(userId);
        if (wallet.getPendingBalance() >= amount) {
            wallet.setPendingBalance(wallet.getPendingBalance() - amount);
        } else {
            wallet.setPendingBalance(Math.max(0, wallet.getPendingBalance() - amount));
        }
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    public void deductApprovedBalance(String userId, Double amount) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setApprovedBalance(Math.max(0, wallet.getApprovedBalance() - amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    public void refundApprovedBalance(String userId, Double amount) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setApprovedBalance(wallet.getApprovedBalance() + amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    public void addWithdrawnAmount(String userId, Double amount) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setWithdrawnAmount(wallet.getWithdrawnAmount() + amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    public WalletTransaction recordTransaction(String userId, Double amount, String type, String category, String description, String trackingId, String status) {
        WalletTransaction transaction = WalletTransaction.builder()
                .userId(userId)
                .trackingId(trackingId)
                .amount(amount)
                .type(type)
                .category(category)
                .status(status)
                .description(description)
                .build();
        return walletTransactionRepository.save(transaction);
    }

    public List<WalletTransaction> getLedgerForUser(String userId) {
        return walletTransactionRepository.findByUserId(userId);
    }
}
