package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.TrackedOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrackedOrderRepository extends MongoRepository<TrackedOrder, String> {
}
