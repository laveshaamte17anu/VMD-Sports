import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Search, Filter, MessageCircle, ChevronRight,
  Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail, Calendar, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsAPI } from '../../services/api';

const STATUS_FILTERS = [
  'All',
  'Pending',
  'Under Review',
  'Quotation Sent',
  'Confirmed',
  'Completed',
  'Rejected',
  'Cancelled'
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (selectedStatus !== 'All') params.status = selectedStatus;
      const res = await bookingsAPI.getAll(params);
      if (res.data?.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.referenceNumber?.toLowerCase().includes(term) ||
      b.customerName?.toLowerCase().includes(term) ||
      b.mobileNumber?.toLowerCase().includes(term) ||
      b.tournamentName?.toLowerCase().includes(term) ||
      b.matchLocation?.toLowerCase().includes(term)
    );
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return 'text-brand-lime bg-brand-lime/10 border-brand-lime/30';
      case 'Pending':
      case 'Under Review':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Quotation Sent':
        return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'Rejected':
      case 'Cancelled':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-6">

      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            Cameraman <span className="text-brand-lime">Bookings Roster</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
            Review Match Requests, Issue Quotations, and Dispatch Crews
          </p>
        </div>
      </div>

      {/* ─── Filter Pills & Search ─── */}
      <div className="bg-brand-black border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference number, customer name, mobile, venue, or tournament..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-xs"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-sport uppercase tracking-wider transition-all border ${
                selectedStatus === st
                  ? 'bg-brand-lime text-black border-brand-lime font-bold shadow-[0_0_15px_rgba(191,255,0,0.3)]'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Bookings Table / Cards ─── */}
      <div className="bg-brand-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-16 text-center text-gray-500">
            <div className="w-6 h-6 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading booking requests...
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-gray-400 uppercase font-sport tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Reference</th>
                  <th className="py-3.5 px-4 font-semibold">Customer & Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Service Type</th>
                  <th className="py-3.5 px-4 font-semibold">Match Date & Ground</th>
                  <th className="py-3.5 px-4 font-semibold">Quotation / Est.</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Reference */}
                    <td className="py-4 px-4 font-mono font-bold text-brand-lime">
                      <Link to={`/admin/bookings/${b._id}`} className="hover:underline">
                        {b.referenceNumber}
                      </Link>
                      <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                        {new Date(b.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-sm block leading-tight">{b.customerName}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`https://wa.me/${b.mobileNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-gray-400 hover:text-[#25D366] font-mono flex items-center gap-1"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3 h-3 text-[#25D366]" />
                          {b.mobileNumber}
                        </a>
                      </div>
                      <span className="text-[10px] text-gray-500 block">{b.email}</span>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4 text-gray-300">
                      <span className="font-medium text-white block">{b.serviceType}</span>
                      <span className="text-[10px] text-gray-500 block">{b.expectedDuration}</span>
                    </td>

                    {/* Match Date & Ground */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white block">
                        {b.matchDate ? new Date(b.matchDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                      <span className="text-[11px] text-gray-400 block max-w-xs truncate" title={b.matchLocation}>
                        {b.matchLocation}
                      </span>
                      {b.tournamentName && (
                        <span className="text-[10px] text-brand-lime block">
                          🏆 {b.tournamentName}
                        </span>
                      )}
                    </td>

                    {/* Quotation */}
                    <td className="py-4 px-4 font-mono">
                      {b.estimatedPrice ? (
                        <span className="text-brand-lime font-bold">
                          ₹{b.estimatedPrice.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Not set</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-sport tracking-wider border font-bold ${getStatusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/admin/bookings/${b._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-lime hover:text-black text-gray-300 font-sport uppercase text-[11px] tracking-wider transition-colors"
                      >
                        Manage
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500">
            <CalendarCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="font-sport uppercase text-sm text-white tracking-wider mb-1">No Bookings Found</h3>
            <p className="text-xs text-gray-500">No requests match the selected status filter or search query.</p>
          </div>
        )}
      </div>

    </div>
  );
}
