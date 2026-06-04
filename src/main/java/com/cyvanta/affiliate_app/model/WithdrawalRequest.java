package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "withdrawal_requests")
public class WithdrawalRequest {

    @Id
    private String id;

    private String userId;

    private Double amount;

    private String upiId;

    private WithdrawalStatus status;

    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();

    private LocalDateTime processedAt;

    public enum WithdrawalStatus {
        PENDING, PROCESSED, REJECTED
    }
}
