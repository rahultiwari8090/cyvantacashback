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
@Document(collection = "share_actions")
public class ShareAction {
    @Id
    private String id;

    @Indexed(unique = true)
    private String shareId;

    private String referrerId;

    private String productId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
