package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.SharedLink;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedLinkRepository extends MongoRepository<SharedLink, String> {
    List<SharedLink> findByUserId(String userId);
}
