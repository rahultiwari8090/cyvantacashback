package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.AdminLoginHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminLoginHistoryRepository extends MongoRepository<AdminLoginHistory, String> {
    List<AdminLoginHistory> findAllByOrderByTimestampDesc();
}
