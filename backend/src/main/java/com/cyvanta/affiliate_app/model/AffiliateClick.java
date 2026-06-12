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
@Document(collection = "affiliate_clicks")
public class AffiliateClick {
    @Id
    private String id;

    @Indexed(unique = true)
    private String trackingId;

    private String orderId;

    private String buyerId;

    private String shareId;

    private String productId;

    private String referrerId;

    private String merchant;

    private String status; // CLICKED, PENDING, PURCHASED, APPROVED, REJECTED

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
