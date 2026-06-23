package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.AdminActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActivityLogRepository extends MongoRepository<AdminActivityLog, String> {
    List<AdminActivityLog> findAllByOrderByTimestampDesc();
}
