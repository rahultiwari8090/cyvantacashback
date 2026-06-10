package com.cyvanta.affiliate_app.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOtpEmail(String to, String otp) {
        String subject = "Verify your account - Cyvanta Cashback";
        String text = "Welcome to Cyvanta!\n\nYour registration OTP code is: " + otp + "\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.";

        // If SMTP is not configured, we just log it. 
        if (fromEmail == null || fromEmail.isEmpty() || fromEmail.contains("your-email")) {
            log.warn("SMTP not configured properly. Printing OTP to console for testing.");
            log.info("===========================================");
            log.info("OTP for {}: {}", to, otp);
            log.info("===========================================");
            return;
        }

        try {
            if (mailSender == null) {
                log.warn("JavaMailSender is not available. Skipping actual email dispatch.");
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("OTP email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
            // Fallback to logging so user can test
            log.info("===========================================");
            log.info("OTP for {}: {}", to, otp);
            log.info("===========================================");
        }
    }
}
