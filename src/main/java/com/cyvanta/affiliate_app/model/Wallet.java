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
@Document(collection = "wallets")
public class Wallet {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Builder.Default
    private Double pendingBalance = 0.0;

    @Builder.Default
    private Double approvedBalance = 0.0;

    @Builder.Default
    private Double withdrawnAmount = 0.0;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
