package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Product;
import com.cyvanta.affiliate_app.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Optional;

@RestController
@RequestMapping("/api/redirect")
@RequiredArgsConstructor
public class RedirectController {

    private final ProductService productService;

    @GetMapping("/{productId}")
    public RedirectView redirectUserToAffiliate(@PathVariable String productId,
                                                @RequestParam(required = false) String ref) {
        
        Optional<Product> productOpt = productService.getProductById(productId);
        
        if (productOpt.isEmpty()) {
            RedirectView redirectView = new RedirectView();
            redirectView.setUrl("https://yourapp.in/404"); // Fallback URL
            return redirectView;
        }

        Product product = productOpt.get();
        String finalUrl = product.getAffiliateUrl();

        // If a referral code exists, append it as a tracking parameter
        // This depends on the affiliate network. E.g., for EarnKaro it might be &subid=
        if (ref != null && !ref.isEmpty()) {
            if (finalUrl.contains("?")) {
                finalUrl += "&subid1=" + ref;
            } else {
                finalUrl += "?subid1=" + ref;
            }
        }

        // Logic for tracking the click event can go here (e.g., save to DB or send to analytics)

        RedirectView redirectView = new RedirectView();
        redirectView.setUrl(finalUrl);
        return redirectView;
    }
}
