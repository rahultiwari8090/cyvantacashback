package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "support_tickets")
public class SupportTicket {
    @Id
    private String id;

    private String ticketNumber; // e.g. TKT10001

    private String userId;
    private String userName;
    private String userEmail;

    private String category; // WITHDRAWAL_ISSUE, CASHBACK_NOT_RECEIVED, ACCOUNT_PROBLEM, REFERRAL_ISSUE, TECHNICAL_ISSUE, OTHER
    private String subject;
    private String description;

    private List<String> attachments; // URLs of uploaded files

    @Builder.Default
    private String status = "OPEN"; // OPEN, PENDING, IN_PROGRESS, RESOLVED, CLOSED

    @Builder.Default
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    private String assignedTo; // Admin ID
    private String assignedToName;

    @Builder.Default
    private List<TicketMessage> messages = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketMessage {
        private String id;
        private String senderId;
        private String senderName;
        private String senderRole; // USER or ADMIN
        private String message;
        private List<String> attachments;
        @Builder.Default
        private LocalDateTime sentAt = LocalDateTime.now();
    }
}
