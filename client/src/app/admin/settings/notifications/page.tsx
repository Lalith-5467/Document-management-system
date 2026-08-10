'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellRing, Save, AlertCircle, CheckCircle2, Mail, Smartphone, Webhook
} from 'lucide-react';

interface NotificationConfig {
  email: {
    enabled: boolean;
    newUser: boolean;
    documentUpload: boolean;
    systemAlerts: boolean;
    dailyDigest: boolean;
  };
  push: {
    enabled: boolean;
    criticalAlerts: boolean;
  };
  webhook: {
    enabled: boolean;
    url: string;
  };
}

const DEFAULT_CONFIG: NotificationConfig = {
  email: {
    enabled: true,
    newUser: true,
    documentUpload: false,
    systemAlerts: true,
    dailyDigest: false
  },
  push: {
    enabled: false,
    criticalAlerts: true
  },
  webhook: {
    enabled: false,
    url: ''
  }
};

export default function AdminNotificationsPage() {
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dms_admin_notifications');
    if (stored) {
      setConfig(JSON.parse(stored));
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      localStorage.setItem('dms_admin_notifications', JSON.stringify(config));
      showToast('Notification settings saved successfully!');
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[9999] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900 dark:bg-slate-800 border border-slate-700' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-300" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
          <BellRing className="w-6 h-6 text-themePrimary" /> Notification Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage how the system communicates events to administrators and users.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Email Notifications */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-orange-50/20 dark:bg-orange-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-themePrimary flex items-center justify-center border border-orange-200 dark:border-orange-900/60">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Email Notifications</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard SMTP email delivery for events.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={config.email.enabled}
                onChange={e => setConfig({ ...config, email: { ...config.email, enabled: e.target.checked }})}
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-themePrimary"></div>
            </label>
          </div>
          
          <div className={`p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 ${!config.email.enabled && 'opacity-50 pointer-events-none'}`}>
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <input type="checkbox" checked={config.email.newUser} onChange={e => setConfig({...config, email: {...config.email, newUser: e.target.checked}})} className="w-4 h-4 text-themePrimary focus:ring-themePrimary rounded cursor-pointer" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">New User Registration</div>
            </label>
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <input type="checkbox" checked={config.email.documentUpload} onChange={e => setConfig({...config, email: {...config.email, documentUpload: e.target.checked}})} className="w-4 h-4 text-themePrimary focus:ring-themePrimary rounded cursor-pointer" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Document Uploads</div>
            </label>
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <input type="checkbox" checked={config.email.systemAlerts} onChange={e => setConfig({...config, email: {...config.email, systemAlerts: e.target.checked}})} className="w-4 h-4 text-themePrimary focus:ring-themePrimary rounded cursor-pointer" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Critical System Alerts</div>
            </label>
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <input type="checkbox" checked={config.email.dailyDigest} onChange={e => setConfig({...config, email: {...config.email, dailyDigest: e.target.checked}})} className="w-4 h-4 text-themePrimary focus:ring-themePrimary rounded cursor-pointer" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Admin Digest</div>
            </label>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-orange-50/20 dark:bg-orange-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-themePrimary flex items-center justify-center border border-orange-200 dark:border-orange-900/60">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Webhook Integration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Send real-time payloads to Slack/Discord.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={config.webhook.enabled}
                onChange={e => setConfig({ ...config, webhook: { ...config.webhook, enabled: e.target.checked }})}
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-themePrimary"></div>
            </label>
          </div>
          
          <div className={`p-6 ${!config.webhook.enabled && 'opacity-50 pointer-events-none'}`}>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Webhook URL</label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={config.webhook.url}
              onChange={e => setConfig({...config, webhook: {...config.webhook, url: e.target.value}})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-themePrimary transition"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">POST requests will be sent to this URL for all major system events.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-black text-xs shadow-md shadow-orange-500/20 hover:opacity-90 hover:scale-105 transition disabled:opacity-70 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
