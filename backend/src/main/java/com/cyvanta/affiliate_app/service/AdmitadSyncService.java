package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.SharedCommission;
import com.cyvanta.affiliate_app.model.SharedLink;
import com.cyvanta.affiliate_app.repository.SharedCommissionRepository;
import com.cyvanta.affiliate_app.repository.SharedLinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdmitadSyncService {

    private final AdmitadAuthService authService;
    private final SharedLinkRepository sharedLinkRepository;
    private final SharedCommissionRepository sharedCommissionRepository;
    private final WalletService walletService;

    private final RestTemplate restTemplate = new RestTemplate();

    // Runs every hour at minute 0
    @Scheduled(cron = "0 0 * * * ?")
    public void syncConversions() {
        log.info("Starting scheduled Admitad conversion sync...");
        
        String token = authService.getAccessToken();
        if (token == null) {
            log.error("Cannot sync conversions: No valid Admitad token.");
            return;
        }

        // Fetch for the last 7 days to catch any status updates
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        String url = String.format("https://api.admitad.com/statistics/actions/?date_start=%s&date_end=%s",
                startDate.format(formatter), endDate.format(formatter));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
                if (results != null) {
                    processConversions(results);
                }
                log.info("Admitad sync completed. Processed {} actions.", results != null ? results.size() : 0);
            } else {
                log.warn("Admitad API returned non-success status: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error during Admitad conversion sync: {}", e.getMessage(), e);
        }
    }

    private void processConversions(List<Map<String, Object>> actions) {
        for (Map<String, Object> action : actions) {
            try {
                String actionId = String.valueOf(action.get("id")); // Admitad's unique action ID
                String subid1 = (String) action.get("subid1");
                String status = (String) action.get("status"); // Usually: 1 (pending), 2 (approved), 3 (declined)
                Double payment = extractDouble(action.get("payment")); // Total commission network pays
                Double cartAmount = extractDouble(action.get("cart"));

                // Map status to our internal string
                String internalStatus = "pending";
                if ("2".equals(status) || "approved".equalsIgnoreCase(status)) internalStatus = "approved";
                else if ("3".equals(status) || "declined".equalsIgnoreCase(status)) internalStatus = "rejected";

                // Check if we already have this commission logged
                Optional<SharedCommission> existingComm = sharedCommissionRepository.findByOrderId(actionId);

                SharedCommission commission;
                if (existingComm.isPresent()) {
                    commission = existingComm.get();
                    // If status changed to approved/rejected, handle it
                    if ("pending".equals(commission.getStatus()) && !internalStatus.equals("pending")) {
                        commission.setStatus(internalStatus);
                        sharedCommissionRepository.save(commission);
                        
                        // Update wallet if it belongs to a user
                        if (commission.getUserId() != null) {
                            if ("approved".equals(internalStatus)) {
                                walletService.processApprovedCommission(commission.getUserId(), commission.getUserCommissionAmount());
                            } else if ("rejected".equals(internalStatus)) {
                                walletService.processRejectedCommission(commission.getUserId(), commission.getUserCommissionAmount());
                            }
                        }
                    }
                    continue; // Skip further processing if it already exists
                }

                // It's a new conversion
                commission = new SharedCommission();
                commission.setOrderId(actionId);
                commission.setPurchaseAmount(cartAmount);
                commission.setCommissionAmount(payment);
                commission.setStatus(internalStatus);
                commission.setDate(LocalDate.now());
                commission.setProductName("Admitad Offer"); // Fallback
                commission.setStore("Admitad Network"); // Fallback

                // Determine Direct vs Referral based on SubID
                if (subid1 != null && !subid1.isEmpty()) {
                    // Try to find the shared link
                    Optional<SharedLink> sharedLinkOpt = sharedLinkRepository.findById(subid1);
                    
                    if (sharedLinkOpt.isPresent()) {
                        SharedLink link = sharedLinkOpt.get();
                        commission.setLinkId(link.getId());
                        commission.setShareId(link.getId());
                        commission.setUserId(link.getUserId());
                        commission.setUserName(link.getUserName());
                        commission.setProductName(link.getProductName());
                        commission.setStore(link.getStore());
                        
                        // Split logic for Referral
                        Double userPct = link.getUserSharePercent() != null ? link.getUserSharePercent() : 100.0;
                        commission.setUserSharePercent(userPct);
                        commission.setUserCommissionAmount((payment * userPct) / 100.0);
                        commission.setAdminCommissionAmount(payment - commission.getUserCommissionAmount());
                    } else {
                        // SubID exists but doesn't match our DB (Maybe an old link or external manipulation)
                        // Treat as direct/admin 100%
                        commission.setUserSharePercent(0.0);
                        commission.setUserCommissionAmount(0.0);
                        commission.setAdminCommissionAmount(payment);
                        commission.setUserName("Unknown SubID: " + subid1);
                    }
                } else {
                    // Direct Purchase - 100% Admin
                    commission.setUserSharePercent(0.0);
                    commission.setUserCommissionAmount(0.0);
                    commission.setAdminCommissionAmount(payment);
                    commission.setUserName("Direct Purchase");
                }

                sharedCommissionRepository.save(commission);

                // If it came in instantly as approved/pending, handle wallet
                if (commission.getUserId() != null) {
                    if ("approved".equals(internalStatus)) {
                        walletService.processApprovedCommission(commission.getUserId(), commission.getUserCommissionAmount());
                    } else if ("pending".equals(internalStatus)) {
                        walletService.processPendingCommission(commission.getUserId(), commission.getUserCommissionAmount());
                    }
                }
                
            } catch (Exception e) {
                log.error("Failed to process individual Admitad action: {}", e.getMessage());
            }
        }
    }

    private Double extractDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
