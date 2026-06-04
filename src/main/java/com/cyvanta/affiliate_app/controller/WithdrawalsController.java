package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.WithdrawalRequest;
import com.cyvanta.affiliate_app.repository.WithdrawalRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
public class WithdrawalsController {

    private final WithdrawalRequestRepository withdrawalRepository;

    @GetMapping
    public ResponseEntity<List<WithdrawalRequest>> getAll() {
        return ResponseEntity.ok(withdrawalRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<WithdrawalRequest> create(@RequestBody WithdrawalRequest request) {
        request.setStatus(WithdrawalRequest.WithdrawalStatus.PENDING);
        return ResponseEntity.ok(withdrawalRepository.save(request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<WithdrawalRequest> approve(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return withdrawalRepository.findById(id).map(request -> {
            request.setStatus(WithdrawalRequest.WithdrawalStatus.PROCESSED);
            return ResponseEntity.ok(withdrawalRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<WithdrawalRequest> reject(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return withdrawalRepository.findById(id).map(request -> {
            request.setStatus(WithdrawalRequest.WithdrawalStatus.REJECTED);
            return ResponseEntity.ok(withdrawalRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }
}
