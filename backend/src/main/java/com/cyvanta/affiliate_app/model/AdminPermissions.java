package com.cyvanta.affiliate_app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPermissions {
    @Builder.Default
    private Boolean view = false;
    @Builder.Default
    private Boolean add = false;
    @Builder.Default
    private Boolean edit = false;
    @Builder.Default
    private Boolean delete = false;
    @Builder.Default
    private Boolean export = false;
    @Builder.Default
    private Boolean settings = false;

    // Module-level access: which sidebar sections this admin can see/use
    @Builder.Default
    private List<String> allowedModules = Collections.emptyList();

    // Whether this admin can manage (promote/demote) other admin users
    @Builder.Default
    private Boolean manageAdmins = false;

    // All available modules in the admin panel
    public static final List<String> ALL_MODULES = Arrays.asList(
        "dashboard", "users", "roles", "products", "withdrawals",
        "click-logs", "conversions", "referrals", "shared-commissions",
        "categories", "deals", "stores", "banners", "affiliate-network", "ledger",
        "seo", "settings", "activity-logs", "login-history", "finance"
    );

    public static AdminPermissions defaultForRole(User.Role role) {
        if (role == null) {
            return AdminPermissions.builder().build();
        }

        switch (role) {
            case SUPER_ADMIN:
                return AdminPermissions.builder()
                        .view(true)
                        .add(true)
                        .edit(true)
                        .delete(true)
                        .export(true)
                        .settings(true)
                        .manageAdmins(true)
                        .allowedModules(ALL_MODULES)
                        .build();
            case ADMIN:
                return AdminPermissions.builder()
                        .view(true)
                        .add(true)
                        .edit(true)
                        .delete(true)
                        .export(true)
                        .settings(true)
                        .manageAdmins(false)
                        .allowedModules(Arrays.asList(
                            "dashboard", "users", "products", "withdrawals",
                            "click-logs", "conversions", "referrals", "shared-commissions",
                            "categories", "deals", "stores", "banners", "affiliate-network", "ledger",
                            "seo", "settings", "finance"
                        ))
                        .build();
            case CONTENT_MANAGER:
                return AdminPermissions.builder()
                        .view(true)
                        .add(true)
                        .edit(true)
                        .delete(true)
                        .export(true)
                        .settings(false)
                        .manageAdmins(false)
                        .allowedModules(Arrays.asList(
                            "dashboard", "products", "categories", "deals",
                            "stores", "banners", "seo"
                        ))
                        .build();
            case AFFILIATE_MANAGER:
                return AdminPermissions.builder()
                        .view(true)
                        .add(true)
                        .edit(true)
                        .delete(false)
                        .export(true)
                        .settings(false)
                        .manageAdmins(false)
                        .allowedModules(Arrays.asList(
                            "dashboard", "users", "conversions", "referrals",
                            "shared-commissions", "click-logs", "affiliate-network", "ledger",
                            "finance"
                        ))
                        .build();
            case SUPPORT_ADMIN:
                return AdminPermissions.builder()
                        .view(true)
                        .add(false)
                        .edit(true)
                        .delete(false)
                        .export(false)
                        .settings(false)
                        .manageAdmins(false)
                        .allowedModules(Arrays.asList(
                            "dashboard", "users", "withdrawals", "conversions"
                        ))
                        .build();
            default:
                return AdminPermissions.builder().build();
        }
    }
}
