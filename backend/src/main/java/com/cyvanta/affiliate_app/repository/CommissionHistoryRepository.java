package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.CommissionHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommissionHistoryRepository extends MongoRepository<CommissionHistory, String> {
    List<CommissionHistory> findByReferrerId(String referrerId);
}
