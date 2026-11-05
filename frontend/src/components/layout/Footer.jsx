import React from 'react';
import { Instagram, Youtube, Phone, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import VmdLogo from '../shared/VmdLogo';

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  const phone = settings?.generalPhone || settings?.phone || '+91 98194 83036';
  const whatsappNum = (settings?.purchaseWhatsApp || settings?.livestreamWhatsApp || phone).replace(/\D/g, '');
  const email = settings?.contactEmail || 'vdhavade50@gmail.com';
  const instagram = settings?.instagram || 'https://www.instagram.com/vmdsportlive?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==';
  const youtube = settings?.youtubeChannel || 'https://www.youtube.com/@vmdsportslive';

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#060709] border-t border-white/10 text-white/70 py-16 overflow-hidden">
      {/* Top subtle hairline glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF6B00]/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/5">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <button onClick={() => scrollTo('home')} className="cursor-pointer">
              <VmdLogo className="h-10 w-auto hover:opacity-90 transition-opacity" />
            </button>
            <p className="text-white/50 text-sm max-w-sm leading-relaxed mt-2">
              VMD Sports brings cricket closer through live streaming, professional match coverage, and sports merchandise.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-xs font-sport uppercase tracking-[0.2em] text-white font-bold mb-2">
              Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-sport uppercase tracking-wider text-white/60">
              <button
                onClick={() => scrollTo('home')}
                className="text-left hover:text-white transition-colors cursor-pointer py-1"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo('about')}
                className="text-left hover:text-white transition-colors cursor-pointer py-1"
              >
                About VMD
              </button>
              <button
                onClick={() => scrollTo('services')}
                className="text-left hover:text-white transition-colors cursor-pointer py-1"
              >
                Our Services
              </button>
              <button
                onClick={() => scrollTo('merchandise')}
                className="text-left hover:text-white transition-colors cursor-pointer py-1"
              >
                Merchandise
              </button>
              <button
                onClick={() => scrollTo('livestreaming')}
                className="text-left hover:text-white transition-colors cursor-pointer py-1"
              >
                Live Streaming
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className="text-left hover:text-white transition-colors cursor-pointer py-1"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Direct Channels */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-xs font-sport uppercase tracking-[0.2em] text-white font-bold mb-2">
              Connect
            </span>
            <div className="flex flex-col gap-2.5 text-xs">
              <a
                href={`tel:${phone}`}
                className="text-white hover:text-[#FF6B00] transition-colors flex items-center justify-between group"
              >
                <span>Phone: {phone}</span>
                <ArrowUpRight size={14} className="text-white/40 group-hover:text-[#FF6B00] transition-colors" />
              </a>
              <a
                href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hi VMD Sports! I would like to get in touch.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#25D366] transition-colors flex items-center justify-between group"
              >
                <span>WhatsApp: {phone}</span>
                <ArrowUpRight size={14} className="text-white/40 group-hover:text-[#25D366] transition-colors" />
              </a>
              <div className="flex items-center gap-3 pt-3">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-all"
                  >
                    <Instagram size={16} />
                  </a>
                )}
                {youtube && (
                  <a
                    href={youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-all"
                  >
                    <Youtube size={16} />
                  </a>
                )}
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hi VMD Sports!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-sm bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {year} VMD Sports. All rights reserved.</p>
          <p className="font-sport uppercase tracking-wider text-white/30">
            More Than A Game. It's A Passion.
          </p>
        </div>
      </div>
    </footer>
  );
}
