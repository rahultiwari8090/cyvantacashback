package com.cyvanta.affiliate_app.controller;

import com.cyvanta.affiliate_app.model.Product;
import com.cyvanta.affiliate_app.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(productService.getProductsByCategory(category));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Frontend calls POST /api/products
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    // Keep the old /admin endpoint as an alias for backward compatibility
    @PostMapping("/admin")
    public ResponseEntity<Product> createProductAdmin(@RequestBody Product product) {
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    // Frontend calls POST /api/products/bulk
    @PostMapping("/bulk")
    public ResponseEntity<List<Product>> createProductBulk(@RequestBody List<Product> products) {
        List<Product> savedProducts = new ArrayList<>();
        for (Product product : products) {
            savedProducts.add(productService.saveProduct(product));
        }
        return ResponseEntity.ok(savedProducts);
    }

    // Frontend calls PUT /api/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        return productService.getProductById(id).map(existing -> {
            product.setId(id);
            return ResponseEntity.ok(productService.saveProduct(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Frontend calls DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        return productService.getProductById(id).map(existing -> {
            productService.deleteProduct(id);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
