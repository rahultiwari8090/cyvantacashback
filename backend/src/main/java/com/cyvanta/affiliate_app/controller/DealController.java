package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Deal;
import com.cyvanta.affiliate_app.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealRepository dealRepository;

    @GetMapping
    public ResponseEntity<List<Deal>> getAllDeals() {
        return ResponseEntity.ok(dealRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Deal> createDeal(@RequestBody Deal deal) {
        return ResponseEntity.ok(dealRepository.save(deal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deal> updateDeal(@PathVariable String id, @RequestBody Deal dealDetails) {
        return dealRepository.findById(id).map(deal -> {
            deal.setName(dealDetails.getName());
            deal.setImage(dealDetails.getImage());
            deal.setOfferText(dealDetails.getOfferText());
            deal.setLink(dealDetails.getLink());
            deal.setCashback(dealDetails.getCashback());
            deal.setStatus(dealDetails.getStatus());
            deal.setComparisons(dealDetails.getComparisons());
            return ResponseEntity.ok(dealRepository.save(deal));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeal(@PathVariable String id) {
        if (dealRepository.existsById(id)) {
            dealRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
