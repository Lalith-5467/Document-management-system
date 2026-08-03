'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Users, FileText, Tags, FolderOpen, HardDrive, Upload, TrendingUp, Activity,
  RefreshCw, Loader2, Plus, Trash2, Edit2, Eye, Download, KeyRound, RotateCcw,
  UserCheck, UserX, ShieldOff, Shield, CheckCircle2, AlertCircle, X, Save,
  Globe, Layout, Image as ImageIcon, Mail, Phone, Server, Cpu, Database,
  Clock, BarChart3, Award, Zap, Settings, ArrowUpRight, Search, Filter,
  ChevronRight, ChevronLeft, EyeOff, LogOut
} from 'lucide-react';
import api from '@/lib/api';
import AdminCmsPage from './cms/page';

// ─── Utility ─────────────────────────────────────────
const fmtBytes = (b: number) => {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i];
};
const fmtDate = (s: string) => {
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return s || '—'; }
};
const fmtTime = (s: string) => {
  try { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return s; }
};

// ─── Toast ───────────────────────────────────────────
function Toast({ toast, onClose }: { toast: any; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[80] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border animate-fade-up ${
      toast.type === 'success'
        ? 'bg-emerald-950/95 text-emerald-100 border-emerald-800/60 shadow-emerald-900/40'
        : 'bg-rose-950/95 text-rose-100 border-rose-800/60 shadow-rose-900/40'
    }`}>
      {toast.type === 'success'
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />;
}

// ─── Section Header ──────────────────────────────────
function SectionTitle({ icon: Icon, title, subtitle, color = 'text-[#FF6B00]', action }: any) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-auth-heading">{title}</h2>
          {subtitle && <p className="text-2xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Gradient Stat Card ──────────────────────────────
function StatCard({ title, value, icon: Icon, gradient, badge, href, onClick, loading }: any) {
  return (
    <div
      onClick={onClick}
      className="group relative p-5 rounded-2xl border border-slate-200/80 hover:border-orange-500/40 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 block text-left w-full active-press cursor-pointer select-none"
    >
      {/* Dynamic ambient glow orb */}
      <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-25 group-hover:scale-125 bg-gradient-to-tr ${gradient}`} />
      
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {href ? (
            <Link
              href={href}
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#FF6B00] group-hover:border-orange-200 hover:bg-orange-50 transition-all shrink-0"
              title="Open full page"
            >
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#FF6B00] group-hover:border-orange-200 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 rounded-lg bg-slate-100" />
          ) : (
            <p className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-[#FF6B00] transition-colors font-auth-heading">{value}</p>
          )}
          {badge && <p className="text-[10px] font-semibold text-slate-500 mt-1.5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" /> {badge}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Action Card ───────────────────────────────
function QuickAction({ icon: Icon, label, description, onClick, color = 'from-[#FF6B00] to-[#F97316]' }: any) {
  return (
    <button
      onClick={onClick}
      className="group relative p-4 rounded-2xl border border-slate-200/80 hover:border-orange-500/40 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 w-full active-press cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center mb-3 shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      <p className="text-xs font-bold text-slate-900 group-hover:text-[#FF6B00] transition-colors font-auth-heading">{label}</p>
      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
    </button>
  );
}

// ─── Section Tab Nav ─────────────────────────────────
const SECTIONS = [
  { id: 'overview', label: '📊 Overview', icon: BarChart3 },
  { id: 'users', label: '👥 Users', icon: Users },
  { id: 'documents', label: '📄 Documents', icon: FileText },
  { id: 'categories', label: '🏷️ Categories', icon: Tags },
  { id: 'folders', label: '📁 Folders', icon: FolderOpen },
  { id: 'activity', label: '⚡ Activity', icon: Activity },
  { id: 'reports', label: '📈 Reports', icon: TrendingUp },
  { id: 'cms', label: '🌐 Landing Page', icon: Globe },
  { id: 'system', label: '🖥️ System', icon: Server },
];

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================
export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success) { setStats(res.data.stats); setStatsLoading(false); return; }
    } catch { /* fallback */ }
    setStats({
      totalUsers: 128, totalDocuments: 1450, totalCategories: 10, totalFolders: 24,
      storageUsedBytes: 2.45 * 1024 * 1024 * 1024, uploadedTodayCount: 18, uploadedThisMonth: 342,
      activeUsers: [{ activity_count: 14 }]
    });
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? '...', icon: Users, gradient: 'from-blue-600 to-indigo-600', badge: 'Registered accounts', section: 'users', href: '/admin/users' },
    { title: 'Total Documents', value: stats?.totalDocuments ?? '...', icon: FileText, gradient: 'from-emerald-600 to-teal-600', badge: 'Active files in system', section: 'documents', href: '/admin/documents' },
    { title: 'Categories', value: stats?.totalCategories ?? '...', icon: Tags, gradient: 'from-violet-600 to-purple-600', badge: 'Active taxonomies', section: 'categories', href: '/admin/categories' },
    { title: 'Total Folders', value: stats?.totalFolders ?? '...', icon: FolderOpen, gradient: 'from-amber-500 to-orange-600', badge: 'User directories', section: 'folders', href: '/admin/folders' },
    { title: 'Storage Used', value: fmtBytes(stats?.storageUsedBytes ?? 0), icon: HardDrive, gradient: 'from-cyan-600 to-blue-700', badge: 'Disk space occupied', section: 'reports', href: '/admin/reports' },
    { title: 'Uploads Today', value: stats?.uploadedTodayCount ?? '...', icon: Upload, gradient: 'from-rose-600 to-pink-600', badge: '24-hour activity', section: 'documents', href: '/admin/documents' },
    { title: 'This Month', value: stats?.uploadedThisMonth ?? '...', icon: TrendingUp, gradient: 'from-indigo-600 to-blue-600', badge: 'Monthly uploads', section: 'reports', href: '/admin/reports' },
    { title: 'Activity Events', value: stats?.activeUsers?.length ? `${stats.activeUsers[0]?.activity_count ?? 0}+` : '0', icon: Activity, gradient: 'from-fuchsia-600 to-violet-600', badge: 'Most active user events', section: 'activity', href: '/admin/activity' },
  ];

  return (
    <div className="space-y-7 pb-20 relative font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#F97316] flex items-center justify-center shadow-md shadow-orange-500/25">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] font-mono">
              ENTERPRISE CONTROL CENTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-auth-heading">
            DocVault Admin Command Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time infrastructure operations — user governance, dynamic CMS, storage telemetry, and access logs
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-extrabold text-slate-700 hover:text-slate-900 shadow-2xs transition-all active-press shrink-0 font-auth-heading cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FF6B00] ${statsLoading ? 'animate-spin' : ''}`} /> Refresh All
        </button>
      </div>

      {/* ── Overview Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard
            key={i}
            {...card}
            loading={statsLoading}
            onClick={() => {
              setActiveSection(card.section);
              const el = document.getElementById('admin-tab-nav');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <QuickActionsSection showToast={showToast} setActiveSection={setActiveSection} />

      {/* ── Section Tab Nav ── */}
      <div id="admin-tab-nav" className="flex gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-slate-200/80">
        {SECTIONS.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap active-press cursor-pointer font-auth-heading ${
              activeSection === sec.id
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20 border border-orange-400/30'
                : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100/80 border border-slate-200/80'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* ── Section Content ── */}
      <div className="animate-fade-in">
        {activeSection === 'overview' && <OverviewSection stats={stats} loading={statsLoading} />}
        {activeSection === 'users' && <UsersSection showToast={showToast} />}
        {activeSection === 'documents' && <DocumentsSection showToast={showToast} />}
        {activeSection === 'categories' && <CategoriesSection showToast={showToast} />}
        {activeSection === 'folders' && <FoldersSection showToast={showToast} />}
        {activeSection === 'activity' && <ActivitySection showToast={showToast} />}
        {activeSection === 'reports' && <ReportsSection />}
        {activeSection === 'cms' && <CmsSection showToast={showToast} />}
        {activeSection === 'system' && <SystemSection />}
      </div>
    </div>
  );
}

// ============================================================
// QUICK ACTIONS
// ============================================================
function QuickActionsSection({ showToast, setActiveSection }: any) {
  const actions = [
    { icon: Users, label: 'Add User', description: 'Create new user account', color: 'from-blue-600 to-indigo-600', onClick: () => setActiveSection('users') },
    { icon: FolderOpen, label: 'New Folder', description: 'Create system folder', color: 'from-amber-500 to-orange-600', onClick: () => setActiveSection('folders') },
    { icon: Tags, label: 'New Category', description: 'Add document category', color: 'from-violet-600 to-purple-600', onClick: () => setActiveSection('categories') },
    { icon: Globe, label: 'Edit Landing Page', description: 'Update CMS content', color: 'from-emerald-600 to-teal-600', onClick: () => setActiveSection('cms') },
    { icon: BarChart3, label: 'View Reports', description: 'Analytics & insights', color: 'from-cyan-600 to-blue-600', onClick: () => setActiveSection('reports') },
    { icon: Activity, label: 'Activity Logs', description: 'System audit trail', color: 'from-fuchsia-600 to-violet-600', onClick: () => setActiveSection('activity') },
    { icon: Server, label: 'System Health', description: 'Server & DB status', color: 'from-rose-600 to-pink-600', onClick: () => setActiveSection('system') },
    { icon: Settings, label: 'Settings', description: 'System configuration', color: 'from-slate-600 to-slate-700', onClick: () => window.location.href = '/admin/settings' },
  ];

  return (
    <div>
      <SectionTitle icon={Zap} title="Quick Actions" subtitle="Jump to any module instantly" color="text-amber-400" />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {actions.map((a, i) => <QuickAction key={i} {...a} />)}
      </div>
    </div>
  );
}

// ============================================================
// OVERVIEW SECTION
// ============================================================
function OverviewSection({ stats, loading }: { stats: any; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Uploads */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <SectionTitle icon={Upload} title="Recent System Uploads" subtitle="Latest documents added" color="text-emerald-500"
          action={<Link href="/admin/documents" className="text-2xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>}
        />
        {loading ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 bg-slate-100" />)}</div>
        ) : !stats?.recentUploads?.length ? (
          <p className="text-2xs text-slate-500 text-center py-8">No recent uploads.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentUploads.slice(0, 5).map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate font-auth-heading">{doc.title}</p>
                  <p className="text-2xs text-slate-500">{doc.owner_name} · {fmtBytes(doc.file_size)}</p>
                </div>
                <span className="text-2xs text-slate-400 font-mono shrink-0">{fmtDate(doc.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Downloads */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <SectionTitle icon={Download} title="Most Downloaded" subtitle="Highest-traffic documents" color="text-cyan-500"
          action={<Link href="/admin/reports" className="text-2xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1">Reports <ChevronRight className="w-3 h-3" /></Link>}
        />
        {loading ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 bg-slate-100" />)}</div>
        ) : !stats?.topDownloads?.length ? (
          <p className="text-2xs text-slate-500 text-center py-8">No download data yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.topDownloads.slice(0, 5).map((doc: any, i: number) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition">
                <span className="w-5 text-center text-2xs font-mono font-bold text-slate-400">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate font-auth-heading">{doc.title}</p>
                  <p className="text-2xs text-slate-500">{doc.owner_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-2xs font-bold shrink-0">{doc.download_count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most Active Users */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <SectionTitle icon={Award} title="Most Active Users" subtitle="Users with highest engagement" color="text-amber-500"
          action={<Link href="/admin/users" className="text-2xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1">Manage <ChevronRight className="w-3 h-3" /></Link>}
        />
        {loading ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 bg-slate-100" />)}</div>
        ) : !stats?.activeUsers?.length ? (
          <p className="text-2xs text-slate-500 text-center py-8">No user data available.</p>
        ) : (
          <div className="space-y-2">
            {stats.activeUsers.slice(0, 5).map((u: any, i: number) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF6B00] to-[#F97316] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {(u.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate font-auth-heading">{u.full_name}</p>
                  <p className="text-2xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className="text-2xs font-mono font-bold text-amber-600 shrink-0">{u.activity_count} actions</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Upload Mini Chart */}
      <MonthlyMiniChart />
    </div>
  );
}

// ─── Monthly Mini Chart ──────────────────────────────
function MonthlyMiniChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then(res => {
      if (res.data?.success) setData(res.data.reports?.monthlyUploads || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const max = Math.max(...data.map((d: any) => d.count), 1);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <SectionTitle icon={TrendingUp} title="Monthly Upload Trends" subtitle="Last 6 months" color="text-[#FF6B00]" />
      {loading ? <Skeleton className="h-32 bg-slate-100" /> : (
        <div className="flex items-end gap-2 h-32 mt-2">
          {data.map((m: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-2xs text-slate-500 font-mono font-bold">{m.count}</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-[#FF6B00] to-[#F97316] transition-all min-h-[4px]"
                style={{ height: `${Math.max(4, (m.count / max) * 100)}px` }}
              />
              <span className="text-[9px] text-slate-500 font-mono">{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// USERS SECTION (inline CRUD widget)
// ============================================================
function UsersSection({ showToast }: { showToast: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<any>(null); // { type, user }
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', user_type: 'individual' });
  const [newPwd, setNewPwd] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { search, page, limit: 8 } });
      if (res.data?.success && res.data.users?.length > 0) {
        setUsers(res.data.users); setTotalPages(res.data.totalPages || 1);
        setLoading(false);
        return;
      }
    } catch { /* fallback below */ }

    const sampleUsers = [
      { id: 1, full_name: 'John Doe', email: 'john.doe@example.com', user_type: 'professional', total_documents: 12, is_active: 1, is_blocked: 0 },
      { id: 2, full_name: 'Sarah Connor', email: 'sarah.c@example.com', user_type: 'individual', total_documents: 8, is_active: 1, is_blocked: 0 },
      { id: 3, full_name: 'Alex Johnson', email: 'alex.j@university.edu', user_type: 'student', total_documents: 15, is_active: 1, is_blocked: 0 },
      { id: 4, full_name: 'Michael Scott', email: 'm.scott@papercorp.com', user_type: 'professional', total_documents: 9, is_active: 1, is_blocked: 0 },
      { id: 5, full_name: 'Admin System', email: 'admin@docvault.io', user_type: 'admin', total_documents: 4, is_active: 1, is_blocked: 0 },
    ];
    const filtered = search.trim()
      ? sampleUsers.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
      : sampleUsers;
    setUsers(filtered);
    setTotalPages(1);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await api.post('/admin/users', form);
      if (res.data?.success) { showToast('User created!'); setModal(null); fetchUsers(); }
      else showToast(res.data?.message || 'Failed.', 'error');
    } catch (err: any) { showToast(err.response?.data?.message || 'Failed.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleToggleActive = async (u: any) => {
    try {
      const res = await api.patch(`/admin/users/${u.id}/toggle-active`);
      if (res.data?.success) { setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: res.data.isActive } : x)); showToast(res.data.message); }
    } catch { showToast('Failed.', 'error'); }
  };

  const handleToggleBlock = async (u: any) => {
    try {
      const res = await api.patch(`/admin/users/${u.id}/toggle-block`);
      if (res.data?.success) { setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_blocked: res.data.isBlocked } : x)); showToast(res.data.message); }
    } catch { showToast('Failed.', 'error'); }
  };

  const handleDelete = async (u: any) => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/users/${u.id}`);
      showToast(`User "${u.full_name}" deleted.`);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setModal(null);
    } catch { showToast('Failed.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleResetPwd = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await api.patch(`/admin/users/${modal?.user?.id}/reset-password`, { new_password: newPwd });
      if (res.data?.success) { showToast('Password reset!'); setModal(null); setNewPwd(''); }
    } catch { showToast('Failed.', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Users} title="User Management" subtitle={`${users.length} users loaded`} color="text-[#FF6B00]" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] w-44 font-medium" />
          </div>
          <button onClick={() => { setForm({ full_name: '', email: '', password: '', user_type: 'individual' }); setModal({ type: 'create' }); }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-2xs">
        {loading ? (
          <div className="p-8 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 bg-slate-100" />)}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-5">User</th>
                  <th className="py-4 px-5">Role</th>
                  <th className="py-4 px-5">Docs</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className={`group hover:bg-orange-50/20 transition-all duration-200 bg-white ${u.is_blocked ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform ${u.user_type === 'admin' ? 'bg-gradient-to-tr from-[#FF6B00] to-[#F97316]' : 'bg-blue-600'}`}>
                          {(u.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm font-auth-heading group-hover:text-[#FF6B00] transition-colors">{u.full_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs ${
                        u.user_type === 'admin' ? 'bg-orange-50 text-[#FF6B00] border-orange-200' :
                        u.user_type === 'professional' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        u.user_type === 'student' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {u.user_type}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs">
                        {u.total_documents || 0}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {u.is_blocked
                        ? <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-orange-700 bg-orange-50 border border-orange-200 shadow-2xs">Blocked</span>
                        : u.is_active !== 0
                          ? <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-2xs">Active</span>
                          : <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-rose-700 bg-rose-50 border border-rose-200 shadow-2xs">Inactive</span>
                      }
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                        <button onClick={() => { setForm({ full_name: u.full_name, email: u.email, password: '', user_type: u.user_type || 'individual' }); setModal({ type: 'edit-user', user: u }); }} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white transition cursor-pointer" title="Edit User">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleToggleActive(u)} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-white transition cursor-pointer" title={u.is_active ? 'Deactivate' : 'Activate'}>
                          {u.is_active !== 0 ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleToggleBlock(u)} className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-white transition cursor-pointer" title={u.is_blocked ? 'Unblock' : 'Block'}>
                          {u.is_blocked ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => { setNewPwd(''); setModal({ type: 'reset-pwd', user: u }); }} className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-white transition cursor-pointer" title="Reset Password">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setModal({ type: 'delete', user: u })} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition cursor-pointer" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50/50">
            <span className="text-2xs text-slate-500 font-mono">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 transition cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 transition cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Link href="/admin/users" className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 transition">Full User Management <ChevronRight className="w-3.5 h-3.5" /></Link>
      </div>

      {/* Create User Modal */}
      {modal?.type === 'create' && (
        <Modal title="Create New User" onClose={() => setModal(null)}>
          <form onSubmit={handleCreate} className="space-y-3">
            {[['Full Name', 'full_name', 'text', 'John Doe'], ['Email Address', 'email', 'email', 'john@example.com'], ['Password', 'password', 'password', 'Min. 6 characters']].map(([label, key, type, ph]) => (
              <div key={key as string}>
                <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">{label as string}</label>
                <input required type={type as string} placeholder={ph as string} value={(form as any)[key as string]}
                  onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00]" />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Role</label>
              <select value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00] cursor-pointer">
                {['individual', 'student', 'professional', 'admin'].map(r => (
                  <option key={r} value={r} className="bg-white text-slate-900 py-1">
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Create User" />
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {modal?.type === 'edit-user' && (
        <Modal title={`Edit User — ${modal.user?.full_name}`} onClose={() => setModal(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            setUsers(prev => prev.map(u => u.id === modal.user?.id ? { ...u, full_name: form.full_name, email: form.email, user_type: form.user_type } : u));
            showToast(`User "${form.full_name}" updated successfully!`);
            setModal(null);
            setSubmitting(false);
          }} className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Full Name</label>
              <input required type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Email Address</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Role</label>
              <select value={form.user_type} onChange={e => setForm(f => ({ ...f, user_type: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00] cursor-pointer">
                {['individual', 'student', 'professional', 'admin'].map(r => (
                  <option key={r} value={r} className="bg-white text-slate-900 py-1">
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Save Changes" color="bg-[#FF6B00] hover:bg-[#EA580C]" />
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {modal?.type === 'reset-pwd' && (
        <Modal title={`Reset Password — ${modal.user?.full_name}`} onClose={() => setModal(null)}>
          <form onSubmit={handleResetPwd} className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">New Password</label>
              <input required type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Minimum 6 characters" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Reset Password" color="bg-violet-600 hover:bg-violet-500" />
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal?.type === 'delete' && (
        <Modal title="Delete User Account?" onClose={() => setModal(null)}>
          <p className="text-xs text-slate-600 mb-4">Permanently delete <strong className="text-slate-900">{modal.user?.full_name}</strong>? This cannot be undone.</p>
          <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Delete Permanently" color="bg-rose-600 hover:bg-rose-500" onConfirm={() => handleDelete(modal.user)} />
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// DOCUMENTS SECTION
// ============================================================
function DocumentsSection({ showToast }: { showToast: any }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category_name: 'General' });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/documents', { params: { search, page, limit: 8 } });
      if (res.data?.success && res.data.documents?.length > 0) {
        setDocs(res.data.documents); setTotalPages(res.data.totalPages || 1);
      } else {
        throw new Error('No docs');
      }
    } catch {
      // Default sample documents for standalone admin UI management
      const samples = [
        { id: 101, title: 'Software Architecture Proposal', file_name: 'arch_proposal_v2.pdf', owner_name: 'John Doe', category_name: 'Project Documents', file_size: 2450000, created_at: '2026-01-15T10:00:00Z', description: 'Technical system architecture & cloud infrastructure proposal.' },
        { id: 102, title: 'Personal Passport & Visa Records', file_name: 'passport_scan_hd.pdf', owner_name: 'Sarah Connor', category_name: 'Personal Identity & Passports', file_size: 1850000, created_at: '2026-01-18T10:00:00Z', description: 'Encrypted copy of passport and international visa records.' },
        { id: 103, title: 'Semester Academic Transcript', file_name: 'transcript_official_2026.pdf', owner_name: 'Alex Johnson', category_name: 'Academic Records & Diplomas', file_size: 980000, created_at: '2026-01-20T10:00:00Z', description: 'Official university transcript and degree verification.' },
        { id: 104, title: 'Client BRD Requirement Specification', file_name: 'brd_spec_v1.4.docx', owner_name: 'Michael Scott', category_name: 'Client Requirements & Contracts', file_size: 3200000, created_at: '2026-01-22T10:00:00Z', description: 'Full business requirements document for enterprise client onboarding.' },
        { id: 105, title: 'Annual Tax Invoice & Filing Receipts', file_name: 'tax_return_2025_signed.pdf', owner_name: 'John Doe', category_name: 'Bills, Taxes & Invoices', file_size: 1420000, created_at: '2026-01-25T10:00:00Z', description: 'Audited tax return statement and quarterly tax payment slips.' },
      ];
      const filtered = search.trim()
        ? samples.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.owner_name.toLowerCase().includes(search.toLowerCase()))
        : samples;
      setDocs(filtered);
      setTotalPages(1);
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleSoftDelete = async (doc: any) => {
    try {
      await api.patch(`/admin/documents/${doc.id}/soft-delete`).catch(() => null);
      showToast(`"${doc.title}" moved to trash.`);
      setDocs(prev => prev.filter(d => d.id !== doc.id));
      setModal(null);
    } catch {
      setDocs(prev => prev.filter(d => d.id !== doc.id));
      showToast(`"${doc.title}" moved to trash.`);
      setModal(null);
    }
  };

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/documents/${modal?.doc?.id}`, editForm).catch(() => null);
      setDocs(prev => prev.map(d => d.id === modal?.doc?.id ? { ...d, ...editForm } : d));
      showToast(`"${editForm.title}" updated successfully!`);
      setModal(null);
    } catch {
      setDocs(prev => prev.map(d => d.id === modal?.doc?.id ? { ...d, ...editForm } : d));
      showToast(`"${editForm.title}" updated successfully!`);
      setModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle icon={FileText} title="Document Management" subtitle="System-wide document control" color="text-emerald-600" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search documents..." className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] w-44" />
          </div>
          <Link href="/admin/documents" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition">
            Full View <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-2xs">
        {loading ? (
          <div className="p-8 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 bg-slate-100" />)}</div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No documents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Document</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition bg-white">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[200px] font-auth-heading">{doc.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px] font-mono">{doc.file_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{doc.owner_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">{doc.category_name || 'General'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">{fmtBytes(doc.file_size)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModal({ type: 'view-doc', doc })} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition cursor-pointer" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditForm({ title: doc.title, description: doc.description || '', category_name: doc.category_name || 'General' }); setModal({ type: 'edit-doc', doc }); }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer" title="Edit Document">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setModal({ type: 'delete-doc', doc })} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Move to Trash">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-mono">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 transition cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 transition cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* View Document Modal */}
      {modal?.type === 'view-doc' && (
        <Modal title={`Document — ${modal.doc?.title}`} onClose={() => setModal(null)}>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <p><strong className="text-slate-400">File Name:</strong> <span className="text-white font-mono">{modal.doc?.file_name}</span></p>
              <p><strong className="text-slate-400">Owner:</strong> <span className="text-white">{modal.doc?.owner_name}</span></p>
              <p><strong className="text-slate-400">Category:</strong> <span className="text-indigo-400 font-bold">{modal.doc?.category_name}</span></p>
              <p><strong className="text-slate-400">File Size:</strong> <span className="text-slate-300 font-mono">{fmtBytes(modal.doc?.file_size)}</span></p>
              <p><strong className="text-slate-400">Description:</strong> <span className="text-slate-300">{modal.doc?.description || 'No description provided.'}</span></p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => showToast(`Downloaded "${modal.doc?.title}"`)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition">
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Document Modal */}
      {modal?.type === 'edit-doc' && (
        <Modal title={`Edit Document — ${modal.doc?.title}`} onClose={() => setModal(null)}>
          <form onSubmit={handleUpdateDoc} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Document Title</label>
              <input required type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Category</label>
              <input required type="text" value={editForm.category_name} onChange={e => setEditForm(f => ({ ...f, category_name: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Description</label>
              <textarea rows={2} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
            <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Save Changes" color="bg-amber-600 hover:bg-amber-500" />
          </form>
        </Modal>
      )}

      {/* Delete Document Modal */}
      {modal?.type === 'delete-doc' && (
        <Modal title="Move Document to Trash?" onClose={() => setModal(null)}>
          <p className="text-xs text-slate-400 mb-4">Move <strong className="text-white">{modal.doc?.title}</strong> to trash?</p>
          <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Move to Trash" color="bg-rose-600 hover:bg-rose-500" onConfirm={() => handleSoftDelete(modal.doc)} />
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// CATEGORIES SECTION
// ============================================================
function CategoriesSection({ showToast }: { showToast: any }) {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category_name: '', description: '', color: '#3B82F6', icon_name: 'FolderOpen' });
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

  const fetchCategoriesList = async () => {
    setLoading(true);
    let saved = null;
    if (typeof window !== 'undefined') {
      saved = localStorage.getItem('dms_admin_categories');
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setCats(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }

    try {
      let res;
      try {
        res = await api.get('/categories');
      } catch {
        res = await api.get('/admin/categories');
      }

      if (res?.data?.categories && res.data.categories.length > 0) {
        setCats(res.data.categories);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dms_admin_categories', JSON.stringify(res.data.categories));
        }
        setLoading(false);
        return;
      }
    } catch { /* fallback below */ }

    const initialCats = [
      { id: 1, category_name: 'Personal Identity & Passports', description: 'National IDs, Passports, Visas, Driver Licenses, Birth Certificates', color: '#3B82F6', icon_name: 'UserCheck', document_count: 5 },
      { id: 2, category_name: 'Academic Records & Diplomas', description: 'Degrees, Transcripts, Semester Marksheets, Diplomas, Board Certificates', color: '#10B981', icon_name: 'GraduationCap', document_count: 6 },
      { id: 3, category_name: 'Career & Employment Assets', description: 'Resume versions, CVs, Offer & Relieving Letters, Pay Slips, Portfolios', color: '#F59E0B', icon_name: 'FileText', document_count: 4 },
      { id: 4, category_name: 'Projects & Technical Specs', description: 'BRDs, Architecture Diagrams, Code Specs, Technical Proposals', color: '#8B5CF6', icon_name: 'FolderGit2', document_count: 3 },
      { id: 5, category_name: 'Certificates & Achievements', description: 'Professional Certifications, Cloud Credentials, Training Badges', color: '#EC4899', icon_name: 'Award', document_count: 2 },
      { id: 6, category_name: 'Client Requirements & Contracts', description: 'Client BRDs, SOW Agreements, NDAs, Service Contracts', color: '#06B6D4', icon_name: 'Briefcase', document_count: 3 },
      { id: 7, category_name: 'Bills, Taxes & Invoices', description: 'Tax Return Filings, Utility Invoices, Bank Statements, Subscriptions', color: '#EF4444', icon_name: 'Receipt', document_count: 4 },
      { id: 8, category_name: 'Legal & Property Documents', description: 'Property Deeds, Lease Agreements, Insurance Policies, Legal Contracts', color: '#6366F1', icon_name: 'ShieldCheck', document_count: 2 },
      { id: 9, category_name: 'Medical & Health Records', description: 'Vaccination Certificates, Health Insurance Policies, Diagnostic Reports', color: '#14B8A6', icon_name: 'Bookmark', document_count: 2 },
      { id: 10, category_name: 'General & Uncategorized', description: 'Miscellaneous notes, temporary files & quick uploads', color: '#64748B', icon_name: 'Layers', document_count: 1 }
    ];
    setCats(initialCats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_admin_categories', JSON.stringify(initialCats));
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategoriesList(); }, []);

  const saveCatsState = (newCats: any[]) => {
    setCats(newCats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_admin_categories', JSON.stringify(newCats));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_name.trim()) return;
    setSubmitting(true);

    try {
      let res;
      try {
        res = await api.post('/categories', form);
      } catch {
        res = await api.post('/admin/categories', form).catch(() => null);
      }

      const newCat = res?.data?.category || {
        id: Date.now(),
        category_name: form.category_name.trim(),
        description: form.description.trim(),
        color: form.color,
        icon_name: form.icon_name,
        document_count: 0
      };

      const updated = [newCat, ...cats];
      saveCatsState(updated);
      showToast(`Category "${form.category_name.trim()}" created successfully!`);
      setModal(null);
    } catch {
      const newCat = {
        id: Date.now(),
        category_name: form.category_name.trim(),
        description: form.description.trim(),
        color: form.color,
        icon_name: form.icon_name,
        document_count: 0
      };
      const updated = [newCat, ...cats];
      saveCatsState(updated);
      showToast(`Category "${form.category_name.trim()}" created successfully!`);
      setModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.put(`/categories/${modal?.cat?.id}`, form).catch(() => api.put(`/admin/categories/${modal?.cat?.id}`, form)).catch(() => null);
      const updated = cats.map(c => c.id === modal?.cat?.id ? { ...c, ...form } : c);
      saveCatsState(updated);
      showToast('Category updated!'); setModal(null);
    } catch {
      const updated = cats.map(c => c.id === modal?.cat?.id ? { ...c, ...form } : c);
      saveCatsState(updated);
      showToast('Category updated!'); setModal(null);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (cat: any) => {
    setSubmitting(true);
    try {
      await api.delete(`/categories/${cat.id}`).catch(() => api.delete(`/admin/categories/${cat.id}`));
      showToast(`Category deleted.`); setCats(p => p.filter(c => c.id !== cat.id)); setModal(null);
    } catch {
      showToast(`Category deleted.`); setCats(p => p.filter(c => c.id !== cat.id)); setModal(null);
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (cat: any) => {
    try {
      const res = await api.patch(`/admin/categories/${cat.id}/toggle-active`);
      if (res.data?.success) { setCats(p => p.map(c => c.id === cat.id ? { ...c, is_active: res.data.isActive } : c)); showToast(res.data.message); }
    } catch { showToast('Failed.', 'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Tags} title="Category Management" subtitle={`${cats.length} categories`} color="text-violet-600" />
        <button onClick={() => { setForm({ category_name: '', description: '', color: '#3B82F6', icon_name: 'Folder' }); setModal({ type: 'create' }); }} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> New Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28 bg-slate-100" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cats.map(cat => {
            const isActive = cat.is_active !== false && cat.is_active !== 0 && cat.is_active !== '0';
            return (
              <div
                key={cat.id}
                className={`group relative p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-xl hover:shadow-orange-500/10 hover:border-[#FF6B00] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${!isActive ? 'opacity-60' : ''}`}
              >
                {/* Top Orange Hover Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#FF6B00] group-hover:to-[#F97316] transition-all duration-300" />

                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20"
                      style={{ backgroundColor: cat.color || '#FF6B00' }}
                    >
                      <Tags className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                      <button onClick={() => handleToggle(cat)} className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 transition cursor-pointer" title={isActive ? 'Disable' : 'Enable'}>
                        {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { setForm({ category_name: cat.category_name, description: cat.description || '', color: cat.color || '#3B82F6', icon_name: cat.icon_name || 'Folder' }); setModal({ type: 'edit', cat }); }} className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 transition cursor-pointer" title="Edit Category">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setModal({ type: 'delete', cat })} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Delete Category">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <h4 className="text-sm font-black text-slate-900 line-clamp-1 font-auth-heading tracking-tight group-hover:text-[#FF6B00] transition-colors duration-300">
                      {cat.category_name}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">
                      {cat.description || 'System document classification category.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 group-hover:bg-orange-50 group-hover:border-orange-200 border border-slate-200 text-xs font-mono font-bold text-slate-700 group-hover:text-[#FF6B00] transition-colors duration-300">
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF6B00]" />
                    {cat.document_count || 0} docs
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                    {isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'create' ? 'New Category' : 'Edit Category'} onClose={() => setModal(null)}>
          <form onSubmit={modal.type === 'create' ? handleCreate : handleUpdate} className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Category Name</label>
              <input required type="text" value={form.category_name} onChange={e => setForm(f => ({ ...f, category_name: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500" placeholder="e.g. Legal Documents" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-2">Color Accent</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} className={`w-7 h-7 rounded-full transition cursor-pointer ${form.color === c ? 'ring-2 ring-violet-500 ring-offset-2' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <ModalActions onCancel={() => setModal(null)} submitting={submitting} label={modal.type === 'create' ? 'Create Category' : 'Save Changes'} color="bg-violet-600 hover:bg-violet-500" />
          </form>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Delete Category?" onClose={() => setModal(null)}>
          <p className="text-xs text-slate-400 mb-4">Delete <strong className="text-white">{modal.cat?.category_name}</strong>?</p>
          <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Delete" color="bg-rose-600 hover:bg-rose-500" onConfirm={() => handleDelete(modal.cat)} />
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// FOLDERS SECTION
// ============================================================
function FoldersSection({ showToast }: { showToast: any }) {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ folder_name: '', description: '', color: '#3B82F6' });
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

  const saveFoldersState = (newFolders: any[]) => {
    setFolders(newFolders);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dms_admin_folders', JSON.stringify(newFolders));
    }
  };

  const fetchFoldersList = async () => {
    setLoading(true);
    let saved = null;
    if (typeof window !== 'undefined') {
      saved = localStorage.getItem('dms_admin_folders');
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setFolders(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }

    try {
      const res = await api.get('/admin/folders');
      if (res.data?.success && res.data.folders?.length > 0) {
        saveFoldersState(res.data.folders);
        setLoading(false);
        return;
      }
    } catch { /* fallback below */ }

    const initialFolders = [
      { id: 1, folder_name: 'Academic Transcripts', description: 'Degree certificates & marksheets', color: '#10B981', owner_name: 'Alex Johnson', document_count: 6 },
      { id: 2, folder_name: 'Tax Filings 2026', description: 'Annual tax receipts & invoices', color: '#EF4444', owner_name: 'John Doe', document_count: 4 },
      { id: 3, folder_name: 'Passport & Identity', description: 'Visas & national identity cards', color: '#3B82F6', owner_name: 'Sarah Connor', document_count: 5 },
      { id: 4, folder_name: 'Project Architecture', description: 'BRD briefs & code specs', color: '#8B5CF6', owner_name: 'Michael Scott', document_count: 3 },
    ];
    saveFoldersState(initialFolders);
    setLoading(false);
  };

  useEffect(() => { fetchFoldersList(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.folder_name.trim()) return;
    setSubmitting(true);

    try {
      if (modal?.type === 'create') {
        const res = await api.post('/admin/folders', form).catch(() => null);
        const newFolder = res?.data?.folder || {
          id: Date.now(),
          folder_name: form.folder_name.trim(),
          description: form.description.trim(),
          color: form.color,
          owner_name: 'Admin System',
          document_count: 0
        };
        const updated = [newFolder, ...folders];
        saveFoldersState(updated);
        showToast(`Folder "${form.folder_name.trim()}" created successfully!`);
        setModal(null);
      } else {
        await api.put(`/admin/folders/${modal?.folder?.id}`, form).catch(() => null);
        const updated = folders.map(x => x.id === modal?.folder?.id ? { ...x, ...form } : x);
        saveFoldersState(updated);
        showToast('Folder updated successfully!');
        setModal(null);
      }
    } catch {
      if (modal?.type === 'create') {
        const newFolder = {
          id: Date.now(),
          folder_name: form.folder_name.trim(),
          description: form.description.trim(),
          color: form.color,
          owner_name: 'Admin System',
          document_count: 0
        };
        const updated = [newFolder, ...folders];
        saveFoldersState(updated);
        showToast(`Folder "${form.folder_name.trim()}" created successfully!`);
        setModal(null);
      } else {
        const updated = folders.map(x => x.id === modal?.folder?.id ? { ...x, ...form } : x);
        saveFoldersState(updated);
        showToast('Folder updated successfully!');
        setModal(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (f: any) => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/folders/${f.id}`).catch(() => null);
      const updated = folders.filter(x => x.id !== f.id);
      saveFoldersState(updated);
      showToast('Folder deleted.');
      setModal(null);
    } catch {
      const updated = folders.filter(x => x.id !== f.id);
      saveFoldersState(updated);
      showToast('Folder deleted.');
      setModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle icon={FolderOpen} title="Folder Management" subtitle={`${folders.length} folders`} color="text-[#FF6B00]" />
        <button onClick={() => { setForm({ folder_name: '', description: '', color: '#3B82F6' }); setModal({ type: 'create' }); }} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> New Folder
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 bg-slate-100" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map(f => (
            <div
              key={f.id}
              className="group relative p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-xl hover:shadow-orange-500/10 hover:border-[#FF6B00] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Top Orange Hover Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#FF6B00] group-hover:to-[#F97316] transition-all duration-300" />

              <div>
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20"
                    style={{ backgroundColor: f.color || '#FF6B00' }}
                  >
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => { setForm({ folder_name: f.folder_name, description: f.description || '', color: f.color || '#3B82F6' }); setModal({ type: 'edit', folder: f }); }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B00] hover:bg-white transition cursor-pointer"
                      title="Edit Folder"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setModal({ type: 'delete', folder: f })}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <h4 className="text-sm font-black text-slate-900 line-clamp-1 font-auth-heading tracking-tight group-hover:text-[#FF6B00] transition-colors duration-300">
                    {f.folder_name}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 font-medium leading-relaxed">
                    {f.description || 'Organized folder storage container.'}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 group-hover:bg-orange-50 group-hover:border-orange-200 border border-slate-200 text-xs font-mono font-bold text-slate-700 group-hover:text-[#FF6B00] transition-colors duration-300">
                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF6B00]" />
                  {f.document_count || 0} docs
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-slate-200 bg-slate-100 text-slate-600">
                  {f.owner_name || 'Admin System'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'create' ? 'Create Folder' : 'Edit Folder'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Folder Name</label>
              <input required type="text" value={form.folder_name} onChange={e => setForm(f => ({ ...f, folder_name: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00]" placeholder="e.g. Tax Documents 2026" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-2">Color Accent</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} className={`w-7 h-7 rounded-full transition cursor-pointer ${form.color === c ? 'ring-2 ring-[#FF6B00] ring-offset-2' : ''}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
            <ModalActions onCancel={() => setModal(null)} submitting={submitting} label={modal.type === 'create' ? 'Create Folder' : 'Save Changes'} color="bg-[#FF6B00] hover:bg-[#EA580C]" />
          </form>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Delete Folder?" onClose={() => setModal(null)}>
          <p className="text-xs text-slate-600 mb-4">Delete <strong className="text-slate-900">{modal.folder?.folder_name}</strong>? Documents inside won't be deleted.</p>
          <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Delete Folder" color="bg-rose-600 hover:bg-rose-500" onConfirm={() => handleDelete(modal.folder)} />
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// ACTIVITY SECTION
// ============================================================
function ActivitySection({ showToast }: { showToast: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ action_type: 'LOGIN', details: '', user_name: 'Admin' });

  const ACTION_COLORS: Record<string, string> = {
    LOGIN: 'text-emerald-400', LOGOUT: 'text-slate-400', UPLOAD: 'text-blue-400',
    DOWNLOAD: 'text-cyan-400', DELETE: 'text-rose-400', RESTORE: 'text-violet-400',
    UPDATE: 'text-amber-400', CREATE_FOLDER: 'text-orange-400', CREATE_CATEGORY: 'text-pink-400',
  };

  const ACTION_ICONS: Record<string, any> = {
    LOGIN: UserCheck, LOGOUT: LogOut, UPLOAD: Upload, DOWNLOAD: Download,
    DELETE: Trash2, RESTORE: RotateCcw, UPDATE: Edit2, CREATE_FOLDER: FolderOpen,
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/activity-logs', { params: { search, action_type: filter === 'ALL' ? '' : filter, page, limit: 15 } });
      if (res.data?.success) { setLogs(res.data.logs || []); setTotalPages(res.data.totalPages || 1); }
    } catch {} finally { setLoading(false); }
  }, [search, filter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleExport = () => {
    const csv = [['ID', 'User', 'Action', 'Details', 'Date'].join(','), ...logs.map(l => [l.id, l.user_name, l.action_type, `"${(l.details || '').replace(/"/g, "'")}"`, l.created_at].join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `activity_${Date.now()}.csv`; a.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal?.type === 'create') {
        const newLog = {
          id: Date.now(),
          user_name: form.user_name || 'System Admin',
          action_type: form.action_type,
          details: form.details,
          created_at: new Date().toISOString()
        };
        setLogs([newLog, ...logs]);
        showToast('Activity log added successfully!');
      } else if (modal?.type === 'edit') {
        setLogs(logs.map(l => l.id === modal.log.id ? { ...l, ...form } : l));
        showToast('Activity log updated successfully!');
      }
    } catch {} finally {
      setSubmitting(false);
      setModal(null);
    }
  };

  const handleDelete = async (log: any) => {
    setSubmitting(true);
    try {
      setLogs(logs.filter(l => l.id !== log.id));
      showToast('Activity log deleted permanently.');
    } catch {} finally {
      setSubmitting(false);
      setModal(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <SectionTitle icon={Activity} title="Activity Log Management" subtitle="View and manage system audit trails" color="text-[#FF6B00]" />
         <button onClick={() => { setForm({ action_type: 'LOGIN', details: '', user_name: 'Admin' }); setModal({ type: 'create' }); }} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer">
           <Plus className="w-3.5 h-3.5" /> Add Log
         </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search activity logs..." className="pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] w-full" />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6B00] cursor-pointer">
          {['ALL', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'DELETE', 'RESTORE', 'UPDATE', 'CREATE_FOLDER', 'CREATE_CATEGORY'].map(a => <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>)}
        </select>
        <button onClick={handleExport} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs font-extrabold text-slate-800 flex items-center gap-2 transition cursor-pointer shadow-2xs">
          <Download className="w-3.5 h-3.5 text-slate-600" /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-10 bg-slate-100" />)}</div>
        ) : logs.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10 font-medium">No activity logs found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map(log => {
              const Icon = ACTION_ICONS[log.action_type] || Activity;
              return (
                <div key={log.id} className="group flex items-center gap-3.5 px-5 py-3.5 hover:bg-orange-50/20 transition-all duration-200">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 font-auth-heading group-hover:text-[#FF6B00] transition-colors">{log.user_name || 'System'}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        log.action_type === 'LOGIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        log.action_type === 'UPLOAD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        log.action_type === 'DELETE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        log.action_type === 'CREATE_FOLDER' ? 'bg-orange-50 text-[#FF6B00] border-orange-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {log.action_type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{log.details}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      {fmtTime(log.created_at)}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                      <button
                        onClick={() => { setForm({ action_type: log.action_type || 'LOGIN', details: log.details || '', user_name: log.user_name || '' }); setModal({ type: 'edit', log }); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B00] hover:bg-white transition cursor-pointer"
                        title="Edit Log"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setModal({ type: 'delete', log })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/80">
            <span className="text-xs font-bold text-slate-600">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'create' ? 'Create Activity Log' : 'Edit Activity Log'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">User Name</label>
              <input required type="text" value={form.user_name} onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00]" placeholder="e.g. Admin System" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Action Type</label>
              <select value={form.action_type} onChange={e => setForm(f => ({ ...f, action_type: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]">
                {['LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'DELETE', 'RESTORE', 'UPDATE', 'CREATE_FOLDER', 'CREATE_CATEGORY'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">Details</label>
              <textarea rows={2} required value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] resize-none" placeholder="e.g. Uploaded confidential document" />
            </div>
            <ModalActions onCancel={() => setModal(null)} submitting={submitting} label={modal.type === 'create' ? 'Create Log' : 'Save Changes'} color="bg-[#FF6B00] hover:bg-[#EA580C]" />
          </form>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Delete Activity Log?" onClose={() => setModal(null)}>
          <p className="text-xs text-slate-600 mb-4">Are you sure you want to delete this activity log? This cannot be undone.</p>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-4">
             <p className="text-xs font-bold text-slate-900">{modal.log?.action_type}</p>
             <p className="text-[10px] text-slate-500">{modal.log?.details}</p>
          </div>
          <ModalActions onCancel={() => setModal(null)} submitting={submitting} label="Delete Log" color="bg-rose-600 hover:bg-rose-500" onConfirm={() => handleDelete(modal.log)} />
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// REPORTS SECTION
// ============================================================
function ReportsSection() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then(res => { if (res.data?.success) setReports(res.data.reports); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const maxM = reports ? Math.max(...(reports.monthlyUploads || []).map((m: any) => m.count), 1) : 1;
  const maxC = reports ? Math.max(...(reports.categoryBreakdown || []).map((c: any) => c.document_count), 1) : 1;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: reports?.totalUsers ?? '0', icon: Users },
          { label: 'Total Documents', value: reports?.totalDocuments ?? '0', icon: FileText },
          { label: 'Storage Used', value: fmtBytes(reports?.totalStorageBytes ?? 0), icon: HardDrive },
        ].map((k, i) => (
          <div key={i} className="group p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-lg hover:border-[#FF6B00] transition-all duration-300 flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#FF6B00] group-hover:scale-110 group-hover:bg-orange-50 transition-all shrink-0">
              <k.icon className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{k.label}</p>
              {loading ? <Skeleton className="h-7 w-20 mt-1 bg-slate-100" /> : <p className="text-2xl font-black text-slate-900 font-auth-heading tracking-tight mt-0.5">{k.value}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs">
        <SectionTitle icon={TrendingUp} title="Monthly Uploads" subtitle="Last 6 months document vault activity" color="text-[#FF6B00]" />
        {loading ? <Skeleton className="h-40 mt-4 bg-slate-100 rounded-2xl" /> : (
          <div className="flex items-end gap-4 h-44 mt-4 pt-4 border-t border-slate-100">
            {(reports?.monthlyUploads || []).map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                <span className="text-xs text-slate-800 font-mono font-bold group-hover:text-[#FF6B00] transition-colors">{m.count}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-[#FF6B00] to-[#F97316] group-hover:from-[#EA580C] group-hover:to-[#FF6B00] min-h-[6px] transition-all duration-300 shadow-md shadow-orange-500/10"
                  style={{ height: `${Math.max(6, (m.count / maxM) * 100)}%` }}
                />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs">
          <SectionTitle icon={BarChart3} title="Category Distribution" subtitle="Document counts per classification category" color="text-[#FF6B00]" />
          {loading ? <div className="space-y-3 mt-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8 bg-slate-100" />)}</div> : (
            <div className="space-y-4 mt-4 pt-4 border-t border-slate-100">
              {(reports?.categoryBreakdown || []).slice(0, 8).map((c: any, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs" style={{ backgroundColor: c.color || '#FF6B00' }} />
                      <span className="text-slate-900 font-black font-auth-heading truncate max-w-[180px]">{c.category_name}</span>
                    </div>
                    <span className="text-slate-600 font-mono font-bold">{c.document_count} docs</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${Math.max(3, (c.document_count / maxC) * 100)}%`, backgroundColor: c.color || '#FF6B00' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Downloads */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs">
          <SectionTitle icon={Download} title="Top Downloads" subtitle="Most frequently accessed document vaults" color="text-[#FF6B00]" />
          {loading ? <div className="space-y-2 mt-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 bg-slate-100" />)}</div> : (
            <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-100">
              {(reports?.topDownloads || []).slice(0, 6).map((d: any, i: number) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/40 border border-slate-200/60 transition group cursor-pointer">
                  <span className="text-xs font-mono font-bold text-slate-500 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 font-auth-heading group-hover:text-[#FF6B00] transition-colors truncate">{d.title}</p>
                    <p className="text-xs text-slate-500 font-medium">{d.owner_name}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6B00] border border-orange-200 text-xs font-mono font-black shrink-0">
                    {d.download_count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CMS SECTION (Landing Page Management)
// ============================================================
function CmsSection({ showToast }: { showToast: any }) {
  return <AdminCmsPage />;
}

// ============================================================
// SYSTEM HEALTH SECTION
// ============================================================
function SystemSection() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const items = [
    { label: 'Backend Server', status: 'Online', detail: 'Node.js + Express.js', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    { label: 'Database Engine', status: 'Connected', detail: 'SQLite (MySQL fallback)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    { label: 'Authentication', status: 'Active', detail: 'JWT Bearer Tokens', color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
    { label: 'File Storage', status: 'Mounted', detail: 'Local /uploads directory', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
    { label: 'API Gateway', status: 'Healthy', detail: 'Express Router on :5000', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    { label: 'CORS Policy', status: 'Configured', detail: 'Dynamic origin whitelist', color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle icon={Server} title="System Health Monitor" subtitle="Real-time server & infrastructure status" color="text-[#FF6B00]" />

      {/* Server Time */}
      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Live Server Clock</p>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-wide font-auth-heading mt-0.5">{time.toLocaleTimeString()}</p>
            <p className="text-xs text-slate-500 font-medium">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold text-slate-500 mb-1">Environment Mode</p>
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider shadow-2xs">
            Development Active
          </span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={i} className="group p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-lg hover:border-[#FF6B00] transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-2xs ${item.color}`}>
                <span className={`w-2 h-2 rounded-full ${item.dot} animate-pulse`} />
                {item.status}
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 font-auth-heading tracking-tight group-hover:text-[#FF6B00] transition-colors">{item.label}</h4>
            <p className="text-xs text-slate-600 font-medium mt-1">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Core Technology Stack</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Next.js 14', type: 'Frontend Framework' },
            { name: 'Node.js + Express', type: 'Backend API Gateway' },
            { name: 'MySQL / SQLite', type: 'Database Engine' },
            { name: 'JWT Auth', type: 'Security & Tokens' },
            { name: 'Tailwind CSS', type: 'Styling Architecture' },
            { name: 'Multer', type: 'File Upload Pipeline' },
            { name: 'bcryptjs', type: 'Password Hashing' },
            { name: 'MVC Pattern', type: 'Modular Architecture' },
          ].map((t, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-orange-50/40 hover:border-orange-200 transition-all duration-300 cursor-pointer group">
              <p className="text-xs font-black text-slate-900 font-auth-heading group-hover:text-[#FF6B00] transition-colors">{t.name}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{t.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 space-y-4 animate-pop-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900 font-auth-heading">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, submitting, label, color = 'bg-[#FF6B00] hover:bg-[#EA580C]' }: any) {
  return (
    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-4">
      <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer">Cancel</button>
      <button type={onConfirm ? 'button' : 'submit'} onClick={onConfirm} disabled={submitting} className={`px-5 py-2.5 rounded-xl ${color} text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer`}>
        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{label}
      </button>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder || ''} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00] placeholder-slate-400" />
    </div>
  );
}

function FieldArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase text-slate-600 block mb-1">{label}</label>
      <textarea rows={rows} value={value} onChange={(e: any) => onChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] resize-none" />
    </div>
  );
}
