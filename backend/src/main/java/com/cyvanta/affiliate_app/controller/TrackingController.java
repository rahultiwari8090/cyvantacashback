package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.TrackedOrder;
import com.cyvanta.affiliate_app.repository.TrackedOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackedOrderRepository trackingRepository;

    @GetMapping
    public ResponseEntity<List<TrackedOrder>> getAll() {
        return ResponseEntity.ok(trackingRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<TrackedOrder> create(@RequestBody TrackedOrder order) {
        return ResponseEntity.ok(trackingRepository.save(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TrackedOrder> updateStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return trackingRepository.findById(id).map(order -> {
            if (body.containsKey("status")) {
                order.setStatus((String) body.get("status"));
            }
            return ResponseEntity.ok(trackingRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
