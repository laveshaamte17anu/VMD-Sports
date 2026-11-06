import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, MessageCircle, Instagram, Youtube } from 'lucide-react';
import VmdLogo from '../shared/VmdLogo';
import { useSettings } from '../../context/SettingsContext';

const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Merchandise', id: 'merchandise' },
  { label: 'Live Streaming', id: 'livestreaming' },
  { label: 'Contact', id: 'contact' },
];

export default function Navbar() {
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const phone = settings?.generalPhone || settings?.phone || '+91 98194 83036';
  const whatsappNum = (settings?.purchaseWhatsApp || settings?.livestreamWhatsApp || phone).replace(/\D/g, '') || '919819483036';
  const instagram = settings?.instagram || 'https://www.instagram.com/vmdsportlive?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==';
  const youtube = settings?.youtubeChannel || 'https://www.youtube.com/@vmdsportslive';
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hello VMD Sports! I would like to get in touch with you.')}`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      // Detect current visible section
      const sections = NAV_LINKS.map((l) => document.getElementById(l.id));
      const scrollPos = window.scrollY + 150;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(NAV_LINKS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#07080A]/95 backdrop-blur-xl border-b border-white/10 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
            : 'bg-gradient-to-b from-[#07080A]/95 via-[#07080A]/50 to-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-2 sm:gap-4">
          {/* Official VMD Logo */}
          <button
            onClick={() => scrollTo('home')}
            className="flex items-center gap-2 group select-none cursor-pointer flex-shrink-0"
            aria-label="VMD Sports – Home"
          >
            <VmdLogo className="h-8 sm:h-9 md:h-11 w-auto" priority={true} />
          </button>

          {/* Desktop Nav: Home | About | Services | Merchandise | Live Streaming | Contact */}
          <nav className="hidden xl:flex items-center gap-7" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`text-xs font-sport uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer relative py-1 ${
                    isActive
                      ? 'text-white font-extrabold'
                      : 'text-white/60 hover:text-white font-semibold'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#FF6B00] shadow-[0_0_10px_#FF6B00]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Top Social Icons & CTA Area (Clearly visible at the top without scrolling) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Top Header Social Icons Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0E1015]/80 p-1 sm:p-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
              <span className="hidden md:inline-flex text-[10px] font-sport uppercase tracking-wider text-white/50 font-bold pl-2 pr-1 select-none">
                Follow Us
              </span>

              {/* Instagram Icon */}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow VMD Sports on Instagram"
                  title="Follow on Instagram"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-[#E1306C] hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_0_16px_rgba(221,42,123,0.6)]"
                >
                  <Instagram size={15} />
                </a>
              )}

              {/* YouTube Icon */}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to VMD Sports on YouTube"
                  title="Watch on YouTube"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:border-red-500 hover:bg-[#FF0000] hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_0_16px_rgba(255,0,0,0.6)]"
                >
                  <Youtube size={15} />
                </a>
              )}

              {/* WhatsApp Icon */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with VMD Sports on WhatsApp"
                title="Direct WhatsApp"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#25D366]/15 border border-[#25D366]/35 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_0_16px_rgba(37,211,102,0.6)]"
              >
                <MessageCircle size={15} />
              </a>
            </div>

            {/* Desktop Contact CTA */}
            <button
              onClick={() => scrollTo('contact')}
              className="hidden lg:inline-flex border border-[#FF6B00]/40 bg-[#FF6B00]/10 text-white hover:bg-[#FF6B00] hover:text-black text-xs font-sport uppercase tracking-widest font-bold py-2.5 px-4 sm:px-5 rounded-sm transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(255,107,0,0.35)] cursor-pointer"
            >
              Contact Us
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="xl:hidden p-2 text-white hover:text-[#FF6B00] transition-colors cursor-pointer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[#0B0B0B] flex flex-col justify-between p-6 sm:p-8 pt-24 overflow-y-auto"
          >
            {/* Mobile Drawer Social Links Header */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-sport uppercase tracking-widest text-white/50 font-bold">
                Connect With VMD
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]"
                >
                  <MessageCircle size={15} />
                </a>
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white"
                  >
                    <Instagram size={15} />
                  </a>
                )}
                {youtube && (
                  <a
                    href={youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400"
                  >
                    <Youtube size={15} />
                  </a>
                )}
              </div>
            </div>

            <nav className="flex flex-col gap-4 py-6">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className={`text-left py-2 font-display text-2xl sm:text-3xl uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer ${
                      isActive ? 'text-[#FF6B00]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
                  </button>
                );
              })}
            </nav>

            <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
              <a
                href={`tel:${phone}`}
                className="btn-secondary w-full justify-center py-3.5 text-xs flex items-center gap-2"
              >
                <Phone size={14} /> Call {phone}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full justify-center py-3.5 text-xs font-bold flex items-center gap-2"
              >
                <MessageCircle size={15} /> WhatsApp Us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
