package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.SharedCommission;
import com.cyvanta.affiliate_app.repository.SharedCommissionRepository;
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
        Double buyerPct = commission.getBuyerSharePercent() != null ? commission.getBuyerSharePercent() : 0.0;
        
        if (commission.getCommissionAmount() != null) {
            commission.setUserCommissionAmount((commission.getCommissionAmount() * userPct) / 100.0);
            commission.setBuyerCommissionAmount((commission.getCommissionAmount() * buyerPct) / 100.0);
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
                    Double userPct = commission.getUserSharePercent() != null ? commission.getUserSharePercent() : 100.0;
                    Double buyerPct = commission.getBuyerSharePercent() != null ? commission.getBuyerSharePercent() : 0.0;
                    commission.setUserCommissionAmount((amount * userPct) / 100.0);
                    commission.setBuyerCommissionAmount((amount * buyerPct) / 100.0);
                }
            }
            return ResponseEntity.ok(sharedCommissionRepository.save(commission));
        }).orElse(ResponseEntity.notFound().build());
    }
}
