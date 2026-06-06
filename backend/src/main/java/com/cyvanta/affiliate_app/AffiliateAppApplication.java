package com.cyvanta.affiliate_app;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AffiliateAppApplication {

    static {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue()));
    }

    public static void main(String[] args) {
        System.out.println("MONGODB_URI = " + System.getProperty("MONGODB_URI"));

        SpringApplication.run(AffiliateAppApplication.class, args);
    }
}