package com.cyvanta.affiliate_app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "withdrawal_requests")
public class WithdrawalRequest {

    @Id
    private String id;

    private String userId;

    // Frontend sends userName directly
    private String userName;

    private Double amount;

    // Frontend sends coins (loyalty points)
    private Integer coins;

    private String upiId;

    // Stored as simple lowercase string to match frontend expectations
    @Builder.Default
    private String status = "pending";

    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();

    private LocalDateTime processedAt;

    // Frontend expects "date" as a formatted date string
    @JsonProperty("date")
    public String getDate() {
        if (requestedAt != null) {
            return requestedAt.format(DateTimeFormatter.ISO_LOCAL_DATE);
        }
        return null;
    }

    @JsonProperty("date")
    public void setDate(String date) {
        // Accept date from frontend but store in requestedAt
        if (date != null && !date.isEmpty()) {
            try {
                this.requestedAt = LocalDateTime.parse(date + "T00:00:00");
            } catch (Exception e) {
                // keep current requestedAt
            }
        }
    }
}
