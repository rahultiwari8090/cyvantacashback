package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.WithdrawalRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRequestRepository extends MongoRepository<WithdrawalRequest, String> {
    List<WithdrawalRequest> findByUserId(String userId);
}
