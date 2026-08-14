'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard, Search, Filter, Download, Mail, CheckCircle2,
  AlertCircle, Clock, RefreshCw, FileText, Plus, Eye, DollarSign,
  Printer, Send, ShieldCheck, ArrowUpRight, ChevronRight, X, User, Zap, Trash2, Edit3
} from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

export interface AdminBillInvoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  billedDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionRef: string;
}

const SAMPLE_INVOICES: AdminBillInvoice[] = [
  {
    id: 'INV-1001',
    invoiceNo: 'INV-2026-3505',
    customerName: 'Joe Developer',
    customerEmail: 'joe@docvault.com',
    customerPhone: '+91 98765 43210',
    planName: 'Pro Plan',
    billingCycle: 'monthly',
    baseAmount: 299,
    taxAmount: 53.82,
    totalAmount: 352.82,
    billedDate: '24 Jul 2026',
    dueDate: '24 Jul 2026',
    status: 'paid',
    paymentMethod: 'Card (•••• 9012)',
    transactionRef: 'TXN-9842105'
  },
  {
    id: 'INV-1002',
    invoiceNo: 'INV-2026-001',
    customerName: 'Joe Developer',
    customerEmail: 'joe@docvault.com',
    customerPhone: '+91 98765 43210',
    planName: '7-Day Free Trial',
    billingCycle: 'monthly',
    baseAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    billedDate: '24 Jul 2026',
    dueDate: '24 Jul 2026',
    status: 'paid',
    paymentMethod: 'Free Trial Promo',
    transactionRef: 'TXN-0000000'
  },
  {
    id: 'INV-1003',
    invoiceNo: 'INV-2026-3891',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@company.com',
    customerPhone: '+1 (555) 234-5678',
    planName: 'Pro Plan',
    billingCycle: 'yearly',
    baseAmount: 2870,
    taxAmount: 516.60,
    totalAmount: 3386.60,
    billedDate: '22 Jul 2026',
    dueDate: '22 Jul 2026',
    status: 'paid',
    paymentMethod: 'UPI / NetBanking',
    transactionRef: 'TXN-7738291'
  },
  {
    id: 'INV-1004',
    invoiceNo: 'INV-2026-4012',
    customerName: 'Michael Chang',
    customerEmail: 'mchang@techcorp.io',
    customerPhone: '+1 (555) 890-1234',
    planName: 'Business Plan',
    billingCycle: 'yearly',
    baseAmount: 9590,
    taxAmount: 1726.20,
    totalAmount: 11316.20,
    billedDate: '20 Jul 2026',
    dueDate: '20 Jul 2026',
    status: 'paid',
    paymentMethod: 'Corporate Wire Transfer',
    transactionRef: 'TXN-1109482'
  },
  {
    id: 'INV-1005',
    invoiceNo: 'INV-2026-4100',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@designstudio.org',
    customerPhone: '+44 20 7946 0912',
    planName: 'Pro Plan',
    billingCycle: 'monthly',
    baseAmount: 299,
    taxAmount: 53.82,
    totalAmount: 352.82,
    billedDate: '18 Jul 2026',
    dueDate: '25 Jul 2026',
    status: 'pending',
    paymentMethod: 'Pending Invoice',
    transactionRef: 'TXN-PENDING'
  },
  {
    id: 'INV-1006',
    invoiceNo: 'INV-2026-4150',
    customerName: 'David Miller',
    customerEmail: 'dmiller@fintech.net',
    customerPhone: '+1 (555) 432-1098',
    planName: 'Pro Plan',
    billingCycle: 'monthly',
    baseAmount: 299,
    taxAmount: 53.82,
    totalAmount: 352.82,
    billedDate: '15 Jul 2026',
    dueDate: '15 Jul 2026',
    status: 'refunded',
    paymentMethod: 'Card (•••• 4411)',
    transactionRef: 'TXN-REFUNDED-90'
  }
];

export default function AdminBillingCRMPage() {
  const [invoices, setInvoices] = useState<AdminBillInvoice[]>(SAMPLE_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<AdminBillInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingInvId, setDeletingInvId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Custom Bill Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newPlan, setNewPlan] = useState('Pro Plan');
  const [newAmount, setNewAmount] = useState('299');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaidCount = invoices.filter(i => i.status === 'paid').length;
  const totalPendingCount = invoices.filter(i => i.status === 'pending').length;
  const totalRefunded = invoices.filter(i => i.status === 'refunded').reduce((acc, curr) => acc + curr.totalAmount, 0);

  // UPDATE Status
  const handleUpdateStatus = (invId: string, newStatus: 'paid' | 'pending' | 'failed' | 'refunded') => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, status: newStatus } : inv));
    showToast(`Invoice ${invId} status updated to ${newStatus.toUpperCase()}`);
    if (selectedInvoice && selectedInvoice.id === invId) {
      setSelectedInvoice(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // DELETE Invoice
  const handleDeleteInvoice = (invId: string) => {
    const target = invoices.find(i => i.id === invId);
    setInvoices(prev => prev.filter(i => i.id !== invId));
    setDeletingInvId(null);
    if (selectedInvoice && selectedInvoice.id === invId) {
      setSelectedInvoice(null);
    }
    showToast(`Invoice ${target?.invoiceNo || invId} deleted successfully.`);
  };

  const handleSendReminder = (inv: AdminBillInvoice) => {
    showToast(`Payment reminder email sent to ${inv.customerEmail}`);
  };

  // CREATE Invoice
  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const base = parseFloat(newAmount) || 299;
    const tax = Math.round(base * 0.18 * 100) / 100;
    const newBill: AdminBillInvoice = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newCustName || 'New Customer',
      customerEmail: newCustEmail || 'customer@client.com',
      planName: newPlan,
      billingCycle: 'monthly',
      baseAmount: base,
      taxAmount: tax,
      totalAmount: base + tax,
      billedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'pending',
      paymentMethod: 'Generated Invoice',
      transactionRef: 'TXN-GEN-INV'
    };

    setInvoices(prev => [newBill, ...prev]);
    setShowCreateModal(false);
    showToast(`New custom bill ${newBill.invoiceNo} created and sent to ${newBill.customerEmail}`);
    setNewCustName('');
    setNewCustEmail('');
  };

  const handleDownloadPDF = (inv: AdminBillInvoice) => {
    showToast(`Downloading PDF Invoice ${inv.invoiceNo}...`);
    const invoiceText = `
============================================================
           DOCVAULT ENTERPRISE SYSTEMS - INVOICE
============================================================
Invoice Number : ${inv.invoiceNo}
Billed Date    : ${inv.billedDate}
Due Date       : ${inv.dueDate}
Status         : ${inv.status.toUpperCase()}
Transaction Ref: ${inv.transactionRef}

CUSTOMER CRM DETAILS
------------------------------------------------------------
Customer Name  : ${inv.customerName}
Customer Email : ${inv.customerEmail}
Phone Number   : ${inv.customerPhone || 'N/A'}

BILLING SUMMARY
------------------------------------------------------------
Subscription Plan : ${inv.planName} (${inv.billingCycle.toUpperCase()})
Base Amount       : ₹${inv.baseAmount.toFixed(2)}
GST Tax (18%)     : ₹${inv.taxAmount.toFixed(2)}
------------------------------------------------------------
TOTAL AMOUNT PAID : ₹${inv.totalAmount.toFixed(2)}
============================================================
Thank you for subscribing to DocVault Enterprise SaaS.
`;
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 pb-16 text-slate-900 dark:text-white font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[100000] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-[#1B664B]/30 shadow-2xl shadow-emerald-950/20 text-xs font-semibold animate-pop-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 font-auth-heading">
            <span className="w-10 h-10 rounded-2xl bg-[#E8F5F0]0/10 border border-[#D1EBE1] text-[#1B664B] flex items-center justify-center shadow-lg shrink-0">
              <CreditCard className="w-5 h-5 text-[#1B664B]" />
            </span>
            Subscription Bills & Invoice CRM CRUD
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Full Admin CRUD control: Create custom invoices, review payment records, update bill statuses, and process refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-[#1B664B] hover:opacity-90 shadow-md shadow-emerald-950/20 hover:scale-105 transition cursor-pointer">
            <Plus className="w-4 h-4" /> Create Manual Bill
          </button>

          <button
            onClick={() => {
              const csv = 'Invoice No,Customer,Email,Plan,Amount,Status,Date\n' + invoices.map(i => `${i.invoiceNo},${i.customerName},${i.customerEmail},${i.planName},${i.totalAmount},${i.status},${i.billedDate}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'crm_billing_history.csv';
              a.click();
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* 4 CRM FINANCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase font-auth-heading tracking-wider">TOTAL REVENUE</span>
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-auth-heading">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 inline-block px-2.5 py-1 rounded-md">
            {totalPaidCount} Paid Invoices
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase font-auth-heading tracking-wider">PENDING INVOICES</span>
            <span className="w-9 h-9 rounded-2xl bg-[#E8F5F0] dark:bg-emerald-950/60 border border-[#D1EBE1] dark:border-amber-800/80 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#1B664B] dark:text-[#1B664B]" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-auth-heading">{totalPendingCount}</p>
          <p className="text-[10px] font-extrabold text-[#1B664B] dark:text-[#1B664B] bg-[#E8F5F0] dark:bg-emerald-950/60 border border-[#D1EBE1] dark:border-amber-800/60 inline-block px-2.5 py-1 rounded-md">
            Awaiting Payments
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase font-auth-heading tracking-wider">REFUNDS PROCESSED</span>
            <span className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-auth-heading">₹{totalRefunded.toLocaleString('en-IN')}</p>
          <p className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 inline-block px-2.5 py-1 rounded-md">
            Refunded to Source
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase font-auth-heading tracking-wider">TOTAL BILLS</span>
            <span className="w-9 h-9 rounded-2xl bg-[#E8F5F0] dark:bg-emerald-950/60 border border-[#D1EBE1] dark:border-emerald-800/60 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#1B664B] dark:text-[#1B664B]" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-auth-heading">{invoices.length}</p>
          <p className="text-[10px] font-extrabold text-[#1B664B] dark:text-[#1B664B] bg-[#E8F5F0] dark:bg-emerald-950/60 border border-[#D1EBE1] dark:border-emerald-800/60 inline-block px-2.5 py-1 rounded-md">
            Total CRM Records
          </p>
        </div>
      </div>

      {/* CRM BILLING INVOICES TABLE (READ & CRUD ACTIONS) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Customer Bills & Payment Records ({filteredInvoices.length})</h3>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice # or customer..."
                className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1B664B]"
              />
            </div>

            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Paid', value: 'paid' },
                { label: 'Pending', value: 'pending' },
                { label: 'Failed', value: 'failed' },
                { label: 'Refunded', value: 'refunded' }
              ]}
              className="min-w-[150px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Plan & Cycle</th>
                <th className="py-3.5 px-4">Billed Date</th>
                <th className="py-3.5 px-4">Total Billed</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">CRM Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-[#E8F5F0] dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white group-hover:text-[#1B664B] transition-colors">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white font-auth-heading group-hover:text-[#1B664B] transition-colors">{inv.customerName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{inv.customerEmail}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-700 dark:text-slate-300">{inv.planName}</p>
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">{inv.billingCycle}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {inv.billedDate}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                    ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80' :
                      inv.status === 'pending' ? 'bg-[#E8F5F0] text-[#1B664B] border-[#D1EBE1] dark:bg-emerald-950/60 dark:text-[#1B664B] dark:border-amber-800/80' :
                      inv.status === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800/80' :
                      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/80'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 inline-flex">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#1B664B] dark:hover:text-[#1B664B] hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        title="View / Edit CRM Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        title="Download PDF Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleSendReminder(inv)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#1B664B] dark:hover:text-[#1B664B] hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        title="Send Email Reminder"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>

                      {/* DELETE INVOICE BUTTON */}
                      <button
                        onClick={() => setDeletingInvId(inv.id)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        title="Delete Invoice Record"
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

      {/* CRM BILL DETAIL & UPDATE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-6 my-6 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#1B664B]">Invoice #{selectedInvoice.invoiceNo}</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-auth-heading">{selectedInvoice.customerName}</h3>
                <p className="text-2xs text-slate-500 dark:text-slate-400 font-mono">Ref: {selectedInvoice.transactionRef}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                selectedInvoice.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80' :
                selectedInvoice.status === 'pending' ? 'bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-[#1B664B] border-[#D1EBE1] dark:border-amber-800/80' :
                'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80'
              }`}>
                {selectedInvoice.status.toUpperCase()}
              </span>
            </div>

            {/* CRM Customer Profile Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="font-extrabold uppercase text-[10px] text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1B664B]" /> Customer CRM Details
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <div><span className="text-slate-500 dark:text-slate-400">Name:</span> <strong className="text-slate-900 dark:text-white">{selectedInvoice.customerName}</strong></div>
                <div><span className="text-slate-500 dark:text-slate-400">Email:</span> <span className="font-mono">{selectedInvoice.customerEmail}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Phone:</span> {selectedInvoice.customerPhone || 'N/A'}</div>
                <div><span className="text-slate-500 dark:text-slate-400">Plan:</span> <span className="font-bold text-[#1B664B]">{selectedInvoice.planName}</span></div>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Base Plan Fee</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{selectedInvoice.baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>GST Tax (18%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{selectedInvoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount Paid</span>
                <span className="text-[#1B664B] font-mono">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Update Billing Status</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'paid')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  Mark Paid
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'pending')}
                  className="px-3.5 py-2 rounded-xl bg-[#E8F5F0] dark:bg-emerald-950/60 text-[#1B664B] dark:text-[#1B664B] border border-[#D1EBE1] dark:border-amber-800/80 text-xs font-bold hover:bg-[#E8F5F0] transition cursor-pointer"
                >
                  Mark Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'refunded')}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  Process Refund
                </button>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs hover:bg-rose-100 transition cursor-pointer"
              >
                Delete Invoice
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="px-4 py-2.5 rounded-xl bg-[#1B664B] hover:opacity-90 text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL BILL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Create Custom CRM Invoice</h3>

            <form onSubmit={handleCreateBill} className="space-y-3">
              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[10px] text-slate-400">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Acme Corp / John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1B664B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold uppercase text-[10px] text-slate-400">Customer Email</label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="john@acme.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#1B664B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-[10px] text-slate-400">Subscription Plan</label>
                  <CustomSelect
                    value={newPlan}
                    onChange={(val) => setNewPlan(val)}
                    options={[
                      { label: 'Pro Plan', value: 'Pro Plan' },
                      { label: 'Business Plan', value: 'Business Plan' },
                      { label: 'Custom Plan', value: 'Custom Plan' }
                    ]}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold uppercase text-[10px] text-slate-400">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1B664B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-white bg-[#1B664B] hover:opacity-90 shadow-md shadow-emerald-950/20 transition cursor-pointer font-auth-heading">
                Generate & Send Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE INVOICE CONFIRMATION MODAL */}
      {deletingInvId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-pop-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white font-auth-heading">Delete Invoice Record?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Are you sure you want to permanently delete this invoice record from the system?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingInvId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInvoice(deletingInvId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-md transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
