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
    <div className="space-y-6 max-w-4xl font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[9999] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-300" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-auth-heading">
          <BellRing className="w-6 h-6 text-amber-500" /> Notification Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Manage how the system communicates events to administrators and users.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Email Notifications */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Email Notifications</h2>
                <p className="text-xs text-slate-500 font-medium">Standard SMTP email delivery for events.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={config.email.enabled}
                onChange={e => setConfig({ ...config, email: { ...config.email, enabled: e.target.checked }})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          
          <div className={`p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 ${!config.email.enabled && 'opacity-50 pointer-events-none'}`}>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
              <input type="checkbox" checked={config.email.newUser} onChange={e => setConfig({...config, email: {...config.email, newUser: e.target.checked}})} className="w-4 h-4 text-amber-500 rounded" />
              <div className="text-sm font-bold text-slate-700">New User Registration</div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
              <input type="checkbox" checked={config.email.documentUpload} onChange={e => setConfig({...config, email: {...config.email, documentUpload: e.target.checked}})} className="w-4 h-4 text-amber-500 rounded" />
              <div className="text-sm font-bold text-slate-700">Document Uploads</div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
              <input type="checkbox" checked={config.email.systemAlerts} onChange={e => setConfig({...config, email: {...config.email, systemAlerts: e.target.checked}})} className="w-4 h-4 text-amber-500 rounded" />
              <div className="text-sm font-bold text-slate-700">Critical System Alerts</div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
              <input type="checkbox" checked={config.email.dailyDigest} onChange={e => setConfig({...config, email: {...config.email, dailyDigest: e.target.checked}})} className="w-4 h-4 text-amber-500 rounded" />
              <div className="text-sm font-bold text-slate-700">Daily Admin Digest</div>
            </label>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Webhook Integration</h2>
                <p className="text-xs text-slate-500 font-medium">Send real-time payloads to Slack/Discord.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={config.webhook.enabled}
                onChange={e => setConfig({ ...config, webhook: { ...config.webhook, enabled: e.target.checked }})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          
          <div className={`p-6 ${!config.webhook.enabled && 'opacity-50 pointer-events-none'}`}>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Webhook URL</label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={config.webhook.url}
              onChange={e => setConfig({...config, webhook: {...config.webhook, url: e.target.value}})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500 transition"
            />
            <p className="text-[10px] text-slate-500 mt-2 font-medium">POST requests will be sent to this URL for all major system events.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-sm shadow-md shadow-amber-500/20 hover:scale-105 transition disabled:opacity-70 disabled:hover:scale-100"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
