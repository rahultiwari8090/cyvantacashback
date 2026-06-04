package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.SharedCommission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedCommissionRepository extends MongoRepository<SharedCommission, String> {
    List<SharedCommission> findByUserId(String userId);
}
