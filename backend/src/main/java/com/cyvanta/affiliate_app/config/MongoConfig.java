package com.cyvanta.affiliate_app.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import jakarta.annotation.PostConstruct;

@Configuration
public class MongoConfig {

    @Value("${app.mongodb.uri:mongodb://localhost:27017/affiliate-app}")
    private String mongoUri;

    @Value("${app.mongodb.database:affiliate-app}")
    private String databaseName;

    @PostConstruct
    public void logMongoConfig() {
        System.out.println("=== Mongo Config Debug ===");
        System.out.println("Mongo URI = " + mongoUri);
        System.out.println("Mongo DB  = " + databaseName);
        System.out.println("==========================");
    }

    @Bean
    @Primary
    public MongoClient mongoClient() {
        return MongoClients.create(new ConnectionString(mongoUri));
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(
                new SimpleMongoClientDatabaseFactory(mongoClient(), databaseName)
        );
    }
}