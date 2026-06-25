import React, { useState } from 'react';
import { Award, Share2, DollarSign, TrendingUp } from 'lucide-react';
import { AdminTable, ExportDataButton } from './AdminComponents';

export default function AdminReferrals({ users }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic metrics calculation
  const referralCounts = {};
  let totalReferrals = 0;

  users.forEach((u) => {
    if (u.referredBy && u.referredBy !== 'None') {
      totalReferrals++;
      referralCounts[u.referredBy] = (referralCounts[u.referredBy] || 0) + 1;
    }
  });

  // Build leaderboard
  let leaderboardMap = [];
  users.forEach((u) => {
    const invites = referralCounts[u.referralCode] || 0;
    if (invites > 0) {
      leaderboardMap.push({
        user: u.name,
        invites: invites,
        earnings: invites * 50.00 // Dynamic bonus estimation
      });
    }
  });

  // Sort and rank
  leaderboardMap.sort((a, b) => b.invites - a.invites);
  const leaderboard = leaderboardMap.slice(0, 10).map((item, index) => ({
    rank: index + 1,
    ...item
  }));

  const totalBonus = leaderboardMap.reduce((sum, item) => sum + item.earnings, 0);
  const topReferrer = leaderboard.length > 0 ? `${leaderboard[0].user} (${leaderboard[0].invites} Invites)` : "No referrers yet";

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
      <td style={{ color: 'var(--secondary)', fontWeight: '700' }}>₹{item.earnings.toFixed(2)}</td>
    </tr>
  );

  const exportColumns = [
    { header: 'Rank', dataKey: 'rank' },
    { header: 'User / Referrer', dataKey: 'user' },
    { header: 'Invites Settled', dataKey: 'invites' },
    { header: 'Total Bonus Earnings (INR)', dataKey: 'earnings' }
  ];

  return (
    <div className="admin-referrals-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Referrals & Analytics</h2>
          <p>Analyze referral networks, top performance nodes, and bonuses</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ExportDataButton data={leaderboard} columns={exportColumns} filename="Referrals_Leaderboard" />
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
            <div className="admin-kpi-value">₹{totalBonus.toFixed(2)}</div>
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
