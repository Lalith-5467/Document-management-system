'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Palette, Plus, Edit2, Trash2, X, Loader2, AlertCircle, Save, CheckCircle2, Copy
} from 'lucide-react';
import api from '@/lib/api';

interface CustomTheme {
  id: number;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  sidebar_color: string;
  header_color: string;
  card_color: string;
  text_color: string;
  border_color: string;
  hover_color: string;
  button_color: string;
  button_text_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  is_active: number;
  is_default: number;
}

const defaultTheme: Omit<CustomTheme, 'id'> = {
  theme_name: 'New Theme',
  primary_color: '#FF6B00',
  secondary_color: '#F97316',
  background_color: '#F8FAFC',
  sidebar_color: '#FFFFFF',
  header_color: '#FFFFFF',
  card_color: '#FFFFFF',
  text_color: '#0F172A',
  border_color: '#E2E8F0',
  hover_color: '#F1F5F9',
  button_color: '#FF6B00',
  button_text_color: '#FFFFFF',
  success_color: '#10B981',
  warning_color: '#F59E0B',
  error_color: '#EF4444',
  is_active: 1,
  is_default: 0
};

const PRESETS: Record<string, Omit<CustomTheme, 'id' | 'theme_name'>> = {
  'Corporate Slate': {
    primary_color: '#475569', secondary_color: '#64748b', background_color: '#f8fafc',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#0f172a', border_color: '#e2e8f0', hover_color: '#f1f5f9',
    button_color: '#475569', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#F59E0B', error_color: '#EF4444'
  },
  'Midnight Navy': {
    primary_color: '#1e3a8a', secondary_color: '#1e40af', background_color: '#eff6ff',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#172554', border_color: '#dbeafe', hover_color: '#dbeafe',
    button_color: '#1e3a8a', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#F59E0B', error_color: '#EF4444'
  },
  'Ocean Blue': {
    primary_color: '#0ea5e9', secondary_color: '#38bdf8', background_color: '#f0f9ff',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#0c4a6e', border_color: '#e0f2fe', hover_color: '#e0f2fe',
    button_color: '#0ea5e9', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#F59E0B', error_color: '#EF4444'
  },
  'Forest Green': {
    primary_color: '#166534', secondary_color: '#15803d', background_color: '#f0fdf4',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#14532d', border_color: '#dcfce7', hover_color: '#dcfce7',
    button_color: '#166534', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#F59E0B', error_color: '#EF4444'
  },
  'Crimson Red': {
    primary_color: '#b91c1c', secondary_color: '#dc2626', background_color: '#fef2f2',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#7f1d1d', border_color: '#fee2e2', hover_color: '#fee2e2',
    button_color: '#b91c1c', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#F59E0B', error_color: '#EF4444'
  }
};

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [formData, setFormData] = useState<Omit<CustomTheme, 'id'>>(defaultTheme);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/themes');
      if (res.data?.themes) {
        setThemes(res.data.themes);
      }
    } catch (err) {
      console.error('Failed to fetch themes', err);
      showToast('Failed to load themes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleOpenCreate = () => {
    setEditingTheme(null);
    setFormData(defaultTheme);
    setModalOpen(true);
  };

  const handleOpenEdit = (theme: CustomTheme) => {
    setEditingTheme(theme);
    const { id, ...rest } = theme;
    setFormData(rest);
    setModalOpen(true);
  };

  const handleDuplicate = (theme: CustomTheme) => {
    setEditingTheme(null);
    const { id, ...rest } = theme;
    setFormData({ ...rest, theme_name: `${rest.theme_name} (Copy)` });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this theme? Users using it will fallback to default.')) return;
    try {
      await api.delete(`/themes/${id}`);
      showToast('Theme deleted successfully');
      setThemes(themes.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete theme', err);
      showToast('Failed to delete theme', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTheme) {
        await api.put(`/themes/${editingTheme.id}`, formData);
        showToast('Theme updated successfully');
      } else {
        await api.post('/themes', formData);
        showToast('Theme created successfully');
      }
      setModalOpen(false);
      fetchThemes();
    } catch (err) {
      console.error('Failed to save theme', err);
      showToast('Failed to save theme', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleColorChange = (key: keyof Omit<CustomTheme, 'id' | 'theme_name'>, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const colorFields: { key: keyof Omit<CustomTheme, 'id' | 'theme_name'>, label: string }[] = [
    { key: 'primary_color', label: 'Primary Color' },
    { key: 'secondary_color', label: 'Secondary Color' },
    { key: 'background_color', label: 'Background' },
    { key: 'sidebar_color', label: 'Sidebar' },
    { key: 'header_color', label: 'Header' },
    { key: 'card_color', label: 'Card' },
    { key: 'text_color', label: 'Text' },
    { key: 'border_color', label: 'Border' },
    { key: 'hover_color', label: 'Hover' },
    { key: 'button_color', label: 'Button' },
    { key: 'button_text_color', label: 'Button Text' },
    { key: 'success_color', label: 'Success' },
    { key: 'warning_color', label: 'Warning' },
    { key: 'error_color', label: 'Error' },
  ];

  const applyPreset = (presetName: string) => {
    setFormData({ ...formData, ...PRESETS[presetName], theme_name: presetName });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-50 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-300" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-themePrimary" /> Theme Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage professional themes for users.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-bold text-sm shadow-md hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Create Theme
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-themePrimary mb-2" />
            <p className="text-sm font-medium">Loading themes...</p>
          </div>
        ) : themes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Palette className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium">No custom themes found.</p>
            <p className="text-xs mt-1">Create a professional theme for your users to choose from.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Theme Name</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Primary Color</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Preview</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {themes.map(theme => (
                  <tr key={theme.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {theme.theme_name}
                        {theme.is_default === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Default</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">ID: {theme.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        theme.is_active === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {theme.is_active === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border border-slate-200 shadow-sm" style={{ backgroundColor: theme.primary_color }} />
                        <span className="font-mono text-xs font-medium text-slate-600">{theme.primary_color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.primary_color }} title="Primary" />
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.secondary_color }} title="Secondary" />
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.background_color }} title="Background" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDuplicate(theme)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition"
                          title="Duplicate Theme"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(theme)}
                          className="p-2 rounded-xl text-slate-400 hover:text-themePrimary hover:bg-orange-50 transition"
                          title="Edit Theme"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(theme.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                          title="Delete Theme"
                        >
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingTheme ? 'Edit Theme' : 'Create New Theme'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form id="theme-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Theme Name</label>
                    <input
                      type="text"
                      required
                      value={formData.theme_name}
                      onChange={e => setFormData({ ...formData, theme_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-themePrimary"
                      placeholder="e.g., Midnight Blue"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active === 1}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300 rounded"
                      />
                      <span className="text-sm font-bold text-slate-700">Active Theme</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.is_default === 1}
                        onChange={e => setFormData({ ...formData, is_default: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-themePrimary focus:ring-themePrimary border-slate-300 rounded"
                      />
                      <span className="text-sm font-bold text-slate-700">Set as Default</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Color Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(PRESETS).map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => applyPreset(name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 flex items-center gap-2 transition"
                      >
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: PRESETS[name].primary_color }} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {colorFields.map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">{field.label}</label>
                      <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                        <input
                          type="color"
                          value={formData[field.key]}
                          onChange={e => handleColorChange(field.key, e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0 shrink-0"
                        />
                        <input
                          type="text"
                          value={formData[field.key]}
                          onChange={e => handleColorChange(field.key, e.target.value)}
                          className="w-full bg-transparent text-xs font-mono font-medium focus:outline-none uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="theme-form"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-themePrimary to-[#F97316] text-white font-bold text-sm shadow-md shadow-orange-500/20 disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {submitting ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
