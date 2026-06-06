package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Settings;
import com.cyvanta.affiliate_app.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsRepository settingsRepository;

    @GetMapping
    public ResponseEntity<Settings> getSettings() {
        return settingsRepository.findAll().stream().findFirst()
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // Default settings if not exists
                    Settings defaultSettings = Settings.builder()
                            .cashbackPercent(8.0)
                            .holdDays(30)
                            .minimumWithdrawal(10.0)
                            .sharedCommissionPercent(5.0)
                            .sharedCommissionHoldDays(30)
                            .build();
                    return ResponseEntity.ok(settingsRepository.save(defaultSettings));
                });
    }

    @PutMapping
    public ResponseEntity<Settings> updateSettings(@RequestBody Settings settings) {
        return settingsRepository.findAll().stream().findFirst().map(existing -> {
            settings.setId(existing.getId());
            return ResponseEntity.ok(settingsRepository.save(settings));
        }).orElseGet(() -> ResponseEntity.ok(settingsRepository.save(settings)));
    }
}
