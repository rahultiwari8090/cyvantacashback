package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Cashback;
import com.cyvanta.affiliate_app.repository.CashbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cashback")
@RequiredArgsConstructor
public class CashbackController {

    private final CashbackRepository cashbackRepository;

    @GetMapping
    public ResponseEntity<List<Cashback>> getAll() {
        return ResponseEntity.ok(cashbackRepository.findAll());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Cashback> approve(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return cashbackRepository.findById(id).map(cashback -> {
            cashback.setStatus("approved");
            return ResponseEntity.ok(cashbackRepository.save(cashback));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Cashback> reject(@PathVariable String id) {
        return cashbackRepository.findById(id).map(cashback -> {
            cashback.setStatus("rejected");
            return ResponseEntity.ok(cashbackRepository.save(cashback));
        }).orElse(ResponseEntity.notFound().build());
    }
}
