package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
}
