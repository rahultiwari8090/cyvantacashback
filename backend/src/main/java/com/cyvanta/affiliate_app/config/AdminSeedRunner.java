package com.cyvanta.affiliate_app.config;

import com.cyvanta.affiliate_app.model.Coupon;
import com.cyvanta.affiliate_app.model.Product;
import com.cyvanta.affiliate_app.model.Store;
import com.cyvanta.affiliate_app.model.User;
import com.cyvanta.affiliate_app.repository.ProductRepository;
import com.cyvanta.affiliate_app.repository.StoreRepository;
import com.cyvanta.affiliate_app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AdminSeedRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminSeedRunner(UserRepository userRepository, ProductRepository productRepository, StoreRepository storeRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
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

            storeRepository.deleteAll();
            storeRepository.saveAll(List.of(
                    Store.builder()
                            .name("Amazon")
                            .logo("https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg")
                            .cashbackRate("8%")
                            .description("Up to 8% rewards on electronics, fashion, and home appliances.")
                            .category("electronics")
                            .isPopular(true)
                            .coupons(List.of(
                                Coupon.builder().id("c1").title("Flat 10% Off on Electronics").description("Use HDFC credit cards to get an instant 10% discount.").code("HDFC10").expiry("Valid till month end").build(),
                                Coupon.builder().id("c2").title("Up to 40% Off on Daily Essentials").description("Save big on Amazon Pantry.").code(null).expiry("Ongoing").build()
                            ))
                            .build(),
                    Store.builder()
                            .name("Flipkart")
                            .logo("https://www.google.com/s2/favicons?sz=256&domain=flipkart.com")
                            .cashbackRate("10.5%")
                            .description("Grab exclusive rewards on mobile phones, fashion, and beauty products.")
                            .category("electronics")
                            .isPopular(true)
                            .coupons(List.of(
                                Coupon.builder().id("c3").title("Big Billion Days Preview").description("Extra 5% cashback on Flipkart Axis Bank Card.").code(null).expiry("Limited time").build()
                            ))
                            .build(),
                    Store.builder()
                            .name("Myntra")
                            .logo("https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png")
                            .cashbackRate("12%")
                            .description("Earn massive cashback on premium clothing, footwear, and accessories.")
                            .category("fashion")
                            .isPopular(true)
                            .coupons(List.of(
                                Coupon.builder().id("c4").title("Flat Rs. 500 Off on First Order").description("Valid on minimum purchase of Rs. 1499.").code("MYNTRA500").expiry("For New Users").build(),
                                Coupon.builder().id("c5").title("Up to 70% Off on Men's Wear").description("End of Reason Sale preview deals.").code(null).expiry("Valid till stocks last").build()
                            ))
                            .build(),
                    Store.builder()
                            .name("Ajio")
                            .logo("https://www.google.com/s2/favicons?sz=256&domain=ajio.com")
                            .cashbackRate("15%")
                            .description("Highest cashback rates on trending fashion collections.")
                            .category("fashion")
                            .isPopular(true)
                            .build(),
                    Store.builder()
                            .name("Nykaa")
                            .logo("https://www.google.com/s2/favicons?sz=256&domain=nykaa.com")
                            .cashbackRate("7%")
                            .description("Best offers on makeup, skincare, and health products.")
                            .category("health")
                            .isPopular(false)
                            .build()
            ));
            System.out.println("Sample stores with coupons seeded successfully");
        } catch (Exception e) {
            System.out.println("Database seed skipped because MongoDB is not reachable or not configured correctly");
            e.printStackTrace();
        }
    }
}