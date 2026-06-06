package com.cyvanta.affiliate_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String title;

    private String description;

    private Double price;

    private Double discountPrice;

    private String category;

    private String brand;

    private List<String> images;

    private String affiliateUrl; // base affiliate network URL

    private String sourcePlatform; // e.g., Amazon, Flipkart, Myntra

    private Double commissionPercentage; // average commission %

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- Frontend-compatible aliases ---
    // Frontend uses "name" instead of "title"
    @JsonProperty("name")
    public String getName() {
        return this.title;
    }

    @JsonProperty("name")
    public void setName(String name) {
        this.title = name;
    }

    // Frontend uses "platform" instead of "sourcePlatform"
    @JsonProperty("platform")
    public String getPlatform() {
        return this.sourcePlatform;
    }

    @JsonProperty("platform")
    public void setPlatform(String platform) {
        this.sourcePlatform = platform;
    }

    // Frontend uses "cashbackValue" instead of "commissionPercentage"
    @JsonProperty("cashbackValue")
    public Double getCashbackValue() {
        return this.commissionPercentage;
    }

    @JsonProperty("cashbackValue")
    public void setCashbackValue(Double cashbackValue) {
        this.commissionPercentage = cashbackValue;
    }

    // Frontend uses "image" (single string) instead of "images" (list)
    @JsonProperty("image")
    public String getImage() {
        if (this.images != null && !this.images.isEmpty()) {
            return this.images.get(0);
        }
        return null;
    }

    @JsonProperty("image")
    public void setImage(String image) {
        if (image != null) {
            this.images = List.of(image);
        }
    }

    // Frontend uses "status" (string "active"/"inactive") instead of "isActive" (boolean)
    @JsonProperty("status")
    public String getStatus() {
        return Boolean.TRUE.equals(this.isActive) ? "active" : "inactive";
    }

    @JsonProperty("status")
    public void setStatus(String status) {
        this.isActive = "active".equalsIgnoreCase(status);
    }
}
