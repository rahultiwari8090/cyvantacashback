package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tracked_orders")
public class TrackedOrder {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String productId;
    private String productName;
    private String platform;
    private Double price;
    private Double cashbackAmount;
    private String status; // pending, completed, return_active, shipped, returned
    
    // New detailed tracking fields
    private String clickId;
    private String productImage;
    private String affiliateUrl;
    private String category;
    private Double cashbackPercent;
    private String paymentMethod;
    private String deviceName;
    private String ipAddress;
    
    private LocalDate orderDate;
    private LocalDate confirmedDate;
    private LocalDate shippedDate;
    private LocalDate deliveredDate;
    private LocalDate returnExpiryDate;
    
    private Integer returnWindowDays;
    private String cashbackId;
}
