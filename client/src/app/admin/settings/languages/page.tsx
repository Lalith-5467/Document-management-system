'use client';

import React, { useState, useEffect } from 'react';
import { 
  Languages, Plus, Edit2, Trash2, X, AlertCircle, Save, CheckCircle2
} from 'lucide-react';

interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  is_active: number;
  is_default: number;
}

const INITIAL_LANGUAGES: Language[] = [
  { id: 1, code: 'en', name: 'English', nativeName: 'English', is_active: 1, is_default: 1 },
  { id: 2, code: 'fr', name: 'French', nativeName: 'Français', is_active: 1, is_default: 0 },
  { id: 3, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', is_active: 1, is_default: 0 },
  { id: 4, code: 'es', name: 'Spanish', nativeName: 'Español', is_active: 0, is_default: 0 },
];

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  
  const [formData, setFormData] = useState<Omit<Language, 'id'>>({
    code: '', name: '', nativeName: '', is_active: 1, is_default: 0
  });
  
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const stored = localStorage.getItem('dms_admin_languages');
    if (stored) {
      setLanguages(JSON.parse(stored));
    } else {
      setLanguages(INITIAL_LANGUAGES);
      localStorage.setItem('dms_admin_languages', JSON.stringify(INITIAL_LANGUAGES));
    }
  }, []);

  const saveToStorage = (data: Language[]) => {
    setLanguages(data);
    localStorage.setItem('dms_admin_languages', JSON.stringify(data));
  };

  const handleOpenCreate = () => {
    setEditingLang(null);
    setFormData({ code: '', name: '', nativeName: '', is_active: 1, is_default: 0 });
    setModalOpen(true);
  };

  const handleOpenEdit = (lang: Language) => {
    setEditingLang(lang);
    const { id, ...rest } = lang;
    setFormData(rest);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const lang = languages.find(l => l.id === id);
    if (lang?.is_default === 1) {
      showToast('Cannot delete the default language.', 'error');
      return;
    }
    if (confirm('Are you sure you want to delete this language?')) {
      saveToStorage(languages.filter(l => l.id !== id));
      showToast('Language deleted successfully');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.nativeName) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    let updated = [...languages];

    if (formData.is_default === 1) {
      updated = updated.map(l => ({ ...l, is_default: 0 }));
      formData.is_active = 1; 
    }

    if (editingLang) {
      updated = updated.map(l => l.id === editingLang.id ? { ...formData, id: l.id } : l);
      showToast('Language updated successfully');
    } else {
      const newId = updated.length > 0 ? Math.max(...updated.map(l => l.id)) + 1 : 1;
      updated.push({ ...formData, id: newId });
      showToast('Language created successfully');
    }

    if (!updated.some(l => l.is_default === 1) && updated.length > 0) {
      updated[0].is_default = 1;
      updated[0].is_active = 1;
    }

    saveToStorage(updated);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed bottom-5 right-5 z-[9999] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-300" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-auth-heading">
            <Languages className="w-6 h-6 text-emerald-500" /> Language Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Configure translation options and language preferences for users.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" /> Add Language
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Language Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Code</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {languages.map(lang => (
                <tr key={lang.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {lang.name}
                      {lang.is_default === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Default</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{lang.nativeName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-600 uppercase bg-slate-100 px-2 py-1 rounded-md">{lang.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      lang.is_active === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {lang.is_active === 1 ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(lang)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition"
                        title="Edit Language"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lang.id)}
                        disabled={lang.is_default === 1}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Delete Language"
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 font-auth-heading">
                {editingLang ? 'Edit Language' : 'Add New Language'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Language Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="e.g., German"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Native Name</label>
                    <input
                      type="text"
                      required
                      value={formData.nativeName}
                      onChange={e => setFormData({ ...formData, nativeName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                      placeholder="e.g., Deutsch"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Language Code (ISO)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="e.g., de or de-DE"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                    <input 
                      type="checkbox" 
                      checked={formData.is_active === 1}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Enable Language</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">Allow users to select this language in their portal.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                    <input 
                      type="checkbox" 
                      checked={formData.is_default === 1}
                      onChange={e => setFormData({ ...formData, is_default: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Set as Default</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">Used automatically for new users and unauthenticated visitors.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-black text-xs hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-105 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingLang ? 'Save Changes' : 'Create Language'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
