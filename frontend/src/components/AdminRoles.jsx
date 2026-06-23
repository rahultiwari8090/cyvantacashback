import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, Eye, Edit2, UserPlus, Trash2, Crown, Shield, Users, Headphones, PenTool } from 'lucide-react';
import { AdminTable, AdminModal, AdminFormInput, AdminFormSelect } from './AdminComponents';
import { apiAdminManagement } from '../services/api';

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', icon: Crown, color: '#f59e0b', description: 'Full access to everything, can manage other admins' },
  { value: 'ADMIN', label: 'Admin', icon: Shield, color: '#3b82f6', description: 'Full access except admin management & audit logs' },
  { value: 'CONTENT_MANAGER', label: 'Content Manager', icon: PenTool, color: '#8b5cf6', description: 'Manages products, categories, deals, stores, banners, SEO' },
  { value: 'AFFILIATE_MANAGER', label: 'Affiliate Manager', icon: Users, color: '#10b981', description: 'Manages users, conversions, referrals, commissions, network' },
  { value: 'SUPPORT_ADMIN', label: 'Support Admin', icon: Headphones, color: '#ef4444', description: 'View-only with edit access to users & withdrawals' },
];

const PERMISSION_LABELS = [
  { key: 'view', label: 'View' },
  { key: 'add', label: 'Add' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'export', label: 'Export' },
  { key: 'settings', label: 'Settings' },
  { key: 'manageAdmins', label: 'Manage Admins' },
];

const MODULE_LABELS = {
  'dashboard': 'Dashboard',
  'users': 'Users',
  'roles': 'Roles & Permissions',
  'products': 'Products',
  'withdrawals': 'Withdrawals',
  'click-logs': 'Click Logs',
  'conversions': 'Conversions',
  'referrals': 'Referrals',
  'shared-commissions': 'Shared Commissions',
  'categories': 'Categories',
  'deals': 'Deals',
  'stores': 'Stores',
  'banners': 'Banners',
  'affiliate-network': 'Affiliate Network',
  'seo': 'SEO',
  'settings': 'Settings',
  'activity-logs': 'Activity Logs',
  'login-history': 'Login History',
  'finance': 'Finance',
};

const ROLE_BADGE_COLORS = {
  'SUPER_ADMIN': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  'ADMIN': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  'CONTENT_MANAGER': { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' },
  'AFFILIATE_MANAGER': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  'SUPPORT_ADMIN': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
};

export default function AdminRoles({ users, setUsers, onEditUser, onAddNotification, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editRole, setEditRole] = useState('USER');
  const [editPermissions, setEditPermissions] = useState({
    view: false, add: false, edit: false, delete: false, export: false, settings: false, manageAdmins: false,
  });

  // Create admin form state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('ADMIN');
  const [creating, setCreating] = useState(false);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditRole(user.role || 'USER');
    setEditPermissions({
      view: !!user.permissions?.view,
      add: !!user.permissions?.add,
      edit: !!user.permissions?.edit,
      delete: !!user.permissions?.delete,
      export: !!user.permissions?.export,
      settings: !!user.permissions?.settings,
      manageAdmins: !!user.permissions?.manageAdmins,
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (isSuperAdmin) {
      try {
        const updatedUser = await apiAdminManagement.changeRole(selectedUser.id, editRole, currentUser.id);
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u)));
        onAddNotification(`Role updated to ${editRole} for ${selectedUser.name}.`, 'success');
      } catch (err) {
        console.error(err);
        onAddNotification('Failed to update role: ' + (err.message || 'Unknown error'), 'error');
      }
    } else {
      const updated = { role: editRole, permissions: editPermissions };
      onEditUser(selectedUser.id, updated);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updated } : u)));
      onAddNotification('Admin role and permissions updated.', 'success');
    }
    setIsEditModalOpen(false);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminName || !newAdminPassword || (!newAdminEmail && !newAdminPhone)) {
      onAddNotification('Please fill in all required fields.', 'error');
      return;
    }

    setCreating(true);
    try {
      const result = await apiAdminManagement.createAdmin({
        name: newAdminName,
        email: newAdminEmail || undefined,
        phone: newAdminPhone || undefined,
        password: newAdminPassword,
        role: newAdminRole,
      }, currentUser.id);

      // Refresh users list
      setUsers((prev) => [...prev, {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        permissions: result.permissions,
        status: 'active',
      }]);

      onAddNotification(`Admin "${result.name}" created with role ${result.role}!`, 'success');
      setIsCreateModalOpen(false);
      resetCreateForm();
    } catch (err) {
      console.error(err);
      onAddNotification('Failed to create admin: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPhone('');
    setNewAdminPassword('');
    setNewAdminRole('ADMIN');
  };

  // Only show admin users
  const adminUsers = users.filter((user) => {
    const role = user.role || 'USER';
    return role !== 'USER';
  });

  const filteredUsers = adminUsers.filter((user) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (user.name || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.role || '').toLowerCase().includes(q);
  });

  const getRoleBadge = (role) => {
    const colors = ROLE_BADGE_COLORS[role] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    const roleInfo = ROLE_OPTIONS.find(r => r.value === role);
    const Icon = roleInfo?.icon || Shield;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        whiteSpace: 'nowrap',
      }}>
        <Icon size={12} />
        {roleInfo?.label || role}
      </span>
    );
  };

  const headers = ['Admin', 'Email', 'Role', 'Status', 'Modules Access', 'Actions'];

  const renderRow = (user) => {
    const moduleCount = user.permissions?.allowedModules?.length || 0;
    const totalModules = Object.keys(MODULE_LABELS).length;
    return (
      <tr key={user.id} className="animate-fade">
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px', fontWeight: '700',
            }}>
              {(user.name || 'A').substring(0, 2).toUpperCase()}
            </div>
            <span style={{ fontWeight: '600' }}>{user.name}</span>
          </div>
        </td>
        <td style={{ fontSize: '13px', color: 'var(--text)' }}>{user.email}</td>
        <td>{getRoleBadge(user.role)}</td>
        <td>
          <span className={`status-badge ${user.status === 'active' ? 'active' : 'inactive'}`}>
            {user.status}
          </span>
        </td>
        <td>
          <span style={{
            fontSize: '12px',
            color: moduleCount === totalModules ? '#10b981' : 'var(--text)',
            fontWeight: '500',
          }}>
            {moduleCount === totalModules ? 'All Modules' : `${moduleCount} of ${totalModules}`}
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="admin-btn-icon" onClick={() => openEditModal(user)} title="Edit Role" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="admin-roles-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Admin Roles & Permissions</h2>
          <p>Manage admin roles, module access, and create new admin accounts</p>
        </div>
      </div>

      {/* Role Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {ROLE_OPTIONS.filter(r => r.value !== 'USER').map((role) => {
          const Icon = role.icon;
          const count = adminUsers.filter(u => u.role === role.value).length;
          return (
            <div key={role.value} style={{
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${role.color}22`,
              backgroundColor: `${role.color}08`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: `${role.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={role.color} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-bold)' }}>{role.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text)' }}>{count} user{count !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text)', lineHeight: '1.4' }}>{role.description}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div className="admin-search-input-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, email or role..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        {isSuperAdmin && (
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} />
            Add New Admin
          </button>
        )}
      </div>

      <AdminTable
        headers={headers}
        items={filteredUsers}
        currentPage={currentPage}
        itemsPerPage={6}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No admin accounts found."
      />

      {/* Edit Role Modal */}
      {selectedUser && (
        <AdminModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Role — ${selectedUser.name}`}
          footer={
            <>
              <button className="admin-btn admin-btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {isSuperAdmin ? 'Update Role' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AdminFormSelect
              label="Role"
              id="admin-role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              options={isSuperAdmin ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => r.value !== 'SUPER_ADMIN')}
            />

            {/* Show role description */}
            {editRole && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                color: 'var(--text)',
              }}>
                <strong style={{ color: 'var(--text-bold)' }}>Role Access:</strong>
                <p style={{ margin: '6px 0 0', lineHeight: '1.5' }}>
                  {ROLE_OPTIONS.find(r => r.value === editRole)?.description || 'Standard user role'}
                </p>
              </div>
            )}

            {!isSuperAdmin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {PERMISSION_LABELS.map((perm) => (
                  <label key={perm.key} className="admin-checkbox-card">
                    <input
                      type="checkbox"
                      checked={editPermissions[perm.key] || false}
                      onChange={(e) => setEditPermissions((prev) => ({ ...prev, [perm.key]: e.target.checked }))}
                    />
                    <span>{perm.label}</span>
                  </label>
                ))}
              </div>
            )}
          </form>
        </AdminModal>
      )}

      {/* Create Admin Modal */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); resetCreateForm(); }}
        title="Create New Admin Account"
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => { setIsCreateModalOpen(false); resetCreateForm(); }}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleCreateAdmin} disabled={creating}>
              {creating ? 'Creating...' : 'Create Admin'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AdminFormInput
            label="Full Name *"
            id="new-admin-name"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            placeholder="Enter admin name"
          />
          <AdminFormInput
            label="Email"
            id="new-admin-email"
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="admin@example.com"
          />
          <AdminFormInput
            label="Phone"
            id="new-admin-phone"
            value={newAdminPhone}
            onChange={(e) => setNewAdminPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
          />
          <AdminFormInput
            label="Password *"
            id="new-admin-password"
            type="password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            placeholder="Set a strong password"
          />
          <AdminFormSelect
            label="Admin Role *"
            id="new-admin-role"
            value={newAdminRole}
            onChange={(e) => setNewAdminRole(e.target.value)}
            options={ROLE_OPTIONS.filter(r => r.value !== 'USER')}
          />

          {/* Show what this role can access */}
          {newAdminRole && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-bold)', marginBottom: '8px' }}>
                This role will have access to:
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text)', lineHeight: '1.5' }}>
                {ROLE_OPTIONS.find(r => r.value === newAdminRole)?.description}
              </div>
            </div>
          )}
        </form>
      </AdminModal>
    </div>
  );
}
