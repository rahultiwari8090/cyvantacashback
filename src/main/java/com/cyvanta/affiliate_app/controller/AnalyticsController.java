package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.ClickLog;
import com.cyvanta.affiliate_app.model.Conversion;
import com.cyvanta.affiliate_app.repository.ClickLogRepository;
import com.cyvanta.affiliate_app.repository.ConversionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ClickLogRepository clickLogRepository;
    private final ConversionRepository conversionRepository;

    @GetMapping("/clicks")
    public ResponseEntity<List<ClickLog>> getClickLogs() {
        return ResponseEntity.ok(clickLogRepository.findAll());
    }

    @GetMapping("/conversions")
    public ResponseEntity<List<Conversion>> getConversions() {
        return ResponseEntity.ok(conversionRepository.findAll());
    }

    @PutMapping("/conversions/{id}/adjust")
    public ResponseEntity<Conversion> adjustConversion(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return conversionRepository.findById(id).map(conversion -> {
            if (body.containsKey("amount")) {
                Object amt = body.get("amount");
                if (amt instanceof Number) {
                    conversion.setCommission(((Number) amt).doubleValue());
                } else if (amt instanceof String) {
                    conversion.setCommission(Double.parseDouble((String) amt));
                }
            }
            if (body.containsKey("type")) {
                String type = (String) body.get("type");
                conversion.setStatus("credit".equals(type) ? "approved" : "rejected");
            }
            return ResponseEntity.ok(conversionRepository.save(conversion));
        }).orElse(ResponseEntity.notFound().build());
    }
}
