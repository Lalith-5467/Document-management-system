'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle, HelpCircle, Bot, Mail, Plus, Edit3, Trash2, CheckCircle2,
  X, Search, Sliders, ShieldCheck, LifeBuoy, ToggleLeft, ToggleRight,
  Clock, MessageSquare, AlertCircle, Check, Send
} from 'lucide-react';
import { HelpFaqItem, WidgetSettings, BotRule, SupportTicket } from '@/components/FloatingHelpCenter';

const DEFAULT_FAQS: HelpFaqItem[] = [
  {
    id: '1',
    q: 'How do I upload and encrypt my documents?',
    a: 'Navigate to "Upload Document" from the left menu or top header. Choose your file (PDF, Word, Images), select a folder or category, and click Upload. DocVault automatically encrypts all files using AES-256 bit encryption at rest.',
    category: 'Documents'
  },
  {
    id: '2',
    q: 'How do folders and categories work?',
    a: 'Folders act as physical storage directories (e.g. Work, Personal, Taxes), while Categories act as flexible labels. You can assign multiple category tags to any document for fast cross-folder filtering.',
    category: 'Organization'
  },
  {
    id: '3',
    q: 'Can I share my encrypted documents safely?',
    a: 'Yes! Open any document, click "Share & Permissions", set a passphrase or expiration date, and copy the secure link to share with clients or family.',
    category: 'Security'
  },
  {
    id: '4',
    q: 'What happens if my subscription expires?',
    a: 'Your documents remain 100% safe and available for download. Free tier limits (up to 15MB per upload and 50 documents) will apply for new uploads until renewed.',
    category: 'Billing'
  },
  {
    id: '5',
    q: 'How do expiry reminders work?',
    a: 'Set document expiration dates (e.g., Passports, Driving Licenses, Contracts). DocVault will alert you via notifications and email before they expire.',
    category: 'Reminders'
  }
];

const DEFAULT_SETTINGS: WidgetSettings = {
  isEnabled: true,
  popoverBadge: 'Need',
  popoverTitle: 'Help?',
  popoverSubtitle: 'Check our documentation or contact support',
  hoverTooltip: 'Need Help? Chat & Docs 💬',
  themeColor: '#FF6B00'
};

const DEFAULT_BOT_RULES: BotRule[] = [
  { id: '1', keyword: 'upload', response: 'To upload documents, click the orange "Upload Document" button at the top header or navigate to "/user/upload". We support PDF, DOCX, PNG, JPG, and TXT files.' },
  { id: '2', keyword: 'encrypt', response: 'DocVault uses military-grade AES-256 encryption. You can also lock individual sensitive documents with a custom PIN/Password.' },
  { id: '3', keyword: 'price', response: 'Check out our Subscription & Billing section in the menu for Pro and Team plans starting at ₹299/mo with 100GB storage!' }
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TICKET-101',
    name: 'Sarah Jenkins',
    email: 'sarah.j@company.com',
    subject: 'Cannot download invoice PDF',
    message: 'Hello, when I click PDF Invoice on my subscription billing page, it gives me an error. Please check.',
    createdAt: '24 Jul 2026, 14:30',
    status: 'open'
  },
  {
    id: 'TICKET-102',
    name: 'Michael Chang',
    email: 'mchang@techcorp.io',
    subject: 'Request custom Enterprise storage quote',
    message: 'Our organization needs 10 TB storage capacity with custom role permissions.',
    createdAt: '22 Jul 2026, 10:15',
    status: 'in_progress',
    adminReply: 'Hi Michael, our enterprise team is preparing a customized proposal for your 10TB vault.'
  }
];

export default function AdminSupportCenterPage() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'settings' | 'bot' | 'tickets'>('faqs');

  // FAQs state
  const [faqs, setFaqs] = useState<HelpFaqItem[]>(DEFAULT_FAQS);
  const [showCreateFaqModal, setShowCreateFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<HelpFaqItem | null>(null);
  const [newFaqForm, setNewFaqForm] = useState({ q: '', a: '', category: 'Documents' });

  // Widget Settings State
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);

  // Bot Rules State
  const [botRules, setBotRules] = useState<BotRule[]>(DEFAULT_BOT_RULES);
  const [showCreateBotModal, setShowCreateBotModal] = useState(false);
  const [editingBotRule, setEditingBotRule] = useState<BotRule | null>(null);
  const [newBotForm, setNewBotForm] = useState({ keyword: '', response: '' });

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFaqs = localStorage.getItem('dms_help_faqs');
      if (savedFaqs) { try { setFaqs(JSON.parse(savedFaqs)); } catch (e) {} }

      const savedSet = localStorage.getItem('dms_help_settings');
      if (savedSet) { try { setSettings(JSON.parse(savedSet)); } catch (e) {} }

      const savedBot = localStorage.getItem('dms_bot_responses');
      if (savedBot) { try { setBotRules(JSON.parse(savedBot)); } catch (e) {} }

      const savedTickets = localStorage.getItem('dms_support_tickets');
      if (savedTickets) {
        try {
          const parsed: SupportTicket[] = JSON.parse(savedTickets);
          if (parsed.length > 0) setTickets(prev => [...parsed, ...prev.filter(p => !parsed.some(x => x.id === p.id))]);
        } catch (e) {}
      }
    }
  }, []);

  // Save to LocalStorage helpers
  const saveFaqsToStorage = (updated: HelpFaqItem[]) => {
    setFaqs(updated);
    if (typeof window !== 'undefined') localStorage.setItem('dms_help_faqs', JSON.stringify(updated));
  };

  const saveSettingsToStorage = (updated: WidgetSettings) => {
    setSettings(updated);
    if (typeof window !== 'undefined') localStorage.setItem('dms_help_settings', JSON.stringify(updated));
  };

  const saveBotToStorage = (updated: BotRule[]) => {
    setBotRules(updated);
    if (typeof window !== 'undefined') localStorage.setItem('dms_bot_responses', JSON.stringify(updated));
  };

  const saveTicketsToStorage = (updated: SupportTicket[]) => {
    setTickets(updated);
    if (typeof window !== 'undefined') localStorage.setItem('dms_support_tickets', JSON.stringify(updated));
  };

  /* ==================== 1. FAQS CRUD HANDLERS ==================== */
  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqForm.q || !newFaqForm.a) return;

    const newFaq: HelpFaqItem = {
      id: Date.now().toString(),
      q: newFaqForm.q,
      a: newFaqForm.a,
      category: newFaqForm.category
    };

    const updated = [newFaq, ...faqs];
    saveFaqsToStorage(updated);
    setShowCreateFaqModal(false);
    showToast(`New FAQ question added!`);
    setNewFaqForm({ q: '', a: '', category: 'Documents' });
  };

  const handleUpdateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    const updated = faqs.map(f => f.id === editingFaq.id ? editingFaq : f);
    saveFaqsToStorage(updated);
    setEditingFaq(null);
    showToast(`FAQ updated successfully!`);
  };

  const handleDeleteFaq = (id: string) => {
    const updated = faqs.filter(f => f.id !== id);
    saveFaqsToStorage(updated);
    showToast(`FAQ item deleted.`);
  };

  /* ==================== 2. WIDGET SETTINGS CRUD HANDLER ==================== */
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsToStorage(settings);
    showToast('Floating Help Center widget settings updated!');
  };

  /* ==================== 3. BOT RULES CRUD HANDLERS ==================== */
  const handleCreateBotRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotForm.keyword || !newBotForm.response) return;

    const newRule: BotRule = {
      id: Date.now().toString(),
      keyword: newBotForm.keyword.toLowerCase().trim(),
      response: newBotForm.response
    };

    const updated = [...botRules, newRule];
    saveBotToStorage(updated);
    setShowCreateBotModal(false);
    showToast(`Bot reply rule for keyword "${newRule.keyword}" created!`);
    setNewBotForm({ keyword: '', response: '' });
  };

  const handleUpdateBotRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBotRule) return;

    const updated = botRules.map(r => r.id === editingBotRule.id ? editingBotRule : r);
    saveBotToStorage(updated);
    setEditingBotRule(null);
    showToast(`Bot reply rule updated successfully!`);
  };

  const handleDeleteBotRule = (id: string) => {
    const updated = botRules.filter(r => r.id !== id);
    saveBotToStorage(updated);
    showToast('Bot response rule deleted.');
  };

  /* ==================== 4. TICKETS CRUD HANDLERS ==================== */
  const handleUpdateTicketStatus = (ticketId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
    saveTicketsToStorage(updated);
    showToast(`Ticket status changed to ${newStatus.toUpperCase()}`);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, adminReply: replyText, status: 'resolved' as const } : t);
    saveTicketsToStorage(updated);
    setSelectedTicket(prev => prev ? { ...prev, adminReply: replyText, status: 'resolved' } : null);
    setReplyText('');
    showToast(`Reply sent and ticket resolved!`);
  };

  const handleDeleteTicket = (id: string) => {
    const updated = tickets.filter(t => t.id !== id);
    saveTicketsToStorage(updated);
    if (selectedTicket && selectedTicket.id === id) setSelectedTicket(null);
    showToast('Support ticket record deleted.');
  };

  return (
    <div className="space-y-8 pb-16 text-slate-900 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-slate-900 border border-[#FF6B00]/30 shadow-2xl shadow-orange-500/10 text-xs font-semibold animate-pop-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-auth-heading">
            <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6B00] flex items-center justify-center shadow-2xs shrink-0">
              <MessageCircle className="w-5 h-5" />
            </span>
            Floating Help Center & Support CRUD Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Full Admin Control: Manage floating message widget settings, FAQs, AI Bot auto-replies, and user support tickets.
          </p>
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
        {[
          { id: 'faqs', label: '❓ FAQ Manager', count: faqs.length },
          { id: 'settings', label: '⚙️ Widget Settings', count: 1 },
          { id: 'bot', label: '🤖 AI Bot Replies', count: botRules.length },
          { id: 'tickets', label: '🎫 Support Tickets', count: tickets.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: MANAGING FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6 animate-pop-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-auth-heading">Help Center FAQs List ({faqs.length})</h3>
              <p className="text-xs text-slate-500 font-medium">Questions and answers displayed in the Help Center popover & modal.</p>
            </div>
            <button
              onClick={() => setShowCreateFaqModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
              <Plus className="w-4 h-4" /> Add New FAQ
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-[#FF6B00]/50 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4.5 h-4.5 text-[#FF6B00] shrink-0" />
                    <h4 className="text-sm font-black text-slate-900 font-auth-heading group-hover:text-[#FF6B00] transition-colors">{item.q}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => setEditingFaq(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF6B00] hover:bg-white transition cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WIDGET CUSTOMIZATION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 animate-pop-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6B00] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-auth-heading">Floating Message Symbol Customization</h3>
              <p className="text-xs text-slate-500 font-medium">
                Change popover card headers, badges, tooltips, and status toggles for the user Help Center widget.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[10px] text-slate-600">Popover Badge Highlight</label>
                <input
                  type="text"
                  value={settings.popoverBadge}
                  onChange={(e) => setSettings({ ...settings, popoverBadge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[10px] text-slate-600">Popover Main Title</label>
                <input
                  type="text"
                  value={settings.popoverTitle}
                  onChange={(e) => setSettings({ ...settings, popoverTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold uppercase text-[10px] text-slate-600">Popover Subtitle Text</label>
              <input
                type="text"
                value={settings.popoverSubtitle}
                onChange={(e) => setSettings({ ...settings, popoverSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold uppercase text-[10px] text-slate-600">Hover Tooltip Text</label>
              <input
                type="text"
                value={settings.hoverTooltip}
                onChange={(e) => setSettings({ ...settings, hoverTooltip: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
              Save Widget Customizations
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: AI BOT AUTO-REPLIES CRUD */}
      {activeTab === 'bot' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 animate-pop-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 font-auth-heading">Live AI Chat Bot Auto-Replies ({botRules.length})</h3>
              <p className="text-xs text-slate-500 font-medium">Define keyword triggers and automated responses for the live chat bot.</p>
            </div>
            <button
              onClick={() => setShowCreateBotModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 hover:scale-105 transition cursor-pointer">
              <Plus className="w-4 h-4" /> Add Bot Reply Rule
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Keyword Trigger</th>
                  <th className="py-3.5 px-4">Automated Response</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {botRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-orange-50/20 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FF6B00]">
                      "{rule.keyword}"
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {rule.response}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingBotRule(rule)}
                          className="p-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                          title="Edit Rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBotRule(rule.id)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USER SUPPORT TICKETS CRUD */}
      {activeTab === 'tickets' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 animate-pop-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 font-auth-heading">Submitted Support Tickets ({tickets.length})</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-orange-50/20 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FF6B00]">{t.id}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-extrabold text-slate-900">{t.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{t.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{t.subject}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{t.createdAt}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        t.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-200 font-bold hover:bg-orange-100 text-[10px] cursor-pointer"
                        >
                          Review & Reply
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(t.id)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE FAQ MODAL */}
      {showCreateFaqModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 text-xs text-slate-900">
            <button onClick={() => setShowCreateFaqModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 font-auth-heading">Add New Help Center FAQ</h3>

            <form onSubmit={handleCreateFaq} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Category Tag</label>
                <select
                  value={newFaqForm.category}
                  onChange={e => setNewFaqForm({ ...newFaqForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Documents">Documents</option>
                  <option value="Organization">Organization</option>
                  <option value="Security">Security</option>
                  <option value="Billing">Billing</option>
                  <option value="Reminders">Reminders</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do I reset my account password?"
                  value={newFaqForm.q}
                  onChange={e => setNewFaqForm({ ...newFaqForm, q: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Detailed Answer</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide step-by-step guidance for the user..."
                  value={newFaqForm.a}
                  onChange={e => setNewFaqForm({ ...newFaqForm, a: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateFaqModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 transition cursor-pointer">
                  Add FAQ Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FAQ MODAL */}
      {editingFaq && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 text-xs text-slate-900">
            <button onClick={() => setEditingFaq(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 font-auth-heading">Edit FAQ Item</h3>

            <form onSubmit={handleUpdateFaq} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  value={editingFaq.q}
                  onChange={e => setEditingFaq({ ...editingFaq, q: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Detailed Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.a}
                  onChange={e => setEditingFaq({ ...editingFaq, a: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingFaq(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 transition cursor-pointer">
                  Save FAQ Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BOT RULE MODAL */}
      {showCreateBotModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 text-xs text-slate-900">
            <button onClick={() => setShowCreateBotModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 font-auth-heading">Create AI Bot Response Rule</h3>

            <form onSubmit={handleCreateBotRule} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Trigger Keyword</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. refund, password, upload"
                  value={newBotForm.keyword}
                  onChange={e => setNewBotForm({ ...newBotForm, keyword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[#FF6B00] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Automated Bot Response</label>
                <textarea
                  rows={4}
                  required
                  placeholder="What response should the bot return when this keyword is detected?"
                  value={newBotForm.response}
                  onChange={e => setNewBotForm({ ...newBotForm, response: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateBotModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 transition cursor-pointer">
                  Save Bot Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOT RULE MODAL */}
      {editingBotRule && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 text-xs text-slate-900">
            <button onClick={() => setEditingBotRule(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 font-auth-heading">Edit AI Bot Response Rule</h3>

            <form onSubmit={handleUpdateBotRule} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Trigger Keyword</label>
                <input
                  type="text"
                  required
                  value={editingBotRule.keyword}
                  onChange={e => setEditingBotRule({ ...editingBotRule, keyword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[#FF6B00] focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Automated Bot Response</label>
                <textarea
                  rows={4}
                  required
                  value={editingBotRule.response}
                  onChange={e => setEditingBotRule({ ...editingBotRule, response: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingBotRule(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-90 shadow-md shadow-orange-500/20 transition cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & REPLY TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 text-xs text-slate-900">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 font-auth-heading">Ticket: {selectedTicket.id}</h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-extrabold text-slate-900 text-sm font-auth-heading">{selectedTicket.name} <span className="text-xs text-slate-500 font-normal">({selectedTicket.email})</span></p>
              <p className="text-slate-600 font-mono text-xs font-bold">Subject: {selectedTicket.subject}</p>
              <p className="text-slate-700 text-xs pt-1 leading-relaxed font-medium">{selectedTicket.message}</p>
            </div>

            {selectedTicket.adminReply && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="text-[10px] font-black uppercase text-emerald-700">Previous Admin Reply:</p>
                <p className="text-xs text-emerald-800 font-medium">{selectedTicket.adminReply}</p>
              </div>
            )}

            <form onSubmit={handleSendTicketReply} className="space-y-3">
              <div>
                <label className="font-extrabold text-[10px] uppercase text-slate-600 block mb-1">Reply to User</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type your official support resolution..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer">
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
