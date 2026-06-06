package com.cyvanta.affiliate_app.config;

import com.cyvanta.affiliate_app.model.Product;
import com.cyvanta.affiliate_app.model.User;
import com.cyvanta.affiliate_app.repository.ProductRepository;
import com.cyvanta.affiliate_app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdminSeedRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminSeedRunner(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (userRepository.findByEmail("admin@affiliateapp.com").isPresent()) {
                System.out.println("Admin already exists");
            } else {
                User admin = new User();
                admin.setName("admin");
                admin.setPhone("+919476543211");
                admin.setEmail("admin@affiliateapp.com");
                admin.setReferralCode("admin123");
                admin.setRole(User.Role.ADMIN);
                admin.setPasswordHash(passwordEncoder.encode("admin123"));

                userRepository.save(admin);
                System.out.println("Admin seeded successfully");
            }

            if (productRepository.count() == 0) {
                productRepository.saveAll(List.of(
                        Product.builder()
                                .title("boAt Rockerz 450 Bluetooth Headphones")
                                .description("Wireless on-ear headphones with mic and up to 30 hours playback.")
                                .price(59.99)
                                .discountPrice(29.99)
                                .category("electronics")
                                .brand("boAt")
                                .images(List.of("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"))
                                .affiliateUrl("https://affiliate.example.com/boat-rockerz")
                                .sourcePlatform("Amazon")
                                .commissionPercentage(10.0)
                                .build(),
                        Product.builder()
                                .title("Adidas UltraBoost 22 Running Shoes")
                                .description("Responsive running shoes designed for comfort and energy return.")
                                .price(220.00)
                                .discountPrice(110.00)
                                .category("fashion")
                                .brand("Adidas")
                                .images(List.of("https://images.unsplash.com/photo-1528701800489-20fd40f8b08d?w=300"))
                                .affiliateUrl("https://affiliate.example.com/adidas-ultraboost")
                                .sourcePlatform("Myntra")
                                .commissionPercentage(12.0)
                                .build(),
                        Product.builder()
                                .title("HP Pavilion Touchscreen Laptop")
                                .description("High-performance laptop with touchscreen, Intel Core processor, and SSD storage.")
                                .price(1099.99)
                                .discountPrice(549.99)
                                .category("electronics")
                                .brand("HP")
                                .images(List.of("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300"))
                                .affiliateUrl("https://affiliate.example.com/hp-pavilion")
                                .sourcePlatform("Flipkart")
                                .commissionPercentage(8.5)
                                .build(),
                        Product.builder()
                                .title("Cetaphil Daily Facial Cleanser")
                                .description("Gentle skin cleanser for all skin types with fragrance-free formula.")
                                .price(19.99)
                                .discountPrice(14.99)
                                .category("health")
                                .brand("Cetaphil")
                                .images(List.of("https://images.unsplash.com/photo-1546554137-f86b9593a2e7?w=300"))
                                .affiliateUrl("https://affiliate.example.com/cetaphil-cleanser")
                                .sourcePlatform("Nykaa Beauty")
                                .commissionPercentage(7.0)
                                .build()
                ));
                System.out.println("Sample products seeded successfully");
            }
        } catch (Exception e) {
            System.out.println("Database seed skipped because MongoDB is not reachable or not configured correctly");
            e.printStackTrace();
        }
    }
}