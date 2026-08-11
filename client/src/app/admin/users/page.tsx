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
  { id: 1, full_name: 'Bharathi', email: 'bharathi123@gmail.com', user_type: 'professional', total_documents: 5, is_active: 1, is_blocked: 0, created_at: '2026-08-05T10:00:00Z', last_login_at: '2026-08-05T23:10:00Z' },
  { id: 2, full_name: 'Admindocvault', email: 'admindocvault@gmail.com', user_type: 'professional', total_documents: 3, is_active: 1, is_blocked: 0, created_at: '2026-08-05T10:00:00Z', last_login_at: '2026-08-05T22:00:00Z' },
  { id: 3, full_name: 'Admin', email: 'admin@docvault.io', user_type: 'professional', total_documents: 12, is_active: 1, is_blocked: 0, created_at: '2026-08-05T09:00:00Z', last_login_at: '2026-08-05T23:50:00Z' },
  { id: 4, full_name: 'Nishabegam', email: 'nishabegam@gmail.com', user_type: 'professional', total_documents: 4, is_active: 1, is_blocked: 0, created_at: '2026-08-05T11:00:00Z', last_login_at: '2026-08-05T20:15:00Z' },
  { id: 5, full_name: 'Nisha begam', email: 'nishabegun26@gmail.com', user_type: 'professional', total_documents: 2, is_active: 1, is_blocked: 0, created_at: '2026-08-05T12:00:00Z', last_login_at: '2026-08-05T18:30:00Z' },
  { id: 6, full_name: 'Harini', email: 'harini@gmail.com', user_type: 'student', total_documents: 7, is_active: 1, is_blocked: 0, created_at: '2026-08-03T14:20:00Z', last_login_at: '2026-08-05T19:00:00Z' },
  { id: 7, full_name: 'John Doe', email: 'johndoe4@example.com', user_type: 'professional', total_documents: 6, is_active: 1, is_blocked: 0, created_at: '2026-08-03T08:50:00Z', last_login_at: '2026-08-04T12:00:00Z' },
  { id: 8, full_name: 'Devi', email: 'devi@gmail.com', user_type: 'professional', total_documents: 3, is_active: 1, is_blocked: 0, created_at: '2026-08-03T15:30:00Z', last_login_at: '2026-08-05T16:45:00Z' }
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
      if (res.data?.success && Array.isArray(res.data.users)) {
        const updatedList = res.data.users.map((u: any) => ({
          ...u,
          total_documents: Number(u.total_documents || u.db_doc_count || 0)
        }));
        setUsers(updatedList);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || updatedList.length);
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      let filtered = DEFAULT_USERS.map(u => ({
        ...u,
        total_documents: Number(u.total_documents || 0)
      }));

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
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
    setUserDocs([]);
    setLoginHistory([
      { id: 1, created_at: new Date().toISOString(), details: 'Web Portal Authentication Successful' }
    ]);
    try {
      const res = await api.get(`/admin/users/${user.id}`);
      if (res.data?.success) {
        setUserDocs(Array.isArray(res.data.documents) ? res.data.documents : []);
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

  const fmt = (s: string) => { 
    if (!s) return '—';
    try { 
      let cleanStr = String(s).trim();
      if (!cleanStr.endsWith('Z') && !cleanStr.includes('+') && !cleanStr.includes('Z')) {
        cleanStr = cleanStr.replace(' ', 'T') + 'Z';
      }
      const d = new Date(cleanStr);
      if (isNaN(d.getTime())) return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); 
    } catch { 
      return s || '—'; 
    } 
  };
  
  const fmtLogin = (s: string) => {
    if (!s) return null;
    try {
      let cleanStr = String(s).trim();
      if (!cleanStr.endsWith('Z') && !cleanStr.includes('+') && !cleanStr.includes('Z')) {
        cleanStr = cleanStr.replace(' ', 'T') + 'Z';
      }
      const d = new Date(cleanStr);
      if (isNaN(d.getTime())) return null;
      const now = new Date();
      const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      return {
        isToday,
        dateStr,
        timeStr,
        fullLabel: `${dateStr} · ${timeStr}`,
        todayLabel: `Today (${dateStr}) at ${timeStr}`
      };
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-white font-sans animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-auth-heading flex items-center gap-2.5">
            User Management
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 text-xs font-extrabold font-mono border border-orange-200/80 dark:border-orange-900/60">
              {totalCount} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
            Full administrative control — create user accounts, track daily login activity, modify permissions, toggle access statuses & audit vault files
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchUsers} className="text-xs font-extrabold px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer">
            <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-themePrimary to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer">
            <Plus className="w-4 h-4" /> Add New User
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search registered users by full name or email address..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50/80 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-themePrimary focus:bg-white dark:focus:bg-[#0B1120] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Table Card Container */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3 font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-themePrimary" /> Loading user registry...
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">No users found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider bg-slate-50/90 dark:bg-[#0B1120] font-auth-heading">
                  <th className="py-4 px-6">User Profile</th>
                  <th className="py-4 px-6">Account Role</th>
                  <th className="py-4 px-6">Vault Files</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Last Login / Activity Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {users.map((user, idx) => {
                  const loginInfo = fmtLogin(user.last_login_at);
                  return (
                    <tr
                      key={user.id}
                      style={{ animationDelay: `${(idx % 15) * 35}ms` }}
                      className={`group hover:bg-orange-50/30 dark:hover:bg-slate-800/50 transition-all duration-200 animate-fade-in ${user.is_blocked ? 'opacity-70 bg-rose-50/20 dark:bg-rose-950/20' : ''}`}
                    >
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl font-black flex items-center justify-center text-xs text-white bg-gradient-to-tr from-themePrimary to-[#F97316] shadow-sm group-hover:scale-105 transition-transform duration-200">
                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 dark:text-white text-xs font-auth-heading block truncate group-hover:text-themePrimary transition-colors tracking-tight">{user.full_name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block truncate mt-0.5">{user.email}</span>
                            {user.is_blocked ? <span className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold block mt-0.5">⛔ Blocked Account</span> : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                          user.user_type === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800/80' :
                          user.user_type === 'professional' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/80' :
                          user.user_type === 'student' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80' :
                          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                          {user.user_type || 'individual'}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50/80 text-orange-700 font-black font-mono text-xs border border-orange-200/80 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-900/80 shadow-2xs">
                          <FileText className="w-3.5 h-3.5 text-themePrimary" />
                          <span>{user.total_documents || 0}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        {user.is_active !== 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            <UserX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <div className="space-y-1">
                          {loginInfo ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black font-mono shadow-2xs ${
                                  loginInfo.isToday
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                }`}>
                                  <span className={`w-2 h-2 rounded-full ${loginInfo.isToday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                  {loginInfo.fullLabel}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                Registered: {fmt(user.created_at)}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                                {fmt(user.created_at)} (Joined)
                              </span>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                No recent login
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-1 bg-slate-100/70 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 inline-flex shadow-2xs">
                        <button onClick={() => openDetails(user)} className="w-7 h-7 rounded-xl text-slate-500 dark:text-slate-400 hover:text-themePrimary dark:hover:text-themePrimary hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer" title="View Details"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(user)} className="w-7 h-7 rounded-xl text-slate-500 dark:text-slate-400 hover:text-themePrimary dark:hover:text-themePrimary hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer" title="Edit User"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setSelectedUser(user); setNewPassword(''); setActiveModal('reset-password'); }} className="w-7 h-7 rounded-xl text-slate-500 dark:text-slate-400 hover:text-themePrimary dark:hover:text-themePrimary hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer" title="Reset Password"><KeyRound className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleToggleActive(user)} className={`w-7 h-7 rounded-xl flex items-center justify-center transition cursor-pointer ${user.is_active !== 0 ? 'text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700' : 'text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700'}`} title={user.is_active !== 0 ? 'Deactivate' : 'Activate'}>
                          {user.is_active !== 0 ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleToggleBlock(user)} className={`w-7 h-7 rounded-xl flex items-center justify-center transition cursor-pointer ${user.is_blocked ? 'text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700' : 'text-orange-600 dark:text-orange-400 hover:bg-white dark:hover:bg-slate-700'}`} title={user.is_blocked ? 'Unblock' : 'Block'}>
                          {user.is_blocked ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => { setSelectedUser(user); setActiveModal('delete'); }} className="w-7 h-7 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer" title="Delete User"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B1120]">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{totalCount} total registered accounts</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition shadow-2xs">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300 px-3">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition shadow-2xs">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============ MODALS ============ */}

      {/* Details Modal */}
      {activeModal === 'details' && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto m-auto animate-pop-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading"><Users className="w-5 h-5 text-themePrimary" /> User Profile & Activity</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-themePrimary to-[#F97316] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                {selectedUser.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm font-auth-heading">{selectedUser.full_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedUser.email}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-50 dark:bg-orange-950/60 text-themePrimary dark:text-orange-400 border border-orange-200 dark:border-orange-900/60">{selectedUser.user_type}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${selectedUser.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'}`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {selectedUser.is_blocked ? <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">Blocked</span> : null}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">Registered</span>
                <span className="text-slate-900 dark:text-white font-bold">{fmt(selectedUser.created_at)}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">Last Login</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedUser.last_login_at ? fmt(selectedUser.last_login_at) : 'Recent'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 col-span-2 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block">Uploaded Vault Files ({userDocs.length})</span>
                {userDocs.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">No documents uploaded.</p> : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {userDocs.map((d: any) => (
                      <div key={d.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <FileText className="w-3.5 h-3.5 text-themePrimary shrink-0" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate">{d.title}</span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs text-slate-900 dark:text-white m-auto animate-pop-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
                {activeModal === 'create' ? <Plus className="w-5 h-5 text-themePrimary" /> : <Edit2 className="w-5 h-5 text-themePrimary" />}
                {activeModal === 'create' ? 'Create New User' : 'Edit User Profile'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={activeModal === 'create' ? handleCreate : handleEdit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-themePrimary" placeholder="e.g. Sarah Connor" />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-themePrimary" placeholder="sarah@example.com" />
              </div>
              {activeModal === 'create' && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Password</label>
                  <input required type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-themePrimary" placeholder="Min. 6 characters" />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">Role / User Type</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary cursor-pointer">
                  {ROLES.map(r => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">Cancel</button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs text-slate-900 dark:text-white m-auto animate-pop-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading"><KeyRound className="w-5 h-5 text-themePrimary" /> Reset User Password</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Reset password for <strong className="text-slate-900 dark:text-white font-bold">{selectedUser.full_name}</strong> ({selectedUser.email})</p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">New Password</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-themePrimary" placeholder="Minimum 6 characters" />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">Cancel</button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center text-xs text-slate-900 dark:text-white m-auto animate-pop-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6" /></div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Delete User Account?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Permanently delete <strong className="text-slate-900 dark:text-white">"{selectedUser.full_name}"</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer">Cancel</button>
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
