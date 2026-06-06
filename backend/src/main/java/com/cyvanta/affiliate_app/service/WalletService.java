package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.Transaction;
import com.cyvanta.affiliate_app.model.Wallet;
import com.cyvanta.affiliate_app.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

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
}
