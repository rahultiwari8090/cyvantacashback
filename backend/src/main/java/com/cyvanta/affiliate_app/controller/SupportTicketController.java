package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.SupportTicket;
import com.cyvanta.affiliate_app.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketRepository ticketRepository;

    // Generate unique ticket number
    private String generateTicketNumber() {
        long count = ticketRepository.count();
        return "TKT" + (10001 + count);
    }

    // ========== USER ENDPOINTS ==========

    // Create a new ticket
    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        ticket.setTicketNumber(generateTicketNumber());
        ticket.setStatus("OPEN");
        ticket.setPriority("MEDIUM");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        if (ticket.getMessages() == null) ticket.setMessages(new ArrayList<>());
        if (ticket.getAttachments() == null) ticket.setAttachments(new ArrayList<>());

        SupportTicket saved = ticketRepository.save(ticket);
        return ResponseEntity.ok(saved);
    }

    // Get all tickets for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SupportTicket>> getUserTickets(@PathVariable String userId) {
        List<SupportTicket> tickets = ticketRepository.findByUserId(userId);
        tickets.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return ResponseEntity.ok(tickets);
    }

    // Get a single ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> getTicket(@PathVariable String id) {
        return ticketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Add a message to a ticket (chat)
    @PostMapping("/{id}/messages")
    public ResponseEntity<SupportTicket> addMessage(@PathVariable String id, @RequestBody SupportTicket.TicketMessage message) {
        Optional<SupportTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) return ResponseEntity.notFound().build();

        SupportTicket ticket = ticketOpt.get();
        message.setId(UUID.randomUUID().toString());
        message.setSentAt(LocalDateTime.now());

        if (ticket.getMessages() == null) ticket.setMessages(new ArrayList<>());
        ticket.getMessages().add(message);
        ticket.setUpdatedAt(LocalDateTime.now());

        // If admin replies to an OPEN ticket, mark it IN_PROGRESS
        if ("ADMIN".equals(message.getSenderRole()) && "OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }

        SupportTicket saved = ticketRepository.save(ticket);
        return ResponseEntity.ok(saved);
    }

    // ========== ADMIN ENDPOINTS ==========

    // Get all tickets (admin)
    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        List<SupportTicket> tickets = ticketRepository.findAll();
        tickets.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return ResponseEntity.ok(tickets);
    }

    // Get ticket stats (admin dashboard)
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTicketStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", ticketRepository.count());
        stats.put("open", ticketRepository.countByStatus("OPEN"));
        stats.put("inProgress", ticketRepository.countByStatus("IN_PROGRESS"));
        stats.put("pending", ticketRepository.countByStatus("PENDING"));
        stats.put("resolved", ticketRepository.countByStatus("RESOLVED"));
        stats.put("closed", ticketRepository.countByStatus("CLOSED"));
        return ResponseEntity.ok(stats);
    }

    // Update ticket status
    @PutMapping("/{id}/status")
    public ResponseEntity<SupportTicket> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<SupportTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) return ResponseEntity.notFound().build();

        SupportTicket ticket = ticketOpt.get();
        String newStatus = body.get("status");
        if (newStatus != null) {
            ticket.setStatus(newStatus);
            if ("RESOLVED".equals(newStatus) || "CLOSED".equals(newStatus)) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    // Update ticket priority
    @PutMapping("/{id}/priority")
    public ResponseEntity<SupportTicket> updatePriority(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<SupportTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) return ResponseEntity.notFound().build();

        SupportTicket ticket = ticketOpt.get();
        String newPriority = body.get("priority");
        if (newPriority != null) ticket.setPriority(newPriority);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    // Assign ticket to an admin
    @PutMapping("/{id}/assign")
    public ResponseEntity<SupportTicket> assignTicket(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<SupportTicket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) return ResponseEntity.notFound().build();

        SupportTicket ticket = ticketOpt.get();
        ticket.setAssignedTo(body.get("adminId"));
        ticket.setAssignedToName(body.get("adminName"));
        if ("OPEN".equals(ticket.getStatus())) ticket.setStatus("IN_PROGRESS");
        ticket.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    // Delete a ticket (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
