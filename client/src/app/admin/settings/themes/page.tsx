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
  theme_name: 'Premium Green Theme',
  primary_color: '#16A34A',
  secondary_color: '#15803D',
  background_color: '#F0FDF4',
  sidebar_color: '#FFFFFF',
  header_color: '#FFFFFF',
  card_color: '#FFFFFF',
  text_color: '#17211B',
  border_color: '#D1FAE5',
  hover_color: '#DCFCE7',
  button_color: '#16A34A',
  button_text_color: '#FFFFFF',
  success_color: '#16A34A',
  warning_color: '#1B664B',
  error_color: '#EF4444',
  is_active: 1,
  is_default: 1
};

type ThemeColors = Omit<CustomTheme, 'id' | 'theme_name' | 'is_active' | 'is_default'>;

const PRESETS: Record<string, ThemeColors> = {
  'Corporate Slate': {
    primary_color: '#475569', secondary_color: '#64748b', background_color: '#f8fafc',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#0f172a', border_color: '#e2e8f0', hover_color: '#f1f5f9',
    button_color: '#475569', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#1B664B', error_color: '#EF4444'
  },
  'Midnight Navy': {
    primary_color: '#1e3a8a', secondary_color: '#1e40af', background_color: '#eff6ff',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#172554', border_color: '#dbeafe', hover_color: '#dbeafe',
    button_color: '#1e3a8a', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#1B664B', error_color: '#EF4444'
  },
  'Ocean Blue': {
    primary_color: '#0ea5e9', secondary_color: '#38bdf8', background_color: '#f0f9ff',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#0c4a6e', border_color: '#e0f2fe', hover_color: '#e0f2fe',
    button_color: '#0ea5e9', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#1B664B', error_color: '#EF4444'
  },
  'Forest Green': {
    primary_color: '#166534', secondary_color: '#15803d', background_color: '#f0fdf4',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#14532d', border_color: '#dcfce7', hover_color: '#dcfce7',
    button_color: '#166534', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#1B664B', error_color: '#EF4444'
  },
  'Crimson Red': {
    primary_color: '#b91c1c', secondary_color: '#dc2626', background_color: '#fef2f2',
    sidebar_color: '#ffffff', header_color: '#ffffff', card_color: '#ffffff',
    text_color: '#7f1d1d', border_color: '#fee2e2', hover_color: '#fee2e2',
    button_color: '#b91c1c', button_text_color: '#ffffff',
    success_color: '#10B981', warning_color: '#1B664B', error_color: '#EF4444'
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

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const colorFields: { key: keyof ThemeColors, label: string }[] = [
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
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-20 right-6 z-[100000] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900 dark:bg-slate-800 border border-slate-700' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-[#1B664B]" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
            <Palette className="w-6 h-6 text-[#1B664B]" /> Theme Management
            <Palette className="w-6 h-6 text-[#1B664B]" /> Theme Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Create and manage professional themes for users.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1B664B] hover:bg-[#14523C] active:bg-[#0F402E] text-white font-black text-xs shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Theme
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#1B664B] mb-2" />
            <p className="text-xs font-bold">Loading themes...</p>
          </div>
        ) : themes.length === 0 ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Palette className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No custom themes found.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Create a professional theme for your users to choose from.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <th className="w-[30%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Theme Name</th>
                  <th className="w-[18%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Status</th>
                  <th className="w-[22%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Primary Color</th>
                  <th className="w-[15%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Preview</th>
                  <th className="w-[15%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {themes.map(theme => (
                  <tr key={theme.id} className="group hover:bg-[#E8F5F0]/20 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 font-auth-heading group-hover:text-[#1B664B] transition-colors">
                        {theme.theme_name}
                        {theme.is_default === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#E8F5F0] dark:bg-emerald-950/80 text-[#1B664B] dark:text-emerald-400 border border-[#D1EBE1] dark:border-emerald-900/60 uppercase tracking-wider">Default</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">ID: {theme.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                        theme.is_active === 1
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                        {theme.is_active === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs" style={{ backgroundColor: theme.primary_color }} />
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{theme.primary_color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundColor: theme.primary_color }} title="Primary" />
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundColor: theme.secondary_color }} title="Secondary" />
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundColor: theme.background_color }} title="Background" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 inline-flex">
                        <button
                          onClick={() => handleDuplicate(theme)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1B664B] dark:hover:text-[#1B664B] hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Duplicate Theme"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(theme)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1B664B] dark:hover:text-[#1B664B] hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Edit Theme"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(theme.id)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Delete Theme"
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
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-auth-heading">
                {editingTheme ? 'Edit Theme' : 'Create New Theme'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form id="theme-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Theme Name</label>
                    <input
                      type="text"
                      required
                      value={formData.theme_name}
                      onChange={e => setFormData({ ...formData, theme_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1B664B]"
                      placeholder="e.g., Midnight Dark"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active === 1}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-[#1B664B] focus:ring-themePrimary border-slate-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Theme</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.is_default === 1}
                        onChange={e => setFormData({ ...formData, is_default: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-[#1B664B] focus:ring-themePrimary border-slate-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Set as Default</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1.5">Color Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(PRESETS).map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => applyPreset(name)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 transition cursor-pointer"
                      >
                        <div className="w-3 h-3 rounded-full shadow-2xs" style={{ backgroundColor: PRESETS[name].primary_color }} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {colorFields.map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400">{field.label}</label>
                      <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <input
                          type="color"
                          value={formData[field.key]}
                          onChange={e => handleColorChange(field.key, e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 shrink-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={formData[field.key]}
                          onChange={e => handleColorChange(field.key, e.target.value)}
                          className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-3xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="theme-form"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B664B] text-white font-black text-xs shadow-md shadow-emerald-950/20 disabled:opacity-50 transition cursor-pointer"
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
