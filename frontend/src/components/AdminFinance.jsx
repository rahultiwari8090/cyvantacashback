import React, { useState } from 'react';
import { DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { AdminTable } from './AdminComponents';

export default function AdminFinance({ finance, withdrawRequests }) {
  const [currentPageTx, setCurrentPageTx] = useState(1);
  const [currentPageWh, setCurrentPageWh] = useState(1);

  // Filter completed withdrawals for withdrawal history table
  const withdrawalHistory = withdrawRequests.filter((w) => w.status !== 'pending');

  const txHeaders = ['Transaction Detail', 'Type', 'Amount', 'Date Recorded'];
  const whHeaders = ['User Name', 'Redeemed Amount', 'UPI Address', 'Status', 'Date Settled'];

  const renderTxRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.desc}</td>
      <td>
        <span
          className="status-badge"
          style={{
            backgroundColor: item.type === 'credit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: item.type === 'credit' ? '#10b981' : '#ef4444',
          }}
        >
          {item.type === 'credit' ? 'Credit' : 'Debit'}
        </span>
      </td>
      <td
        style={{
          fontWeight: '700',
          color: item.type === 'credit' ? '#10b981' : '#ef4444',
        }}
      >
        {item.type === 'credit' ? '+' : '-'}₹{item.amount.toFixed(2)}
      </td>
      <td>{item.date}</td>
    </tr>
  );

  const renderWhRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>{item.userName}</td>
      <td style={{ fontWeight: '700', color: 'var(--text-bold)' }}>₹{item.amount.toFixed(2)}</td>
      <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{item.upiId}</td>
      <td>
        <span className={`status-badge ${item.status}`}>{item.status}</span>
      </td>
      <td>{item.date}</td>
    </tr>
  );

  return (
    <div className="admin-finance-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Finance Ledgers</h2>
          <p>Monitor platform affiliate revenues, payout records, and pending liabilities</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-kpi-grid">
        {/* Total Revenue */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Total Revenue</h3>
            <div className="admin-kpi-value">₹{finance.totalRevenue.toFixed(2)}</div>
            <span style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginTop: '4px' }}>
              Affiliate earnings + Ads
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#10b981' }}>
            <DollarSign size={22} />
          </div>
        </div>

        {/* Total Cashback Paid */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Total Cashback Paid</h3>
            <div className="admin-kpi-value">₹{finance.totalCashbackPaid.toFixed(2)}</div>
            <span style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginTop: '4px' }}>
              Confirmed user credits
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#8b5cf6' }}>
            <Activity size={22} />
          </div>
        </div>

        {/* Total Withdraw Paid */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Total Withdraw Paid</h3>
            <div className="admin-kpi-value">₹{finance.totalWithdrawPaid.toFixed(2)}</div>
            <span style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginTop: '4px' }}>
              Disbursed to UPI bank
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#3b82f6' }}>
            <Wallet size={22} />
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-info">
            <h3>Pending Liability</h3>
            <div className="admin-kpi-value">₹{finance.pendingWithdrawals.toFixed(2)}</div>
            <span style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginTop: '4px' }}>
              Queued payouts
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ color: '#f59e0b' }}>
            <Wallet size={22} />
          </div>
        </div>
      </div>

      {/* Tables Row Layout */}
      <div className="admin-dashboard-two-col">
        {/* Recent Transactions credit/debit */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3 className="admin-table-title">Recent Transactions</h3>
          </div>
          <AdminTable
            headers={txHeaders}
            items={finance.transactions}
            currentPage={currentPageTx}
            itemsPerPage={4}
            onPageChange={setCurrentPageTx}
            renderRow={renderTxRow}
            emptyMessage="No transaction history logged."
          />
        </div>

        {/* Withdrawal payout history */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3 className="admin-table-title">Withdrawal Payout History</h3>
          </div>
          <AdminTable
            headers={whHeaders}
            items={withdrawalHistory}
            currentPage={currentPageWh}
            itemsPerPage={4}
            onPageChange={setCurrentPageWh}
            renderRow={renderWhRow}
            emptyMessage="No historical withdrawals recorded."
          />
        </div>
      </div>
    </div>
  );
}
