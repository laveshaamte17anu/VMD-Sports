import React, { useState, useEffect } from 'react';
import {
  Settings, Phone, MessageSquare, Mail, Globe, Youtube,
  Instagram, Facebook, Twitter, MapPin, Save, RefreshCw, CheckCircle, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsAPI, uploadAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettings() {
  const { refreshSettings } = useSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [settings, setSettings] = useState({
    purchaseWhatsApp: '919819483036',
    livestreamWhatsApp: '919819483036',
    bookingWhatsApp: '919819483036',
    generalPhone: '+91 98194 83036',
    contactEmail: 'vdhavade50@gmail.com',
    bookingEmail: '',
    brandName: 'VMD Sports',
    tagline: "Behind Every Great Match, There's a Story.",
    logoUrl: '',
    youtubeChannel: 'https://www.youtube.com/@vmdsportslive',
    youtubeChannelName: 'VMD Sports Live',
    instagram: 'https://www.instagram.com/vmdsportlive?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==',
    facebook: '',
    twitter: '',
    footerAbout: '',
    address: '',
    livestreamInfo: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getAdmin();
      if (res.data?.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('logo', file);

    try {
      setUploadingLogo(true);
      const res = await uploadAPI.logo(data);
      if (res.data?.url) {
        setSettings(prev => ({ ...prev, logoUrl: res.data.url }));
        toast.success('Logo uploaded! Click Save Settings to persist.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Logo upload failed. You can also paste an image URL.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await settingsAPI.update(settings);
      if (res.data?.success) {
        toast.success('Website settings updated successfully!');
        if (refreshSettings) await refreshSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 text-xs">
        <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading website configurations...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            Website & <span className="text-brand-lime">Contact Settings</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
            Configure Purchase Numbers, Live Stream Hotline, Brand Identity & Social Channels
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-black hover:bg-white transition-all shadow-[0_0_20px_rgba(191,255,0,0.3)] disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Contact Numbers & WhatsApp Routing */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-brand-lime mb-2">
            <MessageSquare className="w-4 h-4" />
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              1. Configurable Contact Numbers (WhatsApp & Call)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Each service routes inquiries to its dedicated WhatsApp phone number without any hardcoded numbers. Include country code without symbols (e.g. 919876543210).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Merchandise Purchase WhatsApp
              </label>
              <input
                type="text"
                name="purchaseWhatsApp"
                value={settings.purchaseWhatsApp}
                onChange={handleChange}
                placeholder="e.g. 919876543210"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Used for pre-filled WhatsApp merchandise orders from product cards.
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Live Streaming WhatsApp / Hotline
              </label>
              <input
                type="text"
                name="livestreamWhatsApp"
                value={settings.livestreamWhatsApp}
                onChange={handleChange}
                placeholder="e.g. 919876543211"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Configurable separately from the merchandise purchase number.
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Cameraman Booking Enquiry WhatsApp
              </label>
              <input
                type="text"
                name="bookingWhatsApp"
                value={settings.bookingWhatsApp}
                onChange={handleChange}
                placeholder="e.g. 919876543212"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                For coordinator follow-up on booking references and status queries.
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                General Office Phone / Landline
              </label>
              <input
                type="text"
                name="generalPhone"
                value={settings.generalPhone}
                onChange={handleChange}
                placeholder="e.g. +91 22 1234 5678"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Displayed in the public website footer and contact page.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Official Email Accounts */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-brand-lime mb-2">
            <Mail className="w-4 h-4" />
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              2. Email Contacts
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                General Inquiries Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                placeholder="info@vmdsports.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Booking Desk Email
              </label>
              <input
                type="email"
                name="bookingEmail"
                value={settings.bookingEmail}
                onChange={handleChange}
                placeholder="bookings@vmdsports.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>
        </div>

        {/* 3. Brand Identity */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-brand-lime mb-2">
            <Globe className="w-4 h-4" />
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              3. Brand Identity & Tagline
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={settings.brandName}
                onChange={handleChange}
                placeholder="VMD Sports"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                placeholder="Behind Every Great Match, There's a Story."
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Custom Brand Logo URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="logoUrl"
                  value={settings.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/vmd-logo.png"
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
                />
                <label className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
              {uploadingLogo && <span className="text-[10px] text-brand-lime font-mono">Uploading logo...</span>}
            </div>
          </div>
        </div>

        {/* 4. Social Media Channels */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-brand-lime mb-2">
            <Youtube className="w-4 h-4" />
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              4. Social Media Channels & YouTube Integration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                YouTube Channel URL
              </label>
              <input
                type="url"
                name="youtubeChannel"
                value={settings.youtubeChannel}
                onChange={handleChange}
                placeholder="https://www.youtube.com/@vmdsportslive"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                YouTube Channel Name Display
              </label>
              <input
                type="text"
                name="youtubeChannelName"
                value={settings.youtubeChannelName}
                onChange={handleChange}
                placeholder="VMD Sports Live"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Instagram Profile URL
              </label>
              <input
                type="url"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                placeholder="https://www.instagram.com/vmdsportlive?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw=="
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                Facebook Page URL
              </label>
              <input
                type="url"
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/vmdsports"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>
        </div>

        {/* 5. Footer & Physical Location */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-brand-lime mb-2">
            <MapPin className="w-4 h-4" />
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              5. Footer Information & Studio Address
            </h3>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
              Footer About Blurb
            </label>
            <textarea
              rows={2}
              name="footerAbout"
              value={settings.footerAbout}
              onChange={handleChange}
              placeholder="VMD Sports – Premium cricket media, live streaming, and official merchandise brand."
              className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-lime"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
              Physical Ground / Studio Base Address
            </label>
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleChange}
              placeholder="e.g. VMD Sports Media Studio, Shivaji Park, Dadar, Mumbai - 400028"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-black hover:bg-white transition-all shadow-[0_0_20px_rgba(191,255,0,0.3)] disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save All Settings
          </button>
        </div>

      </form>

    </div>
  );
}
