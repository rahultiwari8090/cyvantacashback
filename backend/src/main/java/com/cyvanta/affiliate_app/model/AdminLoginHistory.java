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
@Document(collection = "admin_login_history")
public class AdminLoginHistory {
    @Id
    private String id;
    private String adminId;
    private String email;
    private String role;
    private Boolean success;
    private String ipAddress;
    private String userAgent;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
