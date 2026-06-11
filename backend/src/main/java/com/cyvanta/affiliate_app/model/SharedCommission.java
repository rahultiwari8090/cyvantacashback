package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "shared_commissions")
public class SharedCommission {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String linkId;
    private String productName;
    private String store;
    private Double purchaseAmount;
    private Double commissionRate;
    private Double commissionAmount;
    private Double userSharePercent;
    private Double userCommissionAmount;
    private Double adminCommissionPercent;
    private Double adminCommissionAmount;
    private String shareId;
    private String clickId;
    private String orderId;
    private String status; // pending, approved, rejected
    private LocalDate date;
}
