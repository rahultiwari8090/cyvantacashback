package com.cyvanta.affiliate_app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFinanceData() {
        // Mock data structure expected by frontend
        Map<String, Object> mockFinance = Map.of(
            "totalRevenue", 0.00,
            "totalCashbackPaid", 0.00,
            "totalWithdrawPaid", 0.00,
            "pendingWithdrawals", 0.00,
            "transactions", Collections.emptyList()
        );
        return ResponseEntity.ok(mockFinance);
    }
}
