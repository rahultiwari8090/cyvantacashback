import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Plus, ChevronLeft, Send, Paperclip, Clock, CheckCircle, XCircle, AlertCircle, Loader, MessageSquare } from 'lucide-react';
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
  LOW: { label: 'Low', color: '#6b7280' },
  MEDIUM: { label: 'Medium', color: '#f59e0b' },
  HIGH: { label: 'High', color: '#ef4444' },
  URGENT: { label: 'Urgent', color: '#dc2626' },
};

export default function UserSupport({ currentUser, onAddNotification }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, create, detail
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Create form states
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const data = await apiTickets.getByUser(currentUser.id);
      setTickets(data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [currentUser?.id]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!category || !subject.trim() || !description.trim()) {
      onAddNotification?.('Please fill all required fields.', 'error');
      return;
    }
    try {
      setCreating(true);
      const ticket = await apiTickets.create({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email || '',
        category, subject, description,
        attachments: [],
      });
      setTickets(prev => [ticket, ...prev]);
      onAddNotification?.(`Ticket #${ticket.ticketNumber} created successfully!`, 'success');
      setCategory(''); setSubject(''); setDescription('');
      setView('list');
    } catch (err) {
      onAddNotification?.('Failed to create ticket. Please try again.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      setSending(true);
      const updated = await apiTickets.addMessage(selectedTicket.id, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: 'USER',
        message: newMessage.trim(),
        attachments: [],
      });
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setNewMessage('');
    } catch (err) {
      onAddNotification?.('Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  const openTicketDetail = async (ticket) => {
    try {
      const fresh = await apiTickets.getById(ticket.id);
      setSelectedTicket(fresh);
      setView('detail');
    } catch {
      setSelectedTicket(ticket);
      setView('detail');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  const formatShort = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }
    catch { return ''; }
  };

  // ===== LIST VIEW =====
  if (view === 'list') return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <HelpCircle size={24} style={{ color: 'var(--primary)' }} /> Support Tickets
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px' }}>
            Raise and track your support requests
          </p>
        </div>
        <button onClick={() => setView('create')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
          background: 'var(--gradient-primary)', border: 'none', color: '#fff', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255,79,47,0.25)',
        }}>
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text)' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <p style={{ marginTop: '12px' }}>Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <MessageSquare size={48} style={{ color: 'var(--border)', marginBottom: '12px' }} />
          <p style={{ fontWeight: 700, color: 'var(--text-bold)', fontSize: '16px' }}>No tickets yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '4px' }}>Create your first support ticket to get help.</p>
          <button onClick={() => setView('create')} style={{
            marginTop: '16px', padding: '10px 24px', borderRadius: '8px', background: 'var(--gradient-primary)',
            border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px',
          }}>
            <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Create Ticket
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tickets.map(ticket => {
            const st = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
            const pr = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.MEDIUM;
            const StIcon = st.icon;
            const msgCount = ticket.messages?.length || 0;
            return (
              <div key={ticket.id} onClick={() => openTicketDetail(ticket)} style={{
                padding: '18px 20px', borderRadius: '12px', background: 'var(--card-bg)',
                border: '1px solid var(--border)', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StIcon size={20} style={{ color: st.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-bold)' }}>#{ticket.ticketNumber}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, border: `1px solid ${pr.color}`, color: pr.color }}>{pr.label}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bold)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>
                    {CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category} • {formatShort(ticket.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {msgCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>
                      <MessageSquare size={13} /> {msgCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ===== CREATE VIEW =====
  if (view === 'create') return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button onClick={() => setView('list')} style={{
        display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
        color: 'var(--primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: 0,
      }}>
        <ChevronLeft size={16} /> Back to Tickets
      </button>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: 'var(--text-bold)', fontFamily: 'var(--heading)' }}>
          Create Support Ticket
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '24px' }}>Describe your issue and our team will get back to you.</p>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bold)', display: 'block', marginBottom: '6px' }}>Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} required style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
              border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)',
            }}>
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bold)', display: 'block', marginBottom: '6px' }}>Subject *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Brief summary of your issue" style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
              border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)', boxSizing: 'border-box',
            }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bold)', display: 'block', marginBottom: '6px' }}>Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} placeholder="Provide as much detail as possible about your issue..." style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', resize: 'vertical',
              border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)', fontFamily: 'var(--sans)', boxSizing: 'border-box',
            }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setView('list')} style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text-bold)', fontWeight: 600, cursor: 'pointer', fontSize: '13px',
            }}>Cancel</button>
            <button type="submit" disabled={creating} style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: 'var(--gradient-primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px',
              boxShadow: '0 4px 10px rgba(255,79,47,0.2)', opacity: creating ? 0.7 : 1,
            }}>
              {creating ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ===== DETAIL / CHAT VIEW =====
  if (view === 'detail' && selectedTicket) {
    const st = STATUS_MAP[selectedTicket.status] || STATUS_MAP.OPEN;
    const pr = PRIORITY_MAP[selectedTicket.priority] || PRIORITY_MAP.MEDIUM;
    const isClosed = selectedTicket.status === 'CLOSED' || selectedTicket.status === 'RESOLVED';
    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button onClick={() => { setView('list'); setSelectedTicket(null); }} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
          color: 'var(--primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', padding: 0,
        }}>
          <ChevronLeft size={16} /> Back to Tickets
        </button>

        {/* Ticket Header */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-bold)', fontFamily: 'var(--heading)' }}>#{selectedTicket.ticketNumber}</span>
            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: `1px solid ${pr.color}`, color: pr.color }}>{pr.label} Priority</span>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--text-bold)' }}>{selectedTicket.subject}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.5 }}>{selectedTicket.description}</p>
          <div style={{ fontSize: '11px', color: 'var(--text)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>📂 {CATEGORIES.find(c => c.value === selectedTicket.category)?.label || selectedTicket.category}</span>
            <span>📅 Created: {formatDate(selectedTicket.createdAt)}</span>
            {selectedTicket.resolvedAt && <span>✅ Resolved: {formatDate(selectedTicket.resolvedAt)}</span>}
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '14px', color: 'var(--text-bold)' }}>
            💬 Conversation ({selectedTicket.messages?.length || 0})
          </div>

          <div style={{ padding: '16px 20px', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg)' }}>
            {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text)', fontSize: '13px' }}>
                No messages yet. Send a message to start the conversation.
              </div>
            ) : selectedTicket.messages.map((msg, idx) => {
              const isUser = msg.senderRole === 'USER';
              return (
                <div key={msg.id || idx} style={{
                  display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '75%', padding: '12px 16px', borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isUser ? 'var(--gradient-primary)' : 'var(--card-bg)',
                    color: isUser ? '#fff' : 'var(--text-bold)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px', opacity: isUser ? 0.85 : 0.6 }}>
                      {msg.senderName} • {isUser ? 'You' : 'Support Team'}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.message}</div>
                    <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.6, textAlign: 'right' }}>
                      {formatDate(msg.sentAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          {!isClosed ? (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
                  border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-bold)',
                }}
              />
              <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} style={{
                padding: '10px 16px', borderRadius: '10px', border: 'none',
                background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px',
                opacity: (sending || !newMessage.trim()) ? 0.5 : 1,
              }}>
                <Send size={14} /> Send
              </button>
            </div>
          ) : (
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
              This ticket has been {selectedTicket.status.toLowerCase()}. You cannot send new messages.
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
