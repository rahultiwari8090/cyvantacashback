package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.SharedCommission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedCommissionRepository extends MongoRepository<SharedCommission, String> {
    List<SharedCommission> findByUserId(String userId);
    java.util.Optional<SharedCommission> findByOrderId(String orderId);
    java.util.Optional<SharedCommission> findByClickId(String clickId);
    List<SharedCommission> findByShareId(String shareId);
}
