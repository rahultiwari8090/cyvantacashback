package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "settings")
public class Settings {
    @Id
    private String id;
    private Double cashbackPercent;
    private Integer holdDays;
    private Double minimumWithdrawal;
    private Double sharedCommissionPercent;
    private Integer sharedCommissionHoldDays;
}
