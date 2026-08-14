'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Plus, Edit2, Trash2, X, AlertCircle, Save, CheckCircle2, GripVertical
} from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

interface ProfileField {
  id: number;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  is_active: boolean;
  order: number;
}

const INITIAL_FIELDS: ProfileField[] = [
  { id: 1, name: 'full_name', label: 'Full Name', type: 'text', required: true, is_active: true, order: 1 },
  { id: 2, name: 'email', label: 'Email Address', type: 'email', required: true, is_active: true, order: 2 },
  { id: 3, name: 'phone', label: 'Phone Number', type: 'text', required: false, is_active: true, order: 3 },
  { id: 4, name: 'company', label: 'Company Name', type: 'text', required: false, is_active: false, order: 4 },
];

export default function AdminProfileFieldsPage() {
  const [fields, setFields] = useState<ProfileField[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ProfileField | null>(null);
  
  const [formData, setFormData] = useState<Omit<ProfileField, 'id' | 'order'>>({
    name: '', label: '', type: 'text', required: false, is_active: true
  });
  
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const stored = localStorage.getItem('dms_admin_profile_fields');
    if (stored) {
      setFields(JSON.parse(stored));
    } else {
      setFields(INITIAL_FIELDS);
      localStorage.setItem('dms_admin_profile_fields', JSON.stringify(INITIAL_FIELDS));
    }
  }, []);

  const saveToStorage = (data: ProfileField[]) => {
    setFields(data);
    localStorage.setItem('dms_admin_profile_fields', JSON.stringify(data));
  };

  const handleOpenCreate = () => {
    setEditingField(null);
    setFormData({ name: '', label: '', type: 'text', required: false, is_active: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (field: ProfileField) => {
    setEditingField(field);
    const { id, order, ...rest } = field;
    setFormData(rest);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const field = fields.find(f => f.id === id);
    if (['full_name', 'email'].includes(field?.name || '')) {
      showToast('Core system fields cannot be deleted.', 'error');
      return;
    }
    if (confirm('Are you sure you want to delete this custom field?')) {
      saveToStorage(fields.filter(f => f.id !== id));
      showToast('Field deleted successfully');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.label) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    let updated = [...fields];

    if (editingField) {
      updated = updated.map(f => f.id === editingField.id ? { ...formData, id: f.id, order: f.order } : f);
      showToast('Field updated successfully');
    } else {
      const newId = updated.length > 0 ? Math.max(...updated.map(f => f.id)) + 1 : 1;
      const newOrder = updated.length > 0 ? Math.max(...updated.map(f => f.order)) + 1 : 1;
      updated.push({ ...formData, id: newId, order: newOrder });
      showToast('Field created successfully');
    }

    updated.sort((a, b) => a.order - b.order);
    saveToStorage(updated);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-20 right-6 z-[100000] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 ${
          toastMsg.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-[#1B664B]" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-auth-heading">
            <UserCircle className="w-6 h-6 text-[#1B664B]" /> Profile Fields
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage custom fields for user registration and profiles.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1B664B] text-white font-black text-xs shadow-md shadow-emerald-950/20 hover:opacity-90 hover:scale-105 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Custom Field
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <th className="w-12 px-6 py-4"></th>
                <th className="w-[28%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Field Label</th>
                <th className="w-[22%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Internal Name</th>
                <th className="w-[15%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Type</th>
                <th className="w-[18%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Properties</th>
                <th className="w-[17%] px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {fields.map(field => (
                <tr key={field.id} className="hover:bg-[#E8F5F0] dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-grab hover:text-[#1B664B] transition-colors" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 font-auth-heading group-hover:text-[#1B664B] transition-colors">
                      {field.label}
                      {['full_name', 'email'].includes(field.name) && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider">System</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md">{field.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{field.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${field.required ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {field.required ? 'Required' : 'Optional'}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${field.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {field.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 inline-flex">
                      <button
                        onClick={() => handleOpenEdit(field)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#1B664B] dark:hover:text-[#1B664B] hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Edit Field"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        disabled={['full_name', 'email'].includes(field.name)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition disabled:opacity-30 cursor-pointer"
                        title="Delete Field"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">
                {editingField ? 'Edit Field' : 'Add Custom Field'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Field Label</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1B664B] transition"
                    placeholder="e.g., Company Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Internal Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                      disabled={['full_name', 'email'].includes(formData.name)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1B664B] transition disabled:opacity-50"
                      placeholder="e.g., company_name"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Input Type</label>
                    <CustomSelect
                      value={formData.type}
                      onChange={(val) => setFormData({ ...formData, type: val as any })}
                      disabled={['full_name', 'email'].includes(formData.name)}
                      options={[
                        { label: 'Text', value: 'text' },
                        { label: 'Email', value: 'email' },
                        { label: 'Number', value: 'number' },
                        { label: 'Date', value: 'date' },
                        { label: 'Dropdown Select', value: 'select' },
                        { label: 'Textarea', value: 'textarea' }
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <input 
                      type="checkbox" 
                      checked={formData.required}
                      onChange={e => setFormData({ ...formData, required: e.target.checked })}
                      disabled={['full_name', 'email'].includes(formData.name)}
                      className="w-4 h-4 text-[#1B664B] focus:ring-themePrimary border-slate-300 rounded disabled:opacity-50 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Required Field</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Users must provide this information to register or update profile.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <input 
                      type="checkbox" 
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={['full_name', 'email'].includes(formData.name)}
                      className="w-4 h-4 text-[#1B664B] focus:ring-themePrimary border-slate-300 rounded disabled:opacity-50 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Enable Field</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Show this field in registration forms and user profiles.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B664B] text-white font-black text-xs shadow-md shadow-emerald-950/20 hover:opacity-90 hover:scale-105 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingField ? 'Save Changes' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
