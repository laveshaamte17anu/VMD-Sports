import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, MessageSquare, Send, CheckCircle,
  Clock, ShieldAlert, Radio, ShoppingBag, Camera, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { enquiriesAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function ContactPage() {
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterest: 'General Enquiry',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const purchaseWhatsApp = settings.purchaseWhatsApp || '919819483036';
  const livestreamWhatsApp = settings.livestreamWhatsApp || '919819483036';
  const bookingWhatsApp = settings.bookingWhatsApp || '919819483036';
  const contactEmail = settings.contactEmail || 'vdhavade50@gmail.com';
  const generalPhone = settings.generalPhone || '+91 98194 83036';
  const address = settings.address || 'Mumbai, Maharashtra, India';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Please enter your name');
    if (!formData.email.trim() || !formData.email.includes('@')) return toast.error('Please enter a valid email address');
    if (!formData.message.trim()) return toast.error('Please enter your message');

    try {
      setSubmitting(true);
      const res = await enquiriesAPI.submit(formData);
      if (res.data?.success) {
        setSubmitted(true);
        toast.success('Your message has been sent to VMD Sports! We will reply promptly.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again or WhatsApp us.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Hero Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-sport uppercase tracking-wider mb-4">
            <Mail className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider mb-4">
            Contact <span className="text-brand-lime">VMD Sports</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Have a question about tournament live streaming, cameraman bookings, bulk apparel orders, or media partnerships? Reach out directly.
          </p>
        </div>

        {/* ─── Main Grid: Contact Info & Form ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left: Contact Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Department Hotline Cards */}
            <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h3 className="font-sport uppercase text-sm tracking-widest text-brand-lime">
                Direct Contact Lines
              </h3>

              {/* Live Streaming Contact */}
              {livestreamWhatsApp && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-lime/10 text-brand-lime flex-shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-sport uppercase text-gray-400 block">Live Streaming Desk</span>
                    <a
                      href={`https://wa.me/${livestreamWhatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-white hover:text-brand-lime transition-colors block"
                    >
                      +{livestreamWhatsApp}
                    </a>
                  </div>
                </div>
              )}

              {/* Merchandise WhatsApp */}
              {purchaseWhatsApp && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-lime/10 text-brand-lime flex-shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-sport uppercase text-gray-400 block">Merchandise & Orders</span>
                    <a
                      href={`https://wa.me/${purchaseWhatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-white hover:text-brand-lime transition-colors block"
                    >
                      +{purchaseWhatsApp}
                    </a>
                  </div>
                </div>
              )}

              {/* Cameraman Booking WhatsApp */}
              {bookingWhatsApp && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-lime/10 text-brand-lime flex-shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-sport uppercase text-gray-400 block">Cameraman Roster Desk</span>
                    <a
                      href={`https://wa.me/${bookingWhatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-white hover:text-brand-lime transition-colors block"
                    >
                      +{bookingWhatsApp}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-lime/10 text-brand-lime flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-sport uppercase text-gray-400 block">Official Inquiries Email</span>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm text-white hover:text-brand-lime transition-colors break-all"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              {/* Office Location */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-lime/10 text-brand-lime flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-sport uppercase text-gray-400 block">Production Studio / Base</span>
                  <p className="text-sm text-white">{address}</p>
                </div>
              </div>

            </div>

            {/* Response Time Guarantee */}
            <div className="bg-brand-black border border-white/10 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-lime/10 text-brand-lime">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sport uppercase text-xs tracking-wider text-white">Rapid Response Standard</h4>
                <p className="text-xs text-gray-400">Match-day emergencies & inquiries replied within 2 hours.</p>
              </div>
            </div>

          </div>

          {/* Right: Enquiry Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-brand-lime/20 border-2 border-brand-lime flex items-center justify-center text-brand-lime mx-auto mb-6">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-2">
                    Message Dispatched Successfully
                  </h3>
                  <p className="text-gray-300 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                    Thank you, <strong className="text-white">{formData.name}</strong>. Our media coordinators have received your inquiry and will contact you via email or phone.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', serviceInterest: 'General Enquiry', message: '' });
                    }}
                    className="px-6 py-3 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-sport uppercase text-sm tracking-widest text-brand-lime mb-2">
                    Send Us A Direct Message
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                        Your Full Name <span className="text-brand-lime">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Vikram Malhotra"
                        required
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9820012345"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Email Address <span className="text-brand-lime">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. vikram@cricketleague.com"
                      required
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Service / Department
                    </label>
                    <select
                      name="serviceInterest"
                      value={formData.serviceInterest}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime text-sm"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Live Streaming Broadcast">Live Streaming Broadcast</option>
                      <option value="Cameraman Booking">Cameraman Booking</option>
                      <option value="Merchandise & Custom Jerseys">Merchandise & Custom Jerseys</option>
                      <option value="Tournament Sponsorship / Media Rights">Tournament Sponsorship / Media Rights</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Your Message / Match Logistics <span className="text-brand-lime">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your requirements, dates, locations or questions..."
                      required
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-brand-lime text-brand-black font-sport uppercase tracking-wider text-xs font-black hover:bg-white transition-all shadow-[0_0_30px_rgba(191,255,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message Now
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
