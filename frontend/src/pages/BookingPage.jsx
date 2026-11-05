import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Video, Trophy, Calendar, MapPin, Clock, FileText,
  User, Phone, Mail, CheckCircle, Copy, ArrowRight, AlertCircle,
  Sparkles, ShieldCheck, HelpCircle, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const serviceOptions = [
  {
    id: 'Cricket Photography',
    title: 'Cricket Photography',
    desc: 'High-speed action shots, batsman/bowler stills, team portraits & award ceremonies in 4K resolution.',
    icon: Camera,
    badge: 'Popular'
  },
  {
    id: 'Match Videography',
    title: 'Match Videography',
    desc: 'Cinematic multi-angle match filming, slow-motion replays, run-out & boundary coverage.',
    icon: Video,
    badge: 'High Demand'
  },
  {
    id: 'Full Match Coverage',
    title: 'Full Match Coverage',
    desc: 'Complete all-in-one package: photography, videography, umpire cameras, and edited match reels.',
    icon: Trophy,
    badge: 'All-In-One'
  },
  {
    id: 'Other Cricket Media Services',
    title: 'Other Cricket Media Services',
    desc: 'Tournament branding reels, player player-profile shoots, social media highlight packages.',
    icon: Sparkles,
    badge: 'Custom'
  }
];

export default function BookingPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    serviceType: 'Cricket Photography',
    matchDate: '',
    matchLocation: '',
    tournamentName: '',
    expectedDuration: '4 Hours (Single T20 Match)',
    additionalRequirements: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);

  const durationOptions = [
    '3-4 Hours (Single T20 Match)',
    '6-8 Hours (Single ODI / Double Header)',
    'Full Day (Multiple Matches / League Day)',
    'Multi-Day Tournament (2 to 5 Days)',
    'Extended League (1 Week+)'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectService = (serviceId) => {
    setFormData(prev => ({ ...prev, serviceType: serviceId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.matchDate) {
      toast.error('Please select the match date');
      return;
    }
    if (!formData.matchLocation.trim()) {
      toast.error('Please specify the match ground or location');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingsAPI.submit(formData);
      if (res.data?.success) {
        setSubmittedBooking(res.data.booking || { referenceNumber: res.data.referenceNumber, ...formData });
        toast.success('Booking request received! Reference: ' + res.data.referenceNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to submit booking. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefToClipboard = () => {
    if (submittedBooking?.referenceNumber) {
      navigator.clipboard.writeText(submittedBooking.referenceNumber);
      toast.success('Reference number copied to clipboard!');
    }
  };

  const bookingWhatsApp = settings.bookingWhatsApp || settings.purchaseWhatsApp || '';

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-lime/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ─── Hero Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-sport uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5" />
            Official Cameraman & Media Booking
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider mb-4">
            Book A Professional <span className="text-brand-lime">Cameraman</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            From high-stakes club tournaments and IPL-style local leagues to school finals.
            Capture every yorker, six, and celebration with broadcast-grade equipment.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/booking-status"
              className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-brand-lime transition-colors border border-white/10 hover:border-brand-lime/30 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm"
            >
              <FileText className="w-4 h-4 text-brand-lime" />
              Already have a Reference? Track Status
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ─── Success Confirmation Screen ─── */}
        <AnimatePresence>
          {submittedBooking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-14 p-8 sm:p-10 rounded-2xl bg-brand-black border border-brand-lime/40 shadow-[0_0_50px_rgba(191,255,0,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-brand-lime/20 border-2 border-brand-lime flex items-center justify-center text-brand-lime mb-6">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <span className="text-xs font-sport tracking-widest uppercase text-brand-lime mb-2">Request Submitted Successfully</span>
                <h2 className="font-display text-3xl uppercase tracking-wider text-white mb-3">
                  Your Booking Request Is Under Review
                </h2>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Thank you, <strong className="text-white">{submittedBooking.customerName}</strong>. Our production team has received your request and is verifying cameraman and equipment availability for your match date.
                </p>

                {/* Reference Number Box */}
                <div className="w-full max-w-md bg-black/80 border border-brand-lime/30 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 block">Booking Reference Number</span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-brand-lime tracking-wider">
                      {submittedBooking.referenceNumber}
                    </span>
                  </div>
                  <button
                    onClick={copyRefToClipboard}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-brand-lime/20 text-gray-300 hover:text-brand-lime transition-colors"
                    title="Copy Reference Number"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>

                {/* Important notice */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left w-full text-xs text-gray-300 mb-8 space-y-2">
                  <div className="flex items-center gap-2 text-brand-lime font-semibold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Manual Review & Pricing Quotation Notice
                  </div>
                  <p>
                    VMD Sports reviews all ground logistics and technical requirements manually. A formal quotation and cameraman assignment will be sent to your email and WhatsApp shortly.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to={`/booking-status?ref=${submittedBooking.referenceNumber}`}
                    className="px-6 py-3 rounded-xl bg-brand-lime text-brand-black font-sport uppercase tracking-wider text-sm font-bold hover:bg-white transition-all shadow-lg hover:shadow-brand-lime/20 flex items-center gap-2"
                  >
                    Track Status Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setSubmittedBooking(null);
                      setFormData({
                        customerName: '',
                        mobileNumber: '',
                        email: '',
                        serviceType: 'Cricket Photography',
                        matchDate: '',
                        matchLocation: '',
                        tournamentName: '',
                        expectedDuration: '4 Hours (Single T20 Match)',
                        additionalRequirements: ''
                      });
                    }}
                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-sport uppercase tracking-wider text-sm hover:bg-white/20 transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Workflow Explanation Banner ─── */}
        <div className="mb-12 bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <h3 className="font-sport uppercase text-sm tracking-widest text-brand-lime mb-6 text-center">
            How The VMD Cameraman Booking Works
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
            {[
              { step: '01', title: 'Submit Request', desc: 'Fill match date, ground & service details.' },
              { step: '02', title: 'Under Review', desc: 'Team checks camera gear & crew roster.' },
              { step: '03', title: 'Quotation Sent', desc: 'Receive custom transparent pricing.' },
              { step: '04', title: 'Confirmed', desc: 'Cameraman & rig assigned to your match.' },
              { step: '05', title: 'Match Day Delivery', desc: 'Coverage & high-res media handover.' },
            ].map((st, idx) => (
              <div key={idx} className="relative p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="font-mono text-2xl font-black text-brand-lime/40 block mb-1">{st.step}</span>
                <h4 className="font-bold text-white text-sm mb-1">{st.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Main Booking Form Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Form (8 Cols) */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">

              {/* 1. Select Service Type */}
              <div>
                <label className="block font-sport uppercase text-sm tracking-wider text-white mb-3">
                  1. Select Media Service <span className="text-brand-lime">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serviceOptions.map((srv) => {
                    const isSelected = formData.serviceType === srv.id;
                    const IconComponent = srv.icon;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => handleSelectService(srv.id)}
                        className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 relative ${
                          isSelected
                            ? 'bg-brand-lime/10 border-brand-lime shadow-[0_0_20px_rgba(191,255,0,0.15)]'
                            : 'bg-black/40 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-lime text-black' : 'bg-white/10 text-white'}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-sport uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-brand-lime text-black font-bold' : 'bg-white/5 text-gray-400'}`}>
                            {srv.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base mb-1">{srv.title}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">{srv.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Customer Contact Information */}
              <div>
                <label className="block font-sport uppercase text-sm tracking-wider text-white mb-3">
                  2. Contact Information <span className="text-brand-lime">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Mobile / WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. rahul@cricketclub.com"
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Match & Tournament Details */}
              <div>
                <label className="block font-sport uppercase text-sm tracking-wider text-white mb-3">
                  3. Match & Venue Logistics <span className="text-brand-lime">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Match / Tournament Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        name="matchDate"
                        value={formData.matchDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Expected Match Duration</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        name="expectedDuration"
                        value={formData.expectedDuration}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm appearance-none"
                      >
                        {durationOptions.map((opt, i) => (
                          <option key={i} value={opt} className="bg-brand-black text-white">{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Match Ground / City / Venue</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="matchLocation"
                        value={formData.matchLocation}
                        onChange={handleChange}
                        placeholder="e.g. Shivaji Park Ground #2, Mumbai"
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Tournament / League Name (Optional)</label>
                    <div className="relative">
                      <Trophy className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="tournamentName"
                        value={formData.tournamentName}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai Champions Trophy 2026"
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Additional Requirements */}
              <div>
                <label className="block font-sport uppercase text-sm tracking-wider text-white mb-2">
                  4. Additional Requirements / Special Instructions
                </label>
                <textarea
                  name="additionalRequirements"
                  rows={4}
                  value={formData.additionalRequirements}
                  onChange={handleChange}
                  placeholder="Need drone footage? Multi-camera setup? Specific player reels? Tell us here..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all text-sm"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-400">
                  <span className="text-brand-lime font-bold">No upfront payment.</span> Availability & quote confirmed within 4 hours.
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-lime text-brand-black font-sport uppercase tracking-wider text-sm font-black hover:bg-white transition-all shadow-[0_0_30px_rgba(191,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      Submit Booking Request
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Sidebar Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Equipment & Quality Guarantee */}
            <div className="bg-brand-black border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-brand-lime mb-4">
                <ShieldCheck className="w-6 h-6" />
                <h4 className="font-sport uppercase text-base text-white tracking-wider">
                  VMD Production Standard
                </h4>
              </div>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                  <span>Sony FX / Alpha series cinema lenses with 200-600mm telephoto capture</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                  <span>High frame rate (120fps / 240fps) slow-mo for bowling release & edges</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                  <span>Cloud link delivery of all raw & color-graded photographs in 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-lime flex-shrink-0 mt-0.5" />
                  <span>Experienced cricket-specialist camera operators who anticipate the game</span>
                </li>
              </ul>
            </div>

            {/* Check Status Card */}
            <div className="bg-brand-black border border-white/10 rounded-2xl p-6">
              <h4 className="font-sport uppercase text-sm text-white tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-lime" />
                Track Booking Status
              </h4>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Already submitted a request? Check live confirmation, quotation price, or assigned crew details.
              </p>
              <Link
                to="/booking-status"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-brand-lime border border-brand-lime/30 text-xs font-sport uppercase tracking-wider transition-all"
              >
                Enter Reference Number
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Direct WhatsApp Consultation */}
            {bookingWhatsApp && (
              <div className="bg-gradient-to-br from-[#25D366]/20 to-black/80 border border-[#25D366]/40 rounded-2xl p-6">
                <h4 className="font-sport uppercase text-sm text-white tracking-wider mb-2 flex items-center gap-2 text-[#25D366]">
                  <MessageSquare className="w-4 h-4" />
                  Urgent Match Booking?
                </h4>
                <p className="text-xs text-gray-300 mb-4">
                  Match tomorrow or custom multi-pitch tournament? Chat directly with the VMD Media Coordinator on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${bookingWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello VMD Sports, I would like to inquire about cameraman booking for an upcoming cricket match.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-lg"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Chat on WhatsApp
                </a>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
