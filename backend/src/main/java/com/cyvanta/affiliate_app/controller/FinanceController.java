package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Cashback;
import com.cyvanta.affiliate_app.model.Transaction;
import com.cyvanta.affiliate_app.model.WithdrawalRequest;
import com.cyvanta.affiliate_app.repository.CashbackRepository;
import com.cyvanta.affiliate_app.repository.TransactionRepository;
import com.cyvanta.affiliate_app.repository.WithdrawalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final CashbackRepository cashbackRepository;
    private final WithdrawalRequestRepository withdrawalRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFinanceData() {
        // Compute real totals from database
        List<Cashback> allCashback = cashbackRepository.findAll();
        List<WithdrawalRequest> allWithdrawals = withdrawalRepository.findAll();
        List<Transaction> allTransactions = transactionRepository.findAll();

        // Total revenue = sum of all transaction total commissions
        double totalRevenue = allTransactions.stream()
                .mapToDouble(t -> t.getTotalCommission() != null ? t.getTotalCommission() : 0.0)
                .sum();

        // Total cashback paid = sum of approved cashback amounts
        double totalCashbackPaid = allCashback.stream()
                .filter(c -> "approved".equalsIgnoreCase(c.getStatus()))
                .mapToDouble(c -> c.getAmount() != null ? c.getAmount() : 0.0)
                .sum();

        // Total withdraw paid = sum of approved/processed withdrawal amounts
        double totalWithdrawPaid = allWithdrawals.stream()
                .filter(w -> "approved".equalsIgnoreCase(w.getStatus()) || "processed".equalsIgnoreCase(w.getStatus()))
                .mapToDouble(w -> w.getAmount() != null ? w.getAmount() : 0.0)
                .sum();

        // Pending withdrawals = sum of pending withdrawal amounts
        double pendingWithdrawals = allWithdrawals.stream()
                .filter(w -> "pending".equalsIgnoreCase(w.getStatus()))
                .mapToDouble(w -> w.getAmount() != null ? w.getAmount() : 0.0)
                .sum();

        // Build transactions list in frontend-expected format
        List<Map<String, Object>> transactionsList = allTransactions.stream()
                .sorted(Comparator.comparing(Transaction::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(50) // Last 50 transactions
                .map(tx -> {
                    Map<String, Object> txMap = new HashMap<>();
                    txMap.put("id", tx.getId());
                    String desc = String.format("Affiliate Commission (%s - %s)",
                            tx.getSourcePlatform() != null ? tx.getSourcePlatform() : "Unknown",
                            tx.getOrderId() != null ? tx.getOrderId() : tx.getId());
                    txMap.put("desc", desc);
                    txMap.put("type", "credit");
                    txMap.put("amount", tx.getTotalCommission() != null ? tx.getTotalCommission() : 0.0);
                    txMap.put("date", tx.getCreatedAt() != null
                            ? tx.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
                            : null);
                    return txMap;
                })
                .collect(Collectors.toList());

        // Also add withdrawal payouts as debit transactions
        allWithdrawals.stream()
                .filter(w -> "approved".equalsIgnoreCase(w.getStatus()) || "processed".equalsIgnoreCase(w.getStatus()))
                .forEach(w -> {
                    Map<String, Object> txMap = new HashMap<>();
                    txMap.put("id", "w-" + w.getId());
                    txMap.put("desc", String.format("Withdrawal Payout (%s)", w.getUserName() != null ? w.getUserName() : w.getUserId()));
                    txMap.put("type", "debit");
                    txMap.put("amount", w.getAmount() != null ? w.getAmount() : 0.0);
                    txMap.put("date", w.getRequestedAt() != null
                            ? w.getRequestedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
                            : null);
                    transactionsList.add(txMap);
                });

        // Sort final list by date descending
        transactionsList.sort((a, b) -> {
            String dateA = (String) a.get("date");
            String dateB = (String) b.get("date");
            if (dateA == null && dateB == null) return 0;
            if (dateA == null) return 1;
            if (dateB == null) return -1;
            return dateB.compareTo(dateA);
        });

        Map<String, Object> financeData = new HashMap<>();
        financeData.put("totalRevenue", totalRevenue);
        financeData.put("totalCashbackPaid", totalCashbackPaid);
        financeData.put("totalWithdrawPaid", totalWithdrawPaid);
        financeData.put("pendingWithdrawals", pendingWithdrawals);
        financeData.put("transactions", transactionsList);

        return ResponseEntity.ok(financeData);
    }
}
