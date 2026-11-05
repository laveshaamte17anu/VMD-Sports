import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, CheckCircle2, Clock, FileText, AlertCircle, XCircle,
  Calendar, MapPin, DollarSign, User, ShieldCheck, ArrowRight,
  MessageCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const WORKFLOW_STEPS = ['Pending', 'Under Review', 'Quotation Sent', 'Confirmed', 'Completed'];

export default function BookingStatusPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const { settings } = useSettings();

  const [refInput, setRefInput] = useState(initialRef);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchStatus = async (refNumber) => {
    const trimmed = (refNumber || refInput).trim();
    if (!trimmed) {
      toast.error('Please enter a booking reference number');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const res = await bookingsAPI.checkStatus(trimmed);
      if (res.data?.success && res.data.booking) {
        setBooking(res.data.booking);
        setSearchParams({ ref: trimmed });
      } else {
        setBooking(null);
        toast.error('Booking not found. Please verify the reference number.');
      }
    } catch (err) {
      setBooking(null);
      const msg = err.response?.data?.message || 'Booking not found with that reference number.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchStatus(initialRef);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return 'text-brand-lime border-brand-lime/40 bg-brand-lime/10';
      case 'Quotation Sent':
      case 'Under Review':
        return 'text-amber-400 border-amber-400/40 bg-amber-400/10';
      case 'Rejected':
      case 'Cancelled':
        return 'text-rose-400 border-rose-400/40 bg-rose-400/10';
      case 'Pending':
      default:
        return 'text-sky-400 border-sky-400/40 bg-sky-400/10';
    }
  };

  const getStepIndex = (status) => {
    if (status === 'Rejected' || status === 'Cancelled') return -1;
    return WORKFLOW_STEPS.indexOf(status);
  };

  const bookingWhatsApp = settings.bookingWhatsApp || settings.purchaseWhatsApp || '';

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-sport uppercase tracking-wider mb-3">
            <Search className="w-3.5 h-3.5" />
            Live Status Tracker
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white mb-3">
            Track Booking <span className="text-brand-lime">Status</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Check the live progress, cameraman assignment, and quotation review for your cricket match booking.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStatus();
          }}
          className="bg-brand-black border border-white/10 rounded-2xl p-4 sm:p-6 mb-10 shadow-2xl flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              placeholder="Enter Booking Reference (e.g. VMD-202611-0001)"
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-brand-lime text-brand-black font-sport uppercase tracking-wider text-sm font-black hover:bg-white transition-all shadow-lg hover:shadow-brand-lime/20 disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Check Status'
            )}
          </button>
        </form>

        {/* Status Card Result */}
        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8"
          >
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Booking Reference</span>
                <span className="font-mono text-2xl font-black text-brand-lime tracking-wider">
                  {booking.referenceNumber}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-sport uppercase tracking-widest border font-bold ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Workflow Progress Steps */}
            {booking.status !== 'Rejected' && booking.status !== 'Cancelled' ? (
              <div>
                <h3 className="text-xs font-sport uppercase tracking-widest text-gray-400 mb-6">
                  Review & Confirmation Pipeline
                </h3>
                <div className="relative">
                  {/* Connecting line */}
                  <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-white/10 -z-0" />

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {WORKFLOW_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(booking.status);
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-brand-lime text-black'
                                : isCurrent
                                ? 'bg-black border-2 border-brand-lime text-brand-lime shadow-[0_0_15px_rgba(191,255,0,0.4)]'
                                : 'bg-black/60 border border-white/20 text-gray-500'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div>
                            <span className={`text-xs font-bold block ${isCurrent ? 'text-brand-lime' : isCompleted ? 'text-white' : 'text-gray-500'}`}>
                              {step}
                            </span>
                            <span className="text-[10px] text-gray-400 hidden sm:block mt-0.5">
                              {step === 'Pending' && 'Queued'}
                              {step === 'Under Review' && 'Gear Check'}
                              {step === 'Quotation Sent' && 'Price Offer'}
                              {step === 'Confirmed' && 'Locked In'}
                              {step === 'Completed' && 'Delivered'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 text-sm">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span>This booking request was marked as {booking.status}. Please contact our support team for details.</span>
              </div>
            )}

            {/* Match & Quotation Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 block">Customer Name</span>
                <p className="font-semibold text-white text-sm">{booking.customerName}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 block">Service Requested</span>
                <p className="font-semibold text-brand-lime text-sm">{booking.serviceType}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 block">Match Date</span>
                <p className="font-semibold text-white text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-lime" />
                  {booking.matchDate ? new Date(booking.matchDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 block">Estimated Quotation</span>
                <p className="font-semibold text-white text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-brand-lime" />
                  {booking.estimatedPrice ? (
                    <span className="text-brand-lime font-mono text-base font-bold">₹{booking.estimatedPrice.toLocaleString('en-IN')}</span>
                  ) : (
                    <span className="text-gray-400 italic">Quotation being calculated</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quotation Note if available */}
            {booking.quotationDetails && (
              <div className="p-4 rounded-xl bg-brand-lime/5 border border-brand-lime/20 text-xs text-gray-300">
                <span className="text-brand-lime font-bold uppercase tracking-wider block mb-1">Quotation Breakdown:</span>
                <p className="whitespace-pre-line">{booking.quotationDetails}</p>
              </div>
            )}

            {/* Status History Timeline */}
            {booking.statusHistory && booking.statusHistory.length > 0 && (
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-xs font-sport uppercase tracking-widest text-gray-400 mb-4">
                  Activity & Status Updates
                </h4>
                <div className="space-y-3">
                  {booking.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs bg-black/30 p-3 rounded-lg border border-white/5">
                      <Clock className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white uppercase">{h.status}</span>
                          <span className="text-gray-500 font-mono text-[10px]">
                            {new Date(h.changedAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {h.note && <p className="text-gray-300 mt-1">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/book-cameraman"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                ← Submit New Booking Request
              </Link>

              {bookingWhatsApp && (
                <a
                  href={`https://wa.me/${bookingWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello VMD Sports, I am inquiring about booking reference ${booking.referenceNumber}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Chat With Coordinator
                </a>
              )}
            </div>

          </motion.div>
        )}

        {/* Empty state after search */}
        {hasSearched && !loading && !booking && (
          <div className="bg-brand-black border border-white/10 rounded-2xl p-10 text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="font-sport uppercase text-base text-white tracking-wider mb-2">No Booking Found</h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto mb-6">
              Please double check the reference format (e.g. VMD-202611-0001). Reference numbers are case-insensitive.
            </p>
            <Link
              to="/book-cameraman"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-colors"
            >
              Book A Cameraman Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
