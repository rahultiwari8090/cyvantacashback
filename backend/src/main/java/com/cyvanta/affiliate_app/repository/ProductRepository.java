package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategoryAndIsActiveTrue(String category);
}
