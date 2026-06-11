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
@Document(collection = "commission_history")
public class CommissionHistory {
    @Id
    private String id;

    private String trackingId;

    private String referrerId;

    private Double amount;

    private String status; // APPROVED, REJECTED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
