package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.Settings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends MongoRepository<Settings, String> {
}
