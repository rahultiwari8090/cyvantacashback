package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.User;
import com.cyvanta.affiliate_app.model.Wallet;
import com.cyvanta.affiliate_app.repository.UserRepository;
import com.cyvanta.affiliate_app.service.WalletService;
import com.cyvanta.affiliate_app.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            if (body.containsKey("status")) {
                user.setStatus(body.get("status"));
            }
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            if (updatedUser.getName() != null) user.setName(updatedUser.getName());
            if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
            if (updatedUser.getPhone() != null) user.setPhone(updatedUser.getPhone());
            if (updatedUser.getStatus() != null) user.setStatus(updatedUser.getStatus());
            
            // Handle null explicitly if sharedCommissionRate is meant to be reset
            user.setSharedCommissionRate(updatedUser.getSharedCommissionRate());
            
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- User Registration ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        // Check if user already exists
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (Boolean.TRUE.equals(existingUser.getIsVerified()) || !"pending".equals(existingUser.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
            } else {
                // User exists but pending, resend OTP
                String otp = String.format("%06d", new Random().nextInt(999999));
                existingUser.setOtp(otp);
                existingUser.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
                existingUser.setPasswordHash(passwordEncoder.encode(password)); // Update password just in case
                userRepository.save(existingUser);
                emailService.sendOtpEmail(email, otp);
                return ResponseEntity.ok(Map.of("requireOtp", true, "message", "OTP resent to email", "email", email, "otp", otp));
            }
        }

        // Generate a unique referral code
        String referralCode = generateReferralCode(name);
        String referredBy = body.getOrDefault("referredBy", null);
        String otp = String.format("%06d", new Random().nextInt(999999));

        User user = User.builder()
                .name(name != null ? name : email.split("@")[0])
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .phone(body.getOrDefault("phone", null))
                .referralCode(referralCode)
                .referredBy(referredBy)
                .role(User.Role.USER)
                .status("pending")
                .isVerified(false)
                .otp(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .build();

        userRepository.save(user);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of("requireOtp", true, "message", "OTP sent to email", "email", email, "otp", otp));
    }

    // --- OTP Verification ---
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP are required"));
        }

        return userRepository.findByEmail(email).map(user -> {
            if (Boolean.TRUE.equals(user.getIsVerified())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Account is already verified"));
            }
            if (user.getOtp() == null || !user.getOtp().equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP code"));
            }
            if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired"));
            }

            user.setIsVerified(true);
            user.setStatus("active");
            user.setOtp(null);
            user.setOtpExpiry(null);
            User savedUser = userRepository.save(user);

            Wallet wallet = walletService.getOrCreateWallet(savedUser.getId());
            Map<String, Object> response = buildUserResponse(savedUser, wallet);

            return ResponseEntity.ok((Object) response);
        }).orElse(ResponseEntity.badRequest().body(Map.of("error", "User not found")));
    }

    // --- Resend OTP ---
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        return userRepository.findByEmail(email).map(user -> {
            if (Boolean.TRUE.equals(user.getIsVerified())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Account is already verified"));
            }
            
            String otp = String.format("%06d", new Random().nextInt(999999));
            user.setOtp(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok((Object) Map.of("message", "OTP resent successfully", "otp", otp));
        }).orElse(ResponseEntity.badRequest().body(Map.of("error", "User not found")));
    }

    // --- User Login ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        return userRepository.findByEmail(email).map(user -> {
            if (Boolean.FALSE.equals(user.getIsVerified()) || "pending".equals(user.getStatus())) {
                return ResponseEntity.status(403).body((Object) Map.of("error", "Please verify your email to log in.", "requireOtp", true));
            }

            String stored = user.getPasswordHash();
            boolean ok;
            if (stored != null && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"))) {
                ok = passwordEncoder.matches(password, stored);
            } else {
                ok = password.equals(stored);
            }

            if (!ok) {
                return ResponseEntity.status(401).body((Object) Map.of("error", "Invalid credentials"));
            }

            if ("blocked".equals(user.getStatus())) {
                return ResponseEntity.status(403).body((Object) Map.of("error", "Account is blocked"));
            }

            Wallet wallet = walletService.getOrCreateWallet(user.getId());
            Map<String, Object> response = buildUserResponse(user, wallet);

            return ResponseEntity.ok((Object) response);
        }).orElse(ResponseEntity.status(401).body(Map.of("error", "User not found")));
    }

    // --- Admin Login ---
  @PostMapping("/admin/login")
public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> body) {

    String email = body.get("email");
    String password = body.get("password");

    System.out.println("LOGIN EMAIL = " + email);
    System.out.println("LOGIN PASSWORD = " + password);

    return userRepository.findByEmail(email).map(user -> {

        System.out.println("FOUND USER = " + user.getEmail());
        System.out.println("DB PASSWORD = " + user.getPasswordHash());
        System.out.println("ROLE = " + user.getRole());

        String stored = user.getPasswordHash();
        boolean ok;
        if (stored != null && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"))) {
            ok = passwordEncoder.matches(password, stored);
        } else {
            ok = password.equals(stored);
        }

        if (!ok) {
            System.out.println("PASSWORD MISMATCH");
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid credentials"));
        }

        if (user.getRole() != User.Role.ADMIN) {
            System.out.println("NOT AN ADMIN");
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        System.out.println("PASSWORD MATCHED");

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().toString(),
                "isAdmin", true,
                "status", user.getStatus()
        ));

    }).orElseGet(() -> {
        System.out.println("USER NOT FOUND");
        return ResponseEntity.status(401)
                .body(Map.of("error", "Admin user not found"));
    });
}
    
    // --- Helper: Build user response with wallet data ---

    private Map<String, Object> buildUserResponse(User user, Wallet wallet) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("referralCode", user.getReferralCode());
        response.put("referredBy", user.getReferredBy());
        response.put("status", user.getStatus());
        response.put("joinDate", user.getJoinDate());
        response.put("sharedCommissionRate", user.getSharedCommissionRate());

        Map<String, Double> walletData = new HashMap<>();
        walletData.put("confirmed", wallet.getApprovedBalance());
        walletData.put("pending", wallet.getPendingBalance());
        walletData.put("referral", 0.0); // Can be computed from referral transactions later
        response.put("wallet", walletData);

        return response;
    }

    // --- Helper: Generate referral code ---
    private String generateReferralCode(String name) {
        String prefix = (name != null && name.length() >= 3)
                ? name.substring(0, 3).toUpperCase()
                : "USR";
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return prefix + suffix;
    }
}
