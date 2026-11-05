import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
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
  const whatsappNum = (settings?.purchaseWhatsApp || settings?.livestreamWhatsApp || phone).replace(/\D/g, '');

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
            ? 'bg-[#07080A]/90 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
            : 'bg-gradient-to-b from-[#07080A]/90 via-[#07080A]/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Official VMD Logo */}
          <button
            onClick={() => scrollTo('home')}
            className="flex items-center gap-2 group select-none cursor-pointer"
            aria-label="VMD Sports – Home"
          >
            <VmdLogo className="h-9 md:h-11 w-auto" priority={true} />
          </button>

          {/* Desktop Nav: Home | About | Services | Merchandise | Live Streaming | Contact */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
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

          {/* Right Action: Clean Direct Contact CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollTo('contact')}
              className="hidden sm:inline-flex border border-[#FF6B00]/40 bg-[#FF6B00]/10 text-white hover:bg-[#FF6B00] hover:text-black text-xs font-sport uppercase tracking-widest font-bold py-2.5 px-5 rounded-sm transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(255,107,0,0.35)] cursor-pointer"
            >
              Contact Us
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 text-white hover:text-[#FF6B00] transition-colors cursor-pointer"
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
            className="fixed inset-0 z-40 bg-[#0B0B0B] flex flex-col justify-between p-8 pt-24"
          >
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className={`text-left py-2 font-display text-3xl uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer ${
                      isActive ? 'text-[#FF6B00]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
                  </button>
                );
              })}
            </nav>

            <div className="flex flex-col gap-3 pt-8 border-t border-white/10">
              <a
                href={`tel:${phone}`}
                className="btn-secondary w-full justify-center py-3.5 text-xs flex items-center gap-2"
              >
                <Phone size={14} /> Call {phone}
              </a>
              <a
                href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                  'Hi VMD Sports! I would like to enquire about your services.'
                )}`}
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
