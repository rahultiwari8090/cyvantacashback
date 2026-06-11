package com.cyvanta.affiliate_app.service;

import com.cyvanta.affiliate_app.model.AffiliateClick;

public interface AffiliateNetworkService {
    void processClick(AffiliateClick click);
    void approveCommission(String trackingId);
    void rejectCommission(String trackingId);
}
