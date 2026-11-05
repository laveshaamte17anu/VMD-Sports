import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CalendarCheck, User, Phone, Mail, MapPin, Calendar,
  Clock, DollarSign, Camera, FileText, CheckCircle2, MessageCircle,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsAPI } from '../../services/api';

const STATUS_OPTIONS = [
  'Pending',
  'Under Review',
  'Quotation Sent',
  'Confirmed',
  'Completed',
  'Rejected',
  'Cancelled'
];

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form editable states
  const [status, setStatus] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [quotationDetails, setQuotationDetails] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedCameraman, setAssignedCameraman] = useState('');

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getById(id);
      if (res.data?.booking) {
        const b = res.data.booking;
        setBooking(b);
        setStatus(b.status || 'Pending');
        setEstimatedPrice(b.estimatedPrice || '');
        setQuotationDetails(b.quotationDetails || '');
        setAdminNotes(b.adminNotes || '');
        setAssignedCameraman(b.assignedCameraman || '');
      } else {
        toast.error('Booking not found');
        navigate('/admin/bookings');
      }
    } catch (err) {
      toast.error('Failed to load booking details');
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        status,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
        quotationDetails,
        adminNotes,
        assignedCameraman
      };
      const res = await bookingsAPI.update(id, payload);
      if (res.data?.booking) {
        setBooking(res.data.booking);
        toast.success(`Booking status updated to "${status}"`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="py-20 text-center text-gray-500">
        <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading booking record...
      </div>
    );
  }

  const customerWaNumber = booking.mobileNumber.replace(/[^0-9]/g, '');
  const customerWaLink = `https://wa.me/${customerWaNumber}?text=${encodeURIComponent(
    `Hello ${booking.customerName}, this is the VMD Sports Media Team regarding your booking reference #${booking.referenceNumber} for ${booking.serviceType}.`
  )}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/bookings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold text-brand-lime">{booking.referenceNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-sport uppercase tracking-wider bg-white/10 text-white font-bold">
                {booking.status}
              </span>
            </div>
            <p className="text-gray-400 text-xs">
              Submitted on {new Date(booking.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <a
          href={customerWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md self-start sm:self-auto"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          Chat Customer on WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Customer & Match Logistics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Customer Details */}
          <div className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              Customer Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <User className="w-4 h-4 text-brand-lime flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Name</span>
                  <span className="font-bold text-white text-sm">{booking.customerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <Phone className="w-4 h-4 text-brand-lime flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Phone / WhatsApp</span>
                  <a href={`tel:${booking.mobileNumber}`} className="font-mono text-white hover:text-brand-lime">
                    {booking.mobileNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                <Mail className="w-4 h-4 text-brand-lime flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-500 uppercase block">Email</span>
                  <a href={`mailto:${booking.email}`} className="text-white hover:text-brand-lime truncate block">
                    {booking.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Match & Ground Logistics */}
          <div className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              Match Logistics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Service Type</span>
                <span className="font-bold text-white text-sm text-brand-lime">{booking.serviceType}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Match Date</span>
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-lime" />
                  {booking.matchDate ? new Date(booking.matchDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Ground / Venue</span>
                <span className="font-medium text-white flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                  {booking.matchLocation}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Duration</span>
                <span className="text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-lime" />
                  {booking.expectedDuration}
                </span>
              </div>

              {booking.tournamentName && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Tournament Name</span>
                  <span className="font-bold text-white">🏆 {booking.tournamentName}</span>
                </div>
              )}

              {booking.additionalRequirements && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Client Special Instructions</span>
                  <p className="text-gray-300 italic whitespace-pre-wrap">{booking.additionalRequirements}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right: Admin Action Form & Status Workflow (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          <form onSubmit={handleUpdate} className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              Manage Quotation & Workflow Status
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Booking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-sport uppercase tracking-wider text-xs focus:outline-none focus:border-brand-lime"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-brand-black text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Price */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Estimated Quotation Price (INR ₹)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-brand-lime absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="e.g. 15000"
                  min="0"
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-brand-lime"
                />
              </div>
            </div>

            {/* Quotation Details */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Quotation Breakdown (Visible to Customer on Status Tracker)
              </label>
              <textarea
                rows={3}
                value={quotationDetails}
                onChange={(e) => setQuotationDetails(e.target.value)}
                placeholder="e.g. Includes: 2x 4K Sony Cinema Cameras, 1x 200-600mm lens operator, full match color grading, and cloud media delivery within 48h."
                className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            {/* Assigned Cameraman */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Assigned Cameraman / Crew Lead
              </label>
              <input
                type="text"
                value={assignedCameraman}
                onChange={(e) => setAssignedCameraman(e.target.value)}
                placeholder="e.g. Ramesh Kumar (Rig #3, Sony FX6 Lead)"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                Internal Admin Notes (Logged in status history)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Called match coordinator. Pitch #2 confirmed. Rain contingency discussed."
                className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-black hover:bg-white transition-all shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save & Update Booking'}
            </button>
          </form>

          {/* Status History Timeline */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="bg-brand-black border border-white/10 rounded-2xl p-6">
              <h4 className="font-sport uppercase text-xs tracking-widest text-brand-lime mb-4">
                Status Audit Trail
              </h4>
              <div className="space-y-3">
                {booking.statusHistory.map((h, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase">{h.status}</span>
                        <span className="text-[10px] text-gray-500 font-mono">
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

        </div>

      </div>

    </div>
  );
}
