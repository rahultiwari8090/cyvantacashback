import React, { useState, useEffect } from 'react';
import { apiAffiliate, apiUsers, apiProducts } from '../services/api';
import { Network, CheckCircle, XCircle } from 'lucide-react';
import { ExportDataButton } from './AdminComponents';

export default function AdminAffiliateNetwork({ addNotification }) {
  const [clicks, setClicks] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [productsMap, setProductsMap] = useState({});

  const fetchData = async () => {
    try {
      const [clicksRes, commsRes, usersRes, productsRes] = await Promise.all([
        apiAffiliate.getAllClicks(),
        apiAffiliate.getCommissionHistory(),
        apiUsers.getAll(),
        apiProducts.getAll()
      ]);
      setClicks(clicksRes || []);
      setCommissions(commsRes || []);

      const uMap = {};
      (usersRes || []).forEach(u => uMap[u.id] = u.name);
      setUsersMap(uMap);

      const pMap = {};
      (productsRes || []).forEach(p => pMap[p.id] = p.name);
      setProductsMap(pMap);
    } catch (e) {
      console.error(e);
      addNotification('Failed to load affiliate data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (trackingId) => {
    try {
      await apiAffiliate.approveCommission(trackingId);
      addNotification('Commission Approved!', 'success');
      fetchData();
    } catch (e) {
      console.error(e);
      addNotification('Failed to approve commission', 'error');
    }
  };

  const handleReject = async (trackingId) => {
    try {
      await apiAffiliate.rejectCommission(trackingId);
      addNotification('Commission Rejected!', 'success');
      fetchData();
    } catch (e) {
      console.error(e);
      addNotification('Failed to reject commission', 'error');
    }
  };

  const exportClicksColumns = [
    { header: 'Date', dataKey: 'date' },
    { header: 'Buyer', dataKey: 'buyer' },
    { header: 'Referrer ShareID', dataKey: 'shareId' },
    { header: 'Product', dataKey: 'product' },
    { header: 'Tracking ID', dataKey: 'trackingId' },
    { header: 'Order ID', dataKey: 'orderId' },
    { header: 'Status', dataKey: 'status' }
  ];

  const formattedClicks = clicks.map(c => ({
    ...c,
    date: new Date(c.createdAt).toLocaleDateString(),
    buyer: c.buyerId ? usersMap[c.buyerId] || c.buyerId : 'Guest',
    product: c.productId ? productsMap[c.productId] || c.productId : 'N/A'
  }));

  const exportCommissionsColumns = [
    { header: 'Date', dataKey: 'date' },
    { header: 'Tracking ID', dataKey: 'trackingId' },
    { header: 'Referrer', dataKey: 'referrer' },
    { header: 'Payout Amount (INR)', dataKey: 'amount' },
    { header: 'Status', dataKey: 'status' }
  ];

  const formattedCommissions = commissions.map(c => ({
    ...c,
    date: new Date(c.createdAt).toLocaleDateString(),
    referrer: usersMap[c.referrerId] || c.referrerId
  }));

  return (
    <div className="admin-affiliate-network animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-page-header">
        <h2 className="section-title"><Network size={20} style={{ display: 'inline', marginRight: '8px' }}/> Dummy Affiliate Network</h2>
        <p>Monitor simulated E2E referral conversions and approve payouts.</p>
      </div>

      <div className="history-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Network Click Tracking</h3>
          <ExportDataButton data={formattedClicks} columns={exportClicksColumns} filename="Affiliate_Clicks" />
        </div>
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Buyer</th>
                <th>Referrer ShareID</th>
                <th>Product</th>
                <th>Tracking ID</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map(c => (
                <tr key={c.id}>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.buyerId ? usersMap[c.buyerId] || c.buyerId : 'Guest'}</td>
                  <td>{c.shareId || 'Direct'}</td>
                  <td>{c.productId ? productsMap[c.productId] || c.productId : 'N/A'}</td>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{c.trackingId}</td>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{c.orderId || '-'}</td>
                  <td>
                    <span className={`history-status ${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === 'PURCHASED' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => handleApprove(c.trackingId)} style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12}/> Approve
                        </button>
                        <button className="btn-withdraw" onClick={() => handleReject(c.trackingId)} style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12}/> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {clicks.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>No tracking data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="history-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Commission Payout History</h3>
          <ExportDataButton data={formattedCommissions} columns={exportCommissionsColumns} filename="Affiliate_Commissions" />
        </div>
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tracking ID</th>
                <th>Referrer</th>
                <th>Payout Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c.id}>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{c.trackingId}</td>
                  <td>{usersMap[c.referrerId] || c.referrerId}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{c.amount.toFixed(2)}</td>
                  <td>
                    <span className={`history-status ${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No payouts generated yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
