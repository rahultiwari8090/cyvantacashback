package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.SharedLink;
import com.cyvanta.affiliate_app.repository.SharedLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/shared-links")
@RequiredArgsConstructor
public class SharedLinkController {

    private final SharedLinkRepository sharedLinkRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping
    public ResponseEntity<List<SharedLink>> getAll() {
        return ResponseEntity.ok(sharedLinkRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SharedLink>> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(sharedLinkRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<SharedLink> create(@RequestBody SharedLink link) {
        link.setDate(LocalDate.now());
        if (link.getClicksCount() == null) link.setClicksCount(0);
        if (link.getConversionsCount() == null) link.setConversionsCount(0);
        if (link.getTotalEarnings() == null) link.setTotalEarnings(0.0);
        link.setStatus("active");
        SharedLink saved = sharedLinkRepository.save(link);
        saved.setShortUrl(frontendUrl + "/#/share/" + saved.getId());
        return ResponseEntity.ok(sharedLinkRepository.save(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        sharedLinkRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/click")
    public ResponseEntity<SharedLink> incrementClick(@PathVariable String id) {
        return sharedLinkRepository.findById(id).map(link -> {
            link.setClicksCount((link.getClicksCount() != null ? link.getClicksCount() : 0) + 1);
            return ResponseEntity.ok(sharedLinkRepository.save(link));
        }).orElse(ResponseEntity.notFound().build());
    }
}
