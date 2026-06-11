package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.WalletTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface WalletTransactionRepository extends MongoRepository<WalletTransaction, String> {
    List<WalletTransaction> findByUserId(String userId);
}
