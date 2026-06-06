package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.Cashback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CashbackRepository extends MongoRepository<Cashback, String> {
}
