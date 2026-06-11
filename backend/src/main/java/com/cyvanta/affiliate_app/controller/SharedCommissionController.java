package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.SharedCommission;
import com.cyvanta.affiliate_app.repository.SharedCommissionRepository;
import com.cyvanta.affiliate_app.service.AdmitadSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shared-commissions")
@RequiredArgsConstructor
public class SharedCommissionController {

    private final SharedCommissionRepository sharedCommissionRepository;
    private final AdmitadSyncService admitadSyncService;

    @PostMapping("/sync")
    public ResponseEntity<String> triggerManualSync() {
        admitadSyncService.syncConversions();
        return ResponseEntity.ok("Admitad synchronization triggered successfully.");
    }

    @GetMapping
    public ResponseEntity<List<SharedCommission>> getAll() {
        return ResponseEntity.ok(sharedCommissionRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SharedCommission>> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(sharedCommissionRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<SharedCommission> create(@RequestBody SharedCommission commission) {
        commission.setDate(LocalDate.now());
        commission.setStatus("pending");
        
        Double userPct = commission.getUserSharePercent() != null ? commission.getUserSharePercent() : 100.0;
        
        if (commission.getCommissionAmount() != null) {
            commission.setUserCommissionAmount((commission.getCommissionAmount() * userPct) / 100.0);
        }
        
        return ResponseEntity.ok(sharedCommissionRepository.save(commission));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SharedCommission> updateStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return sharedCommissionRepository.findById(id).map(commission -> {
            if (body.containsKey("status")) {
                commission.setStatus((String) body.get("status"));
            }
            if (body.containsKey("amount")) {
                Object amt = body.get("amount");
                Double amount = null;
                if (amt instanceof Number) amount = ((Number) amt).doubleValue();
                else if (amt instanceof String) amount = Double.parseDouble((String) amt);
                
                if (amount != null) {
                    commission.setCommissionAmount(amount);
                }
            }
            if (body.containsKey("userAmount")) {
                Object uAmt = body.get("userAmount");
                Double userAmount = null;
                if (uAmt instanceof Number) userAmount = ((Number) uAmt).doubleValue();
                else if (uAmt instanceof String) userAmount = Double.parseDouble((String) uAmt);
                
                if (userAmount != null) {
                    commission.setUserCommissionAmount(userAmount);
                }
            }
            
            // Calculate admin profit
            if (commission.getCommissionAmount() != null && commission.getUserCommissionAmount() != null) {
                commission.setAdminCommissionAmount(
                    commission.getCommissionAmount() - commission.getUserCommissionAmount()
                );
            }
            return ResponseEntity.ok(sharedCommissionRepository.save(commission));
        }).orElse(ResponseEntity.notFound().build());
    }
}
