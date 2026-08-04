'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  HelpCircle,
  X,
  BookOpen,
  Mail,
  Send,
  CheckCircle2,
  Search,
  ChevronDown,
  ShieldCheck,
  FileText,
  Lock,
  FolderClosed,
  Zap,
  MessageCircle,
  LifeBuoy,
  Bot,
  User,
  Sparkles,
  Minus,
  Paperclip,
  Clock,
  Headphones
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';

export interface HelpFaqItem {
  id: string;
  q: string;
  a: string;
  category: string;
}

export interface WidgetSettings {
  isEnabled: boolean;
  popoverBadge: string;
  popoverTitle: string;
  popoverSubtitle: string;
  hoverTooltip: string;
  themeColor: string;
}

export interface BotRule {
  id: string;
  keyword: string;
  response: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
}

const DEFAULT_FAQS: HelpFaqItem[] = [
  {
    id: '1',
    q: 'How do I upload and encrypt my documents?',
    a: 'Navigate to "Upload Document" from the left menu or workspace header. Select your file, choose a category or folder, set optional expiry date, and click Save Document. Files are automatically encrypted with AES-256 bit security.',
    category: 'Documents'
  },
  {
    id: '2',
    q: 'How do folders and categories work?',
    a: 'Folders store files in organized directories, while Categories act as metadata tags. You can assign categories to any document for instant cross-folder search and filtering.',
    category: 'Organization'
  },
  {
    id: '3',
    q: 'Can I protect documents with a master password?',
    a: 'Yes! When uploading a document, toggle "Protect document with a password" and enter a 6+ character master password. Anyone opening or downloading the document will be prompted for this password.',
    category: 'Security'
  },
  {
    id: '4',
    q: 'How do document expiry reminders work?',
    a: 'When uploading contracts, visas, or licenses, enter an Expiry Date. DocVault tracks your documents and sends workspace notifications before they expire.',
    category: 'Reminders'
  },
  {
    id: '5',
    q: 'What is the maximum file upload size?',
    a: 'DocVault supports single file uploads up to 25 MB in PDF, Word, Excel, PowerPoint, PNG, JPG, and ZIP formats.',
    category: 'Limits'
  }
];

const DEFAULT_SETTINGS: WidgetSettings = {
  isEnabled: true,
  popoverBadge: 'DocVault',
  popoverTitle: 'Need Help?',
  popoverSubtitle: 'Chat with our AI assistant or browse guides',
  hoverTooltip: 'Need Help? Chat & Support 💬',
  themeColor: 'var(--theme-primary, #FF6B00)'
};

const DEFAULT_BOT_RULES: BotRule[] = [
  { id: '1', keyword: 'upload', response: 'To upload documents, click the orange "Upload Document" button at the top header or go to "/user/upload". We support PDF, Word, Excel, Images, and ZIP up to 25 MB.' },
  { id: '2', keyword: 'encrypt', response: 'DocVault uses AES-256 military-grade encryption. You can also add custom master passwords to individual sensitive documents when uploading.' },
  { id: '3', keyword: 'expiry', response: 'You can set Expiry Dates on identity documents, passports, and contracts to receive automated workspace notifications before they expire.' },
  { id: '4', keyword: 'category', response: 'Categories help you classify documents (e.g. Personal, Financial, Academic). You can manage categories under Category Management.' },
  { id: '5', keyword: 'folder', response: 'You can create target folders to group related files. Click "New Folder" on the upload page or navigate to Folder Management.' }
];

export default function FloatingHelpCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'ticket'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const [faqsList, setFaqsList] = useState<HelpFaqItem[]>(DEFAULT_FAQS);
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [botRules, setBotRules] = useState<BotRule[]>(DEFAULT_BOT_RULES);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '👋 Hi! Welcome to DocVault Support. I am your AI assistant. How can I help you manage your documents today?',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFaqs = localStorage.getItem('dms_help_faqs');
      if (savedFaqs) { try { setFaqsList(JSON.parse(savedFaqs)); } catch (e) {} }

      const savedSet = localStorage.getItem('dms_help_settings');
      if (savedSet) { try { setSettings(JSON.parse(savedSet)); } catch (e) {} }

      const savedBot = localStorage.getItem('dms_bot_responses');
      if (savedBot) { try { setBotRules(JSON.parse(savedBot)); } catch (e) {} }
    }
  }, []);

  useEffect(() => {
    const handleOpenHelp = () => {
      setIsOpen(true);
      setActiveTab('chat');
    };
    window.addEventListener('open-docvault-help-center', handleOpenHelp);
    return () => window.removeEventListener('open-docvault-help-center', handleOpenHelp);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen, activeTab]);

  if (!settings.isEnabled || pathname?.startsWith('/admin')) return null;

  const filteredFaqs = faqsList.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateSmartAiReply = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Download
    if (q.includes('download') || q.includes('save file') || q.includes('export') || q.includes('get document') || q.includes('get file')) {
      return '📥 To download a document: Go to "My Documents", locate your file, and click the "Download File" button or options menu (⋮). If password protected, enter your master password when prompted.';
    }

    // 2. Upload / File Size / Formats
    if (q.includes('upload') || q.includes('add file') || q.includes('add document') || q.includes('size') || q.includes('format')) {
      return '📤 To upload documents: Click "Upload Document" from the top header or left sidebar. Select or drop your file (PDF, Word, Excel, PowerPoint, Images, ZIP up to 25 MB), select a category & folder, and save.';
    }

    // 3. Password / Encryption / Security
    if (q.includes('password') || q.includes('protect') || q.includes('encrypt') || q.includes('security') || q.includes('pin') || q.includes('lock')) {
      return '🔒 Password & Security: DocVault encrypts all documents with AES-256 bit security. When uploading or editing, toggle "Protect document with a password" to set a custom master password (min 6 chars).';
    }

    // 4. Expiry / Renewal / Reminders
    if (q.includes('expir') || q.includes('renew') || q.includes('remind') || q.includes('passport') || q.includes('visa') || q.includes('contract') || q.includes('date')) {
      return '⏰ Expiry Reminders: Set a mandatory Expiry Date when uploading time-sensitive documents (Passports, Visas, Licenses). DocVault tracks these dates and displays expiration alerts on your workspace dashboard.';
    }

    // 5. Folders
    if (q.includes('folder') || q.includes('directory')) {
      return '📁 Workspace Folders: You can group documents by creating folders. Click "+ New Folder" on the Upload page or navigate to Folder Management from the sidebar.';
    }

    // 6. Categories / Tags
    if (q.includes('category') || q.includes('tag') || q.includes('label')) {
      return '🏷️ Category Domains: Categories help classify your documents (e.g., Personal, Academic, Resume, Financial). Select a category when uploading to easily filter documents across all folders.';
    }

    // 7. Favorites / Starred
    if (q.includes('favorite') || q.includes('star') || q.includes('bookmark')) {
      return '⭐ Starred & Favorites: Click the Star icon on any document card or toggle "Mark as Favorite" during upload to add documents to your Favorites quick access tab.';
    }

    // 8. Delete / Remove / Trash
    if (q.includes('delete') || q.includes('remove') || q.includes('trash') || q.includes('destroy')) {
      return '🗑️ Deleting Documents: Open "My Documents", locate the target file, click options (⋮), and select "Delete". Deleted actions are logged in the activity audit system.';
    }

    // 9. Search & Filter
    if (q.includes('search') || q.includes('find') || q.includes('filter') || q.includes('look for')) {
      return '🔍 Searching Documents: Use the top search bar in "My Documents" or Dashboard. You can search by document title, reference notes, category, or file format.';
    }

    // 10. Admin & Portal
    if (q.includes('admin') || q.includes('portal') || q.includes('log') || q.includes('audit') || q.includes('users')) {
      return '🛡️ Admin Portal: Administrators can view global system stats, storage utilization, user accounts, and real-time audit logs from the Admin Login (/admin-login).';
    }

    // 11. Greetings
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('greetings') || q.includes('who are you')) {
      return '👋 Hello! I am DocVault AI Assistant 🤖. How can I assist you with your document uploads, master passwords, folders, or expiry dates today?';
    }

    // 12. Account & Login
    if (q.includes('login') || q.includes('sign in') || q.includes('register') || q.includes('create account') || q.includes('create an account') || q.includes('new account') || q.includes('sign up') || q.includes('signup')) {
      return '🔐 Account Access: You can sign in to your vault or create a new account by clicking the "Sign In" or "Get Started" buttons in the top navigation bar.';
    }

    // 13. Check Admin Custom Bot Rules
    const matchedRule = botRules.find(r => q.includes(r.keyword.toLowerCase()));
    if (matchedRule) {
      return matchedRule.response;
    }

    // 14. Next / Continue / More
    if (q === 'next' || q.includes('next step') || q.includes('continue') || q.includes('tell me more') || q.includes('what else') || q.includes('then what')) {
      return '➡️ If you are looking for what to do next, you can try exploring: Uploading documents, Creating folders, Setting Expiry reminders, or Encrypting files with passwords. You can also click the quick-action buttons below for help!';
    }

    // 15. Dynamic AI Fallback
    return `💡 I'm currently unable to answer questions regarding "${query}". For step-by-step assistance, please check our FAQs tab or click the Ticket tab to message our support team!`;
  };

  const handleSendChatMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const userText = (customText || chatInput).trim();
    if (!userText) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeStr }]);
    if (!customText) setChatInput('');

    setTimeout(() => {
      const botReply = generateSmartAiReply(userText);
      setChatMessages((prev) => [...prev, { sender: 'bot', text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.message) return;

    const newTicket: SupportTicket = {
      id: `TICKET-${Date.now().toString().slice(-4)}`,
      name: contactForm.name || 'Anonymous User',
      email: contactForm.email,
      subject: contactForm.subject || 'Help Request',
      message: contactForm.message,
      createdAt: new Date().toLocaleString(),
      status: 'open'
    };

    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('dms_support_tickets');
      const tickets: SupportTicket[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem('dms_support_tickets', JSON.stringify([newTicket, ...tickets]));
    }

    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto font-auth-body">
      
      {/* PROFESSIONAL LIVE SUPPORT CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-88 sm:w-96 h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-pop-in text-slate-900 dark:text-white transition-all duration-300 border-themePrimary/20">
          
          {/* CHAT WINDOW HEADER */}
          <div className="p-4 bg-gradient-to-r from-themePrimary via-[#F97316] to-[#EA580C] text-white flex items-center justify-between shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-inner font-auth-heading">
                  <Bot className="w-5 h-5" />
                </div>
                {/* Live Online Badge */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-orange-600 rounded-full shadow-xs" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight text-white font-auth-heading">DocVault Support</h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-white/20 text-white backdrop-blur-xs font-auth-label">
                    AI Online
                  </span>
                </div>
                <p className="text-[11px] text-orange-100/90 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Replies instantly 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Minimize Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION STRIP */}
          <div className="flex items-center justify-around bg-slate-100 dark:bg-slate-800/60 p-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold font-auth-heading">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-themePrimary shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Live Chat
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 py-1.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'faqs'
                  ? 'bg-white dark:bg-slate-900 text-themePrimary shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> FAQs
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex-1 py-1.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ticket'
                  ? 'bg-white dark:bg-slate-900 text-themePrimary shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Ticket
            </button>
          </div>

          {/* TAB CONTENT 1: LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950/40">
              
              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-auth-body">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-themePrimary text-white shadow-xs'
                          : 'bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-themePrimary to-[#F97316] text-white rounded-tr-none shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-75 block text-right font-mono">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK PROMPT CHIPS */}
              <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
                <button
                  onClick={() => handleSendChatMessage(undefined, 'How to upload documents?')}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-themePrimary hover:text-themePrimary whitespace-nowrap transition cursor-pointer font-auth-body"
                >
                  📤 How to upload?
                </button>
                <button
                  onClick={() => handleSendChatMessage(undefined, 'Is my file encrypted?')}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-themePrimary hover:text-themePrimary whitespace-nowrap transition cursor-pointer font-auth-body"
                >
                  🔒 Encrypted storage
                </button>
                <button
                  onClick={() => handleSendChatMessage(undefined, 'How do expiry dates work?')}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-themePrimary hover:text-themePrimary whitespace-nowrap transition cursor-pointer font-auth-body"
                >
                  ⏰ Expiry alerts
                </button>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={(e) => handleSendChatMessage(e)} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message or question..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary font-auth-body"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white hover:brightness-110 transition shrink-0 cursor-pointer disabled:opacity-40 shadow-md shadow-orange-500/20 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB CONTENT 2: FAQS */}
          {activeTab === 'faqs' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/40 font-auth-body">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search FAQ answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary"
                />
              </div>

              <div className="space-y-2">
                {filteredFaqs.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div key={faq.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                        className="w-full p-3 text-left flex items-center justify-between gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-themePrimary"
                      >
                        <span className="font-auth-heading">{faq.q}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-themePrimary' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: TICKET */}
          {activeTab === 'ticket' && (
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 font-auth-body">
              {contactSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-2 my-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300 font-auth-heading">Ticket Submitted!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Our support team will review your request and reply to your email address within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-auth-label">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-auth-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-auth-label">Message *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe your issue or query..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer font-auth-heading"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                  </button>
                </form>
              )}
            </div>
          )}

          {/* CHAT FOOTER */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-auth-label">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 Encrypted Support
            </span>
            <span className="font-mono">DocVault v2.4</span>
          </div>
        </div>
      )}

      {/* FLOATING BEACON CHAT BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-themePrimary to-[#F97316] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white dark:border-slate-800 flex items-center justify-center cursor-pointer"
        aria-label="Open Live Chat Support"
        title={settings.hoverTooltip}
      >
        {/* Pulsing Outer Ring */}
        <span className="animate-ping absolute inset-0 rounded-full bg-themePrimary opacity-75 pointer-events-none" />
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-40 blur-sm group-hover:opacity-80 transition-opacity animate-pulse pointer-events-none" />

        {/* Online Status Dot */}
        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </span>

        {/* Icon */}
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 text-white fill-white/10 group-hover:rotate-6 transition-transform" />

        {/* Tooltip on hover */}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md hidden sm:block font-auth-heading">
          {settings.hoverTooltip}
        </span>
      </button>
    </div>
  );
}
