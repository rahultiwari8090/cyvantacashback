package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.WithdrawalRequest;
import com.cyvanta.affiliate_app.repository.WithdrawalRequestRepository;
import com.cyvanta.affiliate_app.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
public class WithdrawalsController {

    private final WithdrawalRequestRepository withdrawalRepository;
    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<List<WithdrawalRequest>> getAll() {
        return ResponseEntity.ok(withdrawalRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<WithdrawalRequest> create(@RequestBody WithdrawalRequest request) {
        request.setStatus("pending");
        request.setRequestedAt(LocalDateTime.now());
        return ResponseEntity.ok(withdrawalRepository.save(request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<WithdrawalRequest> approve(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return withdrawalRepository.findById(id).map(request -> {
            request.setStatus("approved");
            request.setProcessedAt(LocalDateTime.now());
            withdrawalRepository.save(request);

            if (request.getUserId() != null && request.getAmount() != null) {
                walletService.deductApprovedBalance(request.getUserId(), request.getAmount());
                walletService.addWithdrawnAmount(request.getUserId(), request.getAmount());
                walletService.recordTransaction(
                        request.getUserId(),
                        request.getAmount(),
                        "DEBIT",
                        "WITHDRAWAL",
                        "Withdrawal payout approved for user " + request.getUserName(),
                        request.getId(),
                        "APPROVED"
                );
            }

            return ResponseEntity.ok(request);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<WithdrawalRequest> reject(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return withdrawalRepository.findById(id).map(request -> {
            request.setStatus("rejected");
            request.setProcessedAt(LocalDateTime.now());
            return ResponseEntity.ok(withdrawalRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }
}
