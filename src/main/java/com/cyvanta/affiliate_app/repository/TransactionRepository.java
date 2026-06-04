package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    Optional<Transaction> findByOrderId(String orderId);
    List<Transaction> findByReferrerId(String referrerId);
}
