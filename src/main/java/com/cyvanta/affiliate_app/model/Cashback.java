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
@Document(collection = "cashbacks")
public class Cashback {
    @Id
    private String id;
    private String userName;
    private String productName;
    private Double amount;
    private String status; // pending, approved, rejected
    private LocalDate date;
}
