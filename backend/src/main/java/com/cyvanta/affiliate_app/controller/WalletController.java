package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Transaction;
import com.cyvanta.affiliate_app.model.Wallet;
import com.cyvanta.affiliate_app.repository.TransactionRepository;
import com.cyvanta.affiliate_app.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final TransactionRepository transactionRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<Wallet> getWalletBalance(@PathVariable String userId) {
        return ResponseEntity.ok(walletService.getOrCreateWallet(userId));
    }

    @GetMapping("/{userId}/transactions")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable String userId) {
        return ResponseEntity.ok(transactionRepository.findByReferrerId(userId));
    }
}
