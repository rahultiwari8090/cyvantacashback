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
@Document(collection = "wallet_transactions")
public class WalletTransaction {
    @Id
    private String id;

    private String userId;

    private String trackingId;

    private Double amount;

    private String type; // CREDIT, DEBIT

    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
