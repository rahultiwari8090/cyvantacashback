package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.ClickLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClickLogRepository extends MongoRepository<ClickLog, String> {
}
