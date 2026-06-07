package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.Deal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DealRepository extends MongoRepository<Deal, String> {
}
