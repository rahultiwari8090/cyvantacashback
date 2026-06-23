package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_activity_logs")
public class AdminActivityLog {
    @Id
    private String id;
    private String adminId;
    private String adminEmail;
    private String adminRole;
    private String action;
    private String target;
    private String details;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
