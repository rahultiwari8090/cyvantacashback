import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Search, ChevronLeft, Send, Clock, CheckCircle, XCircle, AlertCircle, Loader, MessageSquare, Filter, Trash2, User } from 'lucide-react';
import { apiTickets } from '../services/api';

const CATEGORIES = [
  { value: 'WITHDRAWAL_ISSUE', label: '💳 Withdrawal Issue' },
  { value: 'CASHBACK_NOT_RECEIVED', label: '💰 Cashback Not Received' },
  { value: 'ACCOUNT_PROBLEM', label: '👤 Account Problem' },
  { value: 'REFERRAL_ISSUE', label: '🔗 Referral Issue' },
  { value: 'TECHNICAL_ISSUE', label: '🔧 Technical Issue' },
  { value: 'OTHER', label: '📋 Other' },
];

const STATUS_MAP = {
  OPEN: { label: 'Open', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: AlertCircle },
  PENDING: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: Loader },
  RESOLVED: { label: 'Resolved', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: XCircle },
};

const PRIORITY_MAP = {
  LOW: { label: 'Low', color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  HIGH: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  URGENT: { label: 'Urgent', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
};

export default function AdminTickets({ adminUser }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allTickets, ticketStats] = await Promise.all([
        apiTickets.getAll(),
        apiTickets.getStats(),
      ]);
      setTickets(allTickets || []);
      setStats(ticketStats || {});
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const updated = await apiTickets.updateStatus(ticketId, newStatus);
      setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
      fetchData(); // refresh stats
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      const updated = await apiTickets.updatePriority(ticketId, newPriority);
      setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      setSending(true);
      const updated = await apiTickets.addMessage(selectedTicket.id, {
        senderId: adminUser?.id || 'admin',
        senderName: adminUser?.name || 'Admin',
        senderRole: 'ADMIN',
        message: newMessage.trim(),
        attachments: [],
      });
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await apiTickets.delete(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      if (selectedTicket?.id === id) setSelectedTicket(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const openDetail = async (ticket) => {
    try {
      const fresh = await apiTickets.getById(ticket.id);
      setSelectedTicket(fresh);
    } catch {
      setSelectedTicket(ticket);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (t.ticketNumber || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.userName || '').toLowerCase().includes(q) ||
        (t.userEmail || '').toLowerCase().includes(q);
    }
    return true;
  });

  // KPI Card
  const KpiCard = ({ label, value, color }) => (
    <div style={{
      padding: '16px 20px', borderRadius: '12px', background: 'var(--card-bg)',
      border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px',
      borderLeft: `4px solid ${color}`,
    }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <span style={{ fontSize: '22px', fontWeight: 800, color: color, fontFamily: 'var(--heading)' }}>{value}</span>
    </div>
  );

  // ===== DETAIL VIEW =====
  if (selectedTicket) {
    const st = STATUS_MAP[selectedTicket.status] || STATUS_MAP.OPEN;
    const pr = PRIORITY_MAP[selectedTicket.priority] || PRIORITY_MAP.MEDIUM;
    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button onClick={() => setSelectedTicket(null)} className="admin-sidebar-link" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
          color: 'var(--primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: '4px 0', width: 'auto',
        }}>
          <ChevronLeft size={16} /> Back to All Tickets
        </button>

        {/* Ticket Info Header */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-bold)', fontFamily: 'var(--heading)' }}>#{selectedTicket.ticketNumber}</span>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: pr.bg, color: pr.color }}>{pr.label}</span>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--text-bold)' }}>{selectedTicket.subject}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 10px', lineHeight: 1.5 }}>{selectedTicket.description}</p>
              <div style={{ fontSize: '11px', color: 'var(--text)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span>👤 {selectedTicket.userName} ({selectedTicket.userEmail || 'no email'})</span>
                <span>📂 {CATEGORIES.find(c => c.value === selectedTicket.category)?.label || selectedTicket.category}</span>
                <span>📅 {formatDate(selectedTicket.createdAt)}</span>
              </div>
            </div>

            {/* Admin Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Status</label>
                <select value={selectedTicket.status} onChange={e => handleStatusChange(selectedTicket.id, e.target.value)} style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                  border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)', cursor: 'pointer',
                }}>
                  {Object.entries(STATUS_MAP).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Priority</label>
                <select value={selectedTicket.priority} onChange={e => handlePriorityChange(selectedTicket.id, e.target.value)} style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                  border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)', cursor: 'pointer',
                }}>
                  {Object.entries(PRIORITY_MAP).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '14px', color: 'var(--text-bold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💬 Conversation ({selectedTicket.messages?.length || 0})</span>
          </div>

          <div style={{ padding: '16px 20px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg)' }}>
            {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text)', fontSize: '13px' }}>No messages yet.</div>
            ) : selectedTicket.messages.map((msg, idx) => {
              const isAdmin = msg.senderRole === 'ADMIN';
              return (
                <div key={msg.id || idx} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', padding: '12px 16px',
                    borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isAdmin ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'var(--card-bg)',
                    color: isAdmin ? '#fff' : 'var(--text-bold)',
                    border: isAdmin ? 'none' : '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px', opacity: isAdmin ? 0.85 : 0.6 }}>
                      {msg.senderName} • {isAdmin ? 'Support Team' : 'User'}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.message}</div>
                    <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.6, textAlign: 'right' }}>{formatDate(msg.sentAt)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Admin Reply */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
              placeholder="Reply as admin..."
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
                border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)',
              }}
            />
            <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} style={{
              padding: '10px 16px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px',
              opacity: (sending || !newMessage.trim()) ? 0.5 : 1,
            }}>
              <Send size={14} /> Reply
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== LIST VIEW =====
  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Support Tickets</h2>
          <p>Manage user support requests and communicate with customers</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <KpiCard label="Total" value={stats.total || 0} color="var(--text-bold)" />
        <KpiCard label="Open" value={stats.open || 0} color="#3b82f6" />
        <KpiCard label="In Progress" value={stats.inProgress || 0} color="#8b5cf6" />
        <KpiCard label="Pending" value={stats.pending || 0} color="#f59e0b" />
        <KpiCard label="Resolved" value={stats.resolved || 0} color="#10b981" />
        <KpiCard label="Closed" value={stats.closed || 0} color="#6b7280" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', padding: '14px 18px', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <Filter size={15} style={{ color: 'var(--text)' }} />
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)', opacity: 0.5 }} />
          <input type="text" placeholder="Search ticket, user, or subject..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{
            width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)',
          }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
          padding: '8px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)',
        }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{
          padding: '8px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)',
        }}>
          <option value="">All Priorities</option>
          {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Tickets Table */}
      <div style={{ borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text)' }}>
            <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text)' }}>
            <MessageSquare size={40} style={{ color: 'var(--border)', marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-bold)' }}>No tickets found</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr>
                  {['Ticket', 'User', 'Category', 'Subject', 'Priority', 'Status', 'Messages', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                      color: 'var(--text)', borderBottom: '1px solid var(--border)', textAlign: 'left', letterSpacing: '0.3px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => {
                  const st = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
                  const pr = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.MEDIUM;
                  return (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb), 0.015)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => openDetail(ticket)}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>#{ticket.ticketNumber}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-bold)' }}>{ticket.userName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text)' }}>{ticket.userEmail || '—'}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text)' }}>
                        {CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-bold)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.subject}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: pr.bg, color: pr.color }}>{pr.label}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px', textAlign: 'center' }}>{ticket.messages?.length || 0}</td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text)' }}>
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleDelete(ticket.id)} title="Delete" style={{
                          padding: '6px', borderRadius: '6px', border: '1px solid var(--border)',
                          background: 'var(--bg)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
