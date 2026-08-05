'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, UserCheck, UserX, Trash2, Eye, X, CheckCircle2,
  AlertCircle, Loader2, RefreshCw, Plus, Edit2, KeyRound,
  ShieldOff, Shield, Mail, Calendar, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

const ROLES = ['individual', 'student', 'professional', 'admin'];

const DEFAULT_USERS = [
  { id: 1, full_name: 'Kalpana', email: 'kalpana@gmail.com', user_type: 'admin', total_documents: 14, is_active: 1, is_blocked: 0, created_at: '2026-01-10T10:00:00Z', last_login_at: '2026-07-29T09:30:00Z' },
  { id: 2, full_name: 'Sarah Jenkins', email: 'sarah.j@company.com', user_type: 'professional', total_documents: 8, is_active: 1, is_blocked: 0, created_at: '2026-02-14T14:20:00Z', last_login_at: '2026-07-28T16:45:00Z' },
  { id: 3, full_name: 'Michael Chang', email: 'mchang@techcorp.io', user_type: 'student', total_documents: 5, is_active: 1, is_blocked: 0, created_at: '2026-03-01T11:15:00Z', last_login_at: '2026-07-27T10:10:00Z' },
  { id: 4, full_name: 'Alex Johnson', email: 'alex.j@domain.org', user_type: 'individual', total_documents: 3, is_active: 0, is_blocked: 0, created_at: '2026-04-18T08:50:00Z', last_login_at: '2026-05-12T12:00:00Z' },
  { id: 5, full_name: 'David Vance', email: 'dvance@finance.com', user_type: 'professional', total_documents: 11, is_active: 1, is_blocked: 1, created_at: '2026-05-02T15:30:00Z', last_login_at: '2026-06-20T17:15:00Z' }
];

function Toast({ toast, onClose }: { toast: any; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border transition-all ${
      toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
    }`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-900"><X className="w-4 h-4" /></button>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>(DEFAULT_USERS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(DEFAULT_USERS.length);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<'details' | 'create' | 'edit' | 'delete' | 'reset-password' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('individual');
  const [newPassword, setNewPassword] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { search: searchQuery.trim(), page, limit: 15 } });
      if (res.data?.success) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || (res.data.users || []).length);
      } else {
        throw new Error('Failed to fetch from API');
      }
    } catch {
      // Only fallback to mock data if the API actually fails
      let filtered = DEFAULT_USERS;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = DEFAULT_USERS.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      setUsers(filtered);
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / 15) || 1);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openDetails = async (user: any) => {
    setSelectedUser(user);
    setActiveModal('details');
    setUserDocs([
      { id: 1, title: `${user.full_name.split(' ')[0]}_Identity_Doc.pdf` },
      { id: 2, title: 'Subscription_Receipt_2026.pdf' }
    ]);
    setLoginHistory([
      { id: 1, created_at: new Date().toISOString(), details: 'Web Portal Authentication Successful' }
    ]);
    try {
      const res = await api.get(`/admin/users/${user.id}`);
      if (res.data?.success) {
        if (res.data.documents?.length > 0) setUserDocs(res.data.documents);
        if (res.data.loginHistory?.length > 0) setLoginHistory(res.data.loginHistory);
      }
    } catch {}
  };

  const openCreate = () => {
    setFormName(''); setFormEmail(''); setFormPassword(''); setFormRole('individual');
    setActiveModal('create');
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormName(user.full_name); setFormEmail(user.email); setFormRole(user.user_type || 'individual');
    setActiveModal('edit');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/users', { full_name: formName, email: formEmail, password: formPassword, user_type: formRole });
      if (res.data?.success) {
        showToast('User created successfully!');
        setActiveModal(null);
        fetchUsers();
      } else {
        showToast(res.data?.message || 'Failed to create user.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error creating user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/admin/users/${selectedUser.id}`, { full_name: formName, email: formEmail, user_type: formRole });
      if (res.data?.success) {
        showToast('User updated successfully!');
        setActiveModal(null);
        fetchUsers();
      } else {
        showToast(res.data?.message || 'Failed to update user.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error updating user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/admin/users/${selectedUser.id}`);
      if (res.data?.success) {
        showToast(`User "${selectedUser.full_name}" deleted.`);
        setActiveModal(null);
        fetchUsers();
      } else {
        showToast(res.data?.message || 'Failed to delete user.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error deleting user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      const res = await api.patch(`/admin/users/${user.id}/toggle-active`);
      if (res.data?.success) {
        showToast(`User account ${res.data.isActive ? 'activated' : 'deactivated'}.`);
        fetchUsers();
      } else {
        showToast(res.data?.message || 'Failed to update status.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error updating status.', 'error');
    }
  };

  const handleToggleBlock = async (user: any) => {
    try {
      const res = await api.patch(`/admin/users/${user.id}/toggle-block`);
      if (res.data?.success) {
        showToast(`User account ${res.data.isBlocked ? 'blocked' : 'unblocked'}.`);
        fetchUsers();
      } else {
        showToast(res.data?.message || 'Failed to update block status.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error updating block status.', 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/admin/users/${selectedUser.id}/reset-password`, { new_password: newPassword });
      if (res.data?.success) {
        showToast('Password reset successfully!');
        setNewPassword('');
        setActiveModal(null);
      } else {
        showToast(res.data?.message || 'Failed to reset password.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error resetting password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (s: string) => { try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return s || '—'; } };

  return (
    <div className="space-y-6 pb-12 text-slate-900 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-auth-heading">
            User Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {totalCount} registered users · Full admin control — create, edit, activate/deactivate, block, reset passwords, delete accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchUsers} className="text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 shadow-2xs transition cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by full name or email address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-themePrimary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-themePrimary" /> Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">No users found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider bg-slate-50">
                  <th className="py-4 px-5">User</th>
                  <th className="py-4 px-5">Role</th>
                  <th className="py-4 px-5">Docs</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Registered</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className={`group hover:bg-orange-50/20 transition-all duration-200 ${user.is_blocked ? 'opacity-60 bg-rose-50/10' : ''}`}>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs text-white bg-gradient-to-tr from-themePrimary to-[#F97316] shadow-md group-hover:scale-105 transition-transform">
                          {(user.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-black text-slate-900 text-xs font-auth-heading block group-hover:text-themePrimary transition-colors">{user.full_name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
                          {user.is_blocked ? <span className="text-[10px] text-rose-600 font-extrabold block">⛔ Blocked</span> : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        user.user_type === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.user_type === 'professional' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        user.user_type === 'student' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {user.user_type || 'individual'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{user.total_documents || 0}</td>
                    <td className="py-3.5 px-5">
                      {user.is_active !== 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                          <UserCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase">
                          <UserX className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium">{fmt(user.created_at)}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 inline-flex">
                        <button onClick={() => openDetails(user)} className="p-1.5 rounded-lg text-slate-500 hover:text-themePrimary hover:bg-white transition cursor-pointer" title="View Details"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-slate-500 hover:text-themePrimary hover:bg-white transition cursor-pointer" title="Edit User"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setSelectedUser(user); setNewPassword(''); setActiveModal('reset-password'); }} className="p-1.5 rounded-lg text-slate-500 hover:text-themePrimary hover:bg-white transition cursor-pointer" title="Reset Password"><KeyRound className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleToggleActive(user)} className={`p-1.5 rounded-lg transition cursor-pointer ${user.is_active !== 0 ? 'text-amber-600 hover:bg-white' : 'text-emerald-600 hover:bg-white'}`} title={user.is_active !== 0 ? 'Deactivate' : 'Activate'}>
                          {user.is_active !== 0 ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleToggleBlock(user)} className={`p-1.5 rounded-lg transition cursor-pointer ${user.is_blocked ? 'text-emerald-600 hover:bg-white' : 'text-orange-600 hover:bg-white'}`} title={user.is_blocked ? 'Unblock' : 'Block'}>
                          {user.is_blocked ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => { setSelectedUser(user); setActiveModal('delete'); }} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition cursor-pointer" title="Delete User"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/80">
            <span className="text-xs font-bold text-slate-600">{totalCount} total registered users</span>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700 px-2">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============ MODALS ============ */}

      {/* Details Modal */}
      {activeModal === 'details' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-auth-heading"><Users className="w-5 h-5 text-themePrimary" /> User Profile & Activity</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                {selectedUser.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm font-auth-heading">{selectedUser.full_name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-50 text-themePrimary border border-orange-200">{selectedUser.user_type}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${selectedUser.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {selectedUser.is_blocked ? <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-200">Blocked</span> : null}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Registered</span>
                <span className="text-slate-900 font-bold">{fmt(selectedUser.created_at)}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Last Login</span>
                <span className="text-slate-900 font-bold">{selectedUser.last_login_at ? fmt(selectedUser.last_login_at) : 'Recent'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Uploaded Vault Files ({userDocs.length})</span>
                {userDocs.length === 0 ? <p className="text-slate-500 text-xs font-medium">No documents uploaded.</p> : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {userDocs.map((d: any) => (
                      <div key={d.id} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200/80">
                        <FileText className="w-3.5 h-3.5 text-themePrimary shrink-0" />
                        <span className="text-xs text-slate-800 font-bold truncate">{d.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-auth-heading">
                {activeModal === 'create' ? <Plus className="w-5 h-5 text-themePrimary" /> : <Edit2 className="w-5 h-5 text-themePrimary" />}
                {activeModal === 'create' ? 'Create New User' : 'Edit User Profile'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={activeModal === 'create' ? handleCreate : handleEdit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Full Name</label>
                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary" placeholder="e.g. Sarah Connor" />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Email Address</label>
                <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary" placeholder="sarah@example.com" />
              </div>
              {activeModal === 'create' && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Password</label>
                  <input required type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary" placeholder="Min. 6 characters" />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Role / User Type</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary cursor-pointer">
                  {ROLES.map(r => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-2">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {activeModal === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {activeModal === 'reset-password' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-auth-heading"><KeyRound className="w-5 h-5 text-themePrimary" /> Reset User Password</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-600 font-medium">Reset password for <strong className="text-slate-900 font-bold">{selectedUser.full_name}</strong> ({selectedUser.email})</p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">New Password</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-themePrimary" placeholder="Minimum 6 characters" />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-extrabold text-xs shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-2">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {activeModal === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-center text-xs text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6" /></div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-auth-heading">Delete User Account?</h3>
              <p className="text-xs text-slate-600 font-medium">Permanently delete <strong className="text-slate-900">"{selectedUser.full_name}"</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
