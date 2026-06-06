package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.Conversion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversionRepository extends MongoRepository<Conversion, String> {
}
