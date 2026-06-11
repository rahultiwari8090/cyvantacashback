package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.ShareAction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ShareActionRepository extends MongoRepository<ShareAction, String> {
    Optional<ShareAction> findByShareId(String shareId);
}
