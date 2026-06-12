package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.AffiliateClick;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AffiliateClickRepository extends MongoRepository<AffiliateClick, String> {
    Optional<AffiliateClick> findByTrackingId(String trackingId);
    java.util.List<AffiliateClick> findByShareId(String shareId);
    java.util.List<AffiliateClick> findByReferrerId(String referrerId);
}
