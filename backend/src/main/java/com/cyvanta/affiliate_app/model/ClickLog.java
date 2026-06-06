package com.cyvanta.affiliate_app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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
@Document(collection = "click_logs")
public class ClickLog {
    @Id
    private String id; // clickId

    private String userName;
    private String productName;
    private String network;
    private LocalDate date;

    // Frontend expects "clickId" in the response JSON
    @JsonProperty("clickId")
    public String getClickId() {
        return this.id;
    }
}
