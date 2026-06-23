package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Settings;
import com.cyvanta.affiliate_app.repository.SettingsRepository;
import com.cyvanta.affiliate_app.model.AdminActivityLog;
import com.cyvanta.affiliate_app.repository.AdminActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsRepository settingsRepository;
    private final AdminActivityLogRepository adminActivityLogRepository;

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
                            .seoTitle("Cyvanta Cashback Deals & Affiliate Offers")
                            .seoDescription("Save with cashback deals, affiliate coupons, and partner offers on Amazon, Flipkart, Myntra and more.")
                            .seoKeywords("cashback, affiliate, deals, coupons, Amazon, Flipkart, Myntra, save money")
                            .seoImageUrl("https://cyvanta.com/default-og-image.png")
                            .build();
                    return ResponseEntity.ok(settingsRepository.save(defaultSettings));
                });
    }

    @PutMapping
    public ResponseEntity<Settings> updateSettings(@RequestBody Settings settings) {
        AdminActivityLog log = AdminActivityLog.builder()
                .adminId(null)
                .adminEmail("system")
                .adminRole("SYSTEM")
                .action("UPDATE_SETTINGS")
                .target("settings")
                .details("Platform settings updated via API")
                .build();
        adminActivityLogRepository.save(log);

        return settingsRepository.findAll().stream().findFirst().map(existing -> {
            settings.setId(existing.getId());
            return ResponseEntity.ok(settingsRepository.save(settings));
        }).orElseGet(() -> ResponseEntity.ok(settingsRepository.save(settings)));
    }
}
