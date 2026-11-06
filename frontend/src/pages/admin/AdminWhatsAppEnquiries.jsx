import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, Package, Clock, ChevronDown, Search, Filter,
  RefreshCw, Trash2, CheckCircle2, XCircle, AlertCircle,
  StickyNote, Eye, ExternalLink, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true
  });
}

const STATUS_CONFIG = {
  'WhatsApp Opened':    { color: 'text-sky-400',    bg: 'bg-sky-400/10 border-sky-400/30',    icon: MessageCircle },
  'Contacted':          { color: 'text-brand-lime', bg: 'bg-brand-lime/10 border-brand-lime/30', icon: CheckCircle2 },
  'Order Confirmed':    { color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30',   icon: CheckCircle2 },
  'Not Interested':     { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30',       icon: XCircle },
  'Pending Confirmation': { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', icon: Clock },
};

const DATE_FILTERS = [
  { label: 'All Time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

const STATUS_FILTERS = ['All', 'WhatsApp Opened', 'Contacted', 'Order Confirmed', 'Not Interested', 'Pending Confirmation'];

// ─── Enquiry Detail Modal ─────────────────────────────────────────────────────
function EnquiryModal({ enquiry, onClose, onUpdate }) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await analyticsAPI.updateWhatsappEnquiry(enquiry._id, { status, adminNotes: notes });
      onUpdate({ ...enquiry, status, adminNotes: notes });
      toast.success('Enquiry updated');
      onClose();
    } catch {
      toast.error('Failed to update enquiry');
    } finally {
      setSaving(false);
    }
  };

  const sc = STATUS_CONFIG[status] || STATUS_CONFIG['WhatsApp Opened'];
  const ScIcon = sc.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111111] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-display text-lg uppercase tracking-wider text-white">
            Enquiry <span className="text-brand-lime">Details</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Product info with Prominent Photo */}
          <div className="flex gap-4 items-start">
            {enquiry.productImageUrl ? (
              <a
                href={enquiry.productImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Click to view full-resolution photo"
                className="relative group flex-shrink-0"
              >
                <img
                  src={enquiry.productImageUrl}
                  alt={enquiry.productName}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/cricket-tshirt.webp'; }}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-white/20 shadow-xl group-hover:scale-102 transition-transform"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono px-1.5 py-0.5 rounded text-white/80 border border-white/10">
                  Full View
                </span>
              </a>
            ) : (
              <div className="w-24 h-24 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-white font-medium">{enquiry.productName}</p>
              {enquiry.productCategory && (
                <p className="text-xs text-gray-400 mt-0.5">{enquiry.productCategory}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {enquiry.productDiscountPrice && Number(enquiry.productDiscountPrice) < Number(enquiry.productPrice) ? (
                  <>
                    <span className="text-brand-lime font-bold font-mono">
                      ₹{Number(enquiry.productDiscountPrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-white/40 text-xs font-mono line-through">
                      (MRP: ₹{Number(enquiry.productPrice).toLocaleString('en-IN')})
                    </span>
                  </>
                ) : (
                  <span className="text-brand-lime font-bold font-mono">
                    ₹{Number(enquiry.productPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {(enquiry.selectedSize || enquiry.selectedColor) && (
                <div className="flex items-center gap-2.5 mt-1.5 text-xs text-white/70">
                  {enquiry.selectedSize && <span>Size: <strong className="text-brand-lime">{enquiry.selectedSize}</strong></span>}
                  {enquiry.selectedColor && <span>Color: <strong className="text-white">{enquiry.selectedColor}</strong></span>}
                </div>
              )}
              {enquiry.productSlug && (
                <a
                  href={`https://vmd-sports.vercel.app/merchandise/${enquiry.productSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-lime/70 hover:text-brand-lime flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="w-3 h-3" /> View Product
                </a>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-gray-400 mb-1">Date</p>
              <p className="text-white font-medium">{formatDate(enquiry.enquiredAt)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-gray-400 mb-1">Time (IST)</p>
              <p className="text-white font-medium">{formatTime(enquiry.enquiredAt)}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-sport block mb-2">
              Enquiry Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-lime/50"
            >
              {Object.keys(STATUS_CONFIG).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
              <ScIcon className="w-3 h-3" />
              {status}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-sport flex items-center gap-1.5 mb-2">
              <StickyNote className="w-3 h-3" /> Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes..."
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-lime/50 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-gray-400 hover:text-white transition-colors font-sport uppercase tracking-wider">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-brand-lime text-black text-sm font-bold font-sport uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminWhatsAppEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);

  const [dateFilter, setDateFilter]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce product search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(productSearch), 400);
    return () => clearTimeout(t);
  }, [productSearch]);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (dateFilter)       params.dateFilter  = dateFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (debouncedSearch)  params.productName = debouncedSearch;

      const { data } = await analyticsAPI.getWhatsappEnquiries(params);
      setEnquiries(data.enquiries || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load WhatsApp enquiries');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, debouncedSearch]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry? This cannot be undone.')) return;
    try {
      await analyticsAPI.deleteWhatsappEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      toast.success('Enquiry deleted');
    } catch {
      toast.error('Failed to delete enquiry');
    }
  };

  const handleUpdateLocal = (updated) => {
    setEnquiries((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
  };

  const handleQuickStatus = async (id, status) => {
    try {
      await analyticsAPI.updateWhatsappEnquiry(id, { status });
      setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status } : e)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            WhatsApp <span className="text-brand-lime">Enquiries</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
            {total} total enquiry record{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { fetchEnquiries(); toast.success('Refreshed'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Product search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-lime/40"
            />
          </div>

          {/* Date filter */}
          <div className="flex flex-wrap gap-1.5">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                className={`px-3 py-2 text-xs font-sport uppercase tracking-wider rounded-lg border transition-all ${
                  dateFilter === f.value
                    ? 'bg-brand-lime text-black border-brand-lime font-bold'
                    : 'border-white/15 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-lime/40"
          >
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ─── Enquiries Table ─── */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 opacity-30 animate-spin" />
            Loading enquiries...
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-400 text-sm mb-1">No enquiries found</p>
            <p className="text-gray-600 text-xs">WhatsApp enquiries will appear here when customers click "Enquire on WhatsApp"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-5 py-3 text-gray-400 uppercase font-sport tracking-wider font-semibold">Product</th>
                  <th className="px-4 py-3 text-gray-400 uppercase font-sport tracking-wider font-semibold text-right">Price</th>
                  <th className="px-4 py-3 text-gray-400 uppercase font-sport tracking-wider font-semibold">Date & Time</th>
                  <th className="px-4 py-3 text-gray-400 uppercase font-sport tracking-wider font-semibold">Status</th>
                  <th className="px-4 py-3 text-gray-400 uppercase font-sport tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {enquiries.map((enq) => {
                  const sc = STATUS_CONFIG[enq.status] || STATUS_CONFIG['WhatsApp Opened'];
                  const ScIcon = sc.icon;

                  return (
                    <tr key={enq._id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Product with Prominent Thumbnail */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          {enq.productImageUrl ? (
                            <img
                              src={enq.productImageUrl}
                              alt={enq.productName}
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/cricket-tshirt.webp'; }}
                              className="w-14 h-14 object-cover rounded-xl border border-white/15 shadow-md flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[180px]">{enq.productName}</p>
                            {enq.productCategory && (
                              <p className="text-gray-500 text-[10px] mt-0.5">{enq.productCategory}</p>
                            )}
                            {(enq.selectedSize || enq.selectedColor) && (
                              <p className="text-brand-lime/80 text-[10px] mt-0.5 font-mono">
                                {enq.selectedSize && `Size: ${enq.selectedSize}`} {enq.selectedColor && `• ${enq.selectedColor}`}
                              </p>
                            )}
                            {enq.adminNotes && (
                              <p className="text-amber-400/70 text-[10px] mt-0.5 truncate max-w-[180px]">
                                📝 {enq.adminNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 text-right">
                        {enq.productDiscountPrice && Number(enq.productDiscountPrice) < Number(enq.productPrice) ? (
                          <>
                            <span className="text-brand-lime font-mono font-bold block">
                              ₹{Number(enq.productDiscountPrice).toLocaleString('en-IN')}
                            </span>
                            <div className="text-white/40 text-[10px] font-mono line-through block">
                              MRP: ₹{Number(enq.productPrice).toLocaleString('en-IN')}
                            </div>
                          </>
                        ) : (
                          <span className="text-brand-lime font-mono font-bold block">
                            ₹{Number(enq.productPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-4">
                        <p className="text-white/70 font-mono">{formatDate(enq.enquiredAt)}</p>
                        <p className="text-gray-500 font-mono text-[10px]">{formatTime(enq.enquiredAt)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} font-sport uppercase tracking-wider`}>
                          <ScIcon className="w-3 h-3" />
                          {enq.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick status shortcuts */}
                          {enq.status === 'WhatsApp Opened' && (
                            <button
                              onClick={() => handleQuickStatus(enq._id, 'Contacted')}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-lime/10 text-brand-lime border border-brand-lime/20 hover:bg-brand-lime/20 transition-colors font-sport uppercase"
                              title="Mark as Contacted"
                            >
                              Contacted
                            </button>
                          )}
                          {enq.status === 'Contacted' && (
                            <button
                              onClick={() => handleQuickStatus(enq._id, 'Order Confirmed')}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20 transition-colors font-sport uppercase"
                              title="Confirm Order"
                            >
                              Confirm
                            </button>
                          )}

                          <button
                            onClick={() => setSelected(enq)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="View / Edit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(enq._id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selected && (
        <EnquiryModal
          enquiry={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => { handleUpdateLocal(updated); setSelected(null); }}
        />
      )}
    </div>
  );
}
