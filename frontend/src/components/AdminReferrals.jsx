import React, { useState } from 'react';
import { Award, Share2, DollarSign, TrendingUp } from 'lucide-react';
import { AdminTable } from './AdminComponents';

export default function AdminReferrals({ users }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Derive mock metrics
  const totalReferrals = 182;
  const totalBonus = 455.00;
  const topReferrer = "Rahul Sharma (42 Invites)";

  const leaderboard = [
    { rank: 1, user: 'Rahul Sharma', earnings: 540.00, invites: 42 },
    { rank: 2, user: 'Sneha Patel', earnings: 320.00, invites: 25 },
    { rank: 3, user: 'Amit Verma', earnings: 210.00, invites: 18 },
    { rank: 4, user: 'Pooja Hegde', earnings: 180.00, invites: 15 },
    { rank: 5, user: 'Rohan Joshi', earnings: 125.00, invites: 10 },
  ];

  const headers = ['Rank', 'User / Referrer', 'Invites Settled', 'Total Bonus Earnings'];

  const renderRow = (item, idx) => (
    <tr key={item.rank} className="animate-fade">
      <td>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: item.rank === 1 ? '#f59e0b' : item.rank === 2 ? '#9ca3af' : item.rank === 3 ? '#b45309' : 'var(--border)',
            color: item.rank <= 3 ? '#ffffff' : 'var(--text-bold)',
            fontWeight: '700',
            fontSize: '12px',
          }}
        >
          {item.rank}
        </span>
      </td>
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.user}</td>
      <td>{item.invites} Referrals</td>
      <td style={{ color: 'var(--secondary)', fontWeight: '700' }}>${item.earnings.toFixed(2)}</td>
    </tr>
  );

  return (
    <div className="admin-referrals-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Referrals & Analytics</h2>
          <p>Analyze referral networks, top performance nodes, and bonuses</p>
        </div>
      </div>

      {/* Referral Analytics Widget Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Total Referrals</h3>
            <div className="admin-kpi-value">{totalReferrals}</div>
            <span className="admin-kpi-trend positive" style={{ marginTop: '4px' }}>
              <TrendingUp size={12} style={{ marginRight: '4px' }} /> +18.4% MoM
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#8b5cf6' }}>
            <Share2 size={22} />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Total Referral Bonus</h3>
            <div className="admin-kpi-value">${totalBonus.toFixed(2)}</div>
            <span className="admin-kpi-trend positive" style={{ marginTop: '4px' }}>
              <TrendingUp size={12} style={{ marginRight: '4px' }} /> Paid out
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#10b981' }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Top Referrer</h3>
            <div className="admin-kpi-value" style={{ fontSize: '18px', marginTop: '8px' }}>{topReferrer}</div>
            <span className="admin-kpi-trend positive" style={{ marginTop: '4px' }}>
              Lifetime Star
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#f59e0b' }}>
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Top Referrer Leaderboard</h3>
        </div>
        <AdminTable
          headers={headers}
          items={leaderboard}
          currentPage={currentPage}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
          renderRow={renderRow}
          emptyMessage="No referral records."
        />
      </div>
    </div>
  );
}
