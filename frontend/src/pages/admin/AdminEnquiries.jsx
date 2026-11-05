import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Trash2, CheckCircle2, Clock, Mail, Phone,
  Search, ArrowRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { enquiriesAPI } from '../../services/api';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await enquiriesAPI.getAll({ limit: 100 });
      if (res.data?.enquiries) {
        setEnquiries(res.data.enquiries);
      }
    } catch (err) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await enquiriesAPI.update(id, { status: newStatus });
      setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
      toast.success(`Enquiry marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update enquiry status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer inquiry?')) return;
    try {
      await enquiriesAPI.delete(id);
      toast.success('Inquiry deleted');
      setEnquiries(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      toast.error('Failed to delete inquiry');
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    if (statusFilter === 'All') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            Customer <span className="text-brand-lime">Inquiries</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
            Questions Received From Public Contact Desk & Department Channels
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {['All', 'new', 'read', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-sport uppercase tracking-wider border transition-all ${
                statusFilter === st
                  ? 'bg-brand-lime text-black border-brand-lime font-bold'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-brand-black border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-gray-500 text-xs">
            Loading inquiries...
          </div>
        ) : filteredEnquiries.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredEnquiries.map((enq) => (
              <div key={enq._id} className="p-5 sm:p-6 hover:bg-white/[0.02] transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{enq.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-sport uppercase tracking-wider bg-white/5 text-brand-lime border border-brand-lime/20">
                      {enq.serviceInterest || 'General Enquiry'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-sport uppercase tracking-wider font-bold ${
                      enq.status === 'new' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' :
                      enq.status === 'resolved' ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/30' :
                      'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {enq.status || 'new'}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(enq.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-lime" />
                    <a href={`mailto:${enq.email}`} className="text-white hover:underline">{enq.email}</a>
                  </span>
                  {enq.phone && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-brand-lime" />
                      <a href={`tel:${enq.phone}`} className="text-white hover:underline">{enq.phone}</a>
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 leading-relaxed">
                  {enq.message}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {enq.phone && (
                      <a
                        href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${enq.name}, VMD Sports received your inquiry regarding ${enq.serviceInterest}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-black font-sport uppercase tracking-wider text-[11px] font-bold transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        Reply on WhatsApp
                      </a>
                    )}
                    <a
                      href={`mailto:${enq.email}?subject=${encodeURIComponent(`VMD Sports - Response to your inquiry`)}`}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-sport uppercase tracking-wider text-[11px] transition-colors flex items-center gap-1.5"
                    >
                      <Mail className="w-3 h-3" />
                      Reply via Email
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {enq.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(enq._id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-brand-lime/10 hover:bg-brand-lime hover:text-black text-brand-lime font-sport uppercase tracking-wider text-[11px] font-bold transition-all"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(enq._id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500 text-xs">
            No inquiries matching status filter.
          </div>
        )}
      </div>

    </div>
  );
}
