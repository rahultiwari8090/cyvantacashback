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
@Document(collection = "conversions")
public class Conversion {
    @Id
    private String id;
    private String subId;
    private String clickId;
    private Double commission;
    private String status; // approved, pending, rejected
    private String userName;
    private String network;
    private LocalDate date;
}
