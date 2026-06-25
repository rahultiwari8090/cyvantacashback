package com.cyvanta.affiliate_app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> index() {
        return Map.of("status", "UP", "message", "Cyvanta Backend is running");
    }

    @GetMapping("/api")
    public Map<String, String> apiIndex() {
        return Map.of("status", "UP", "message", "Cyvanta API is running at /api");
    }
}
