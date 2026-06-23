package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.AdminActivityLog;
import com.cyvanta.affiliate_app.model.AdminLoginHistory;
import com.cyvanta.affiliate_app.repository.AdminActivityLogRepository;
import com.cyvanta.affiliate_app.repository.AdminLoginHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminActivityLogRepository adminActivityLogRepository;
    private final AdminLoginHistoryRepository adminLoginHistoryRepository;

    @GetMapping("/activity-logs")
    public ResponseEntity<List<AdminActivityLog>> getActivityLogs() {
        return ResponseEntity.ok(adminActivityLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/login-history")
    public ResponseEntity<List<AdminLoginHistory>> getLoginHistory() {
        return ResponseEntity.ok(adminLoginHistoryRepository.findAllByOrderByTimestampDesc());
    }
}
