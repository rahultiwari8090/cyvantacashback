package com.cyvanta.affiliate_app.repository;

import com.cyvanta.affiliate_app.model.SupportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends MongoRepository<SupportTicket, String> {
    List<SupportTicket> findByUserId(String userId);
    Optional<SupportTicket> findByTicketNumber(String ticketNumber);
    List<SupportTicket> findByStatus(String status);
    List<SupportTicket> findByAssignedTo(String adminId);
    long countByStatus(String status);
}
