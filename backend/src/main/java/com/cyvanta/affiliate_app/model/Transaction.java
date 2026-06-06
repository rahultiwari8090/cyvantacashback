package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderId; // external order ID from affiliate network

    private String productId;

    private String buyerId; // optional if bought directly and tracked via user account, else null

    private String referrerId; // userId of the referrer (from subId)

    private Double totalCommission;

    private Double adminShare;

    private Double userShare;

    private TransactionStatus status;

    private String sourcePlatform;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum TransactionStatus {
        PENDING, APPROVED, REJECTED
    }
}
