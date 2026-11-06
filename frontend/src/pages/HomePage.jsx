import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Phone,
  MessageCircle,
  Mail,
  Instagram,
  Youtube,
  Radio,
  Camera,
  Film,
  Trophy,
  CheckCircle2,
  Tv,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { productsAPI } from '../services/api';
import { useProductClickTracker } from '../hooks/useProductClickTracker';
import { openDirectWhatsAppEnquiry } from '../utils/whatsapp';
import ProductCard from '../components/shared/ProductCard';

// ─── 4 SERVICES (IMAGE-FIRST EDITORIAL TILES) ─────────────────────────────
const SERVICES = [
  {
    title: 'Live Cricket Streaming',
    category: 'Broadcasting',
    badge: 'Multi-Cam 1080p60',
    desc: 'Broadcast-grade live streaming to YouTube, Facebook, and custom platforms with real-time scorecards, commentary, and instant replays.',
    image: '/images/live-streaming-camera.webp',
    icon: Radio,
    features: ['Real-time Scorecards', 'Instant Replay System', 'Commentary Setup'],
  },
  {
    title: 'Cricket Photography',
    category: 'High-Speed Action',
    badge: '4K Burst Stills',
    desc: 'Professional match-day stills capturing cover drives, diving saves, delivery strides, and victory celebrations in crystal clarity.',
    image: '/images/cricket-photography.webp',
    icon: Camera,
    features: ['600mm Telephoto Optics', 'Player Action Portraits', 'Podium Ceremonies'],
  },
  {
    title: 'Cricket Videography',
    category: 'Cinematography',
    badge: 'Cinema Rigs',
    desc: 'Multi-angle cinematic match recordings, slow-motion boundary replays, player profiles, and promotional highlight reels.',
    image: '/images/cricket-videography.webp',
    icon: Film,
    features: ['Gimbal-Stabilized Pitch Tracking', 'Slow-Mo Highlights', 'Player Mixtapes'],
  },
  {
    title: 'Tournament Coverage',
    category: 'Full Production',
    badge: 'End-to-End Media',
    desc: 'Complete end-to-end media coverage for club tournaments, corporate leagues, and championship events from toss to trophy presentation.',
    image: '/images/tournament-coverage.webp',
    icon: Trophy,
    features: ['Full League Packages', 'Daily Match Recaps', 'Sponsor Branding'],
  },
];

// ─── 5 FOUNDATIONAL MERCHANDISE CATEGORIES (DISTINCT IMAGES & SPECS) ────────
const FOUNDATIONAL_PRODUCTS = [
  {
    _id: '6aec300007842a09f7d89e11',
    name: 'VMD AeroDry Match Day Jersey',
    slug: 'vmd-aerodry-match-day-jersey',
    category: { name: 'T-Shirts', slug: 't-shirts' },
    categorySlug: 't-shirts',
    tech: 'Sweat-Wicking • AeroMesh Cooling',
    price: 1299,
    discountPrice: 999,
    image: '/images/vmd_cricket_jersey.jpg',
    images: ['/images/vmd_cricket_jersey.jpg', '/images/cricket-tshirt.webp'],
    badge: 'Bestseller',
  },
  {
    _id: '6aec300007842a09f7d89e07',
    name: 'VMD Pro Strike Cricket Track Pants',
    slug: 'vmd-pro-strike-cricket-track-pants',
    category: { name: 'Track Pants', slug: 'track' },
    categorySlug: 'track',
    tech: '4-Way Stretch • AeroFit • Zipper Cuffs',
    price: 2499,
    discountPrice: 1999,
    image: '/images/vmd_track_pants.jpg',
    images: ['/images/vmd_track_pants.jpg', '/images/track-pants.webp'],
    badge: 'Pro Grade',
  },
  {
    _id: '6aec300007842a09f7d89e1b',
    name: 'VMD Speedster Fielding Shorts',
    slug: 'vmd-speedster-fielding-shorts',
    category: { name: 'Shorts', slug: 'shorts' },
    categorySlug: 'shorts',
    tech: 'Ultra-Light • Deep Ball Pockets',
    price: 999,
    discountPrice: 799,
    image: '/images/vmd_cricket_shorts.jpg',
    images: ['/images/vmd_cricket_shorts.jpg', '/images/sports-shorts.webp'],
    badge: 'Field Tested',
  },
  {
    _id: '6aec300007842a09f7d89e25',
    name: 'VMD Seam Precision UV Arm Sleeves',
    slug: 'vmd-seam-precision-uv-arm-sleeves',
    category: { name: 'Sleeves', slug: 'sleeves' },
    categorySlug: 'sleeves',
    tech: 'UPF 50+ • Muscle Compression Grip',
    price: 599,
    discountPrice: 449,
    image: '/images/vmd_arm_sleeves.jpg',
    images: ['/images/vmd_arm_sleeves.jpg', '/images/arm-sleeves.webp'],
    badge: 'Sun Armor',
  },
  {
    _id: 'default-5',
    name: 'VMD Elite Cricket Gear & Accessories Kit',
    slug: 'vmd-elite-cricket-gear-accessories-kit',
    category: { name: 'Accessories', slug: 'accessories' },
    categorySlug: 'accessories',
    tech: 'Heavy-Duty • Pro Cap & Wristbands',
    price: 1899,
    discountPrice: 1499,
    image: '/images/vmd_sports_accessories.jpg',
    images: ['/images/vmd_sports_accessories.jpg', '/images/sports-accessories.webp'],
    badge: 'Complete Kit',
  },
];

// 5 Main Sportswear Categories
const CATEGORIES_LIST = [
  { name: 'All Products', slug: 'all' },
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Track Pants', slug: 'track' },
  { name: 'Shorts', slug: 'shorts' },
  { name: 'Sleeves', slug: 'sleeves' },
  { name: 'Accessories', slug: 'accessories' },
];

export default function HomePage() {
  const { settings } = useSettings();
  const { trackClick, trackWhatsappEnquiry } = useProductClickTracker();

  const [activeCategory, setActiveCategory] = useState('all');
  const [dbProducts, setDbProducts] = useState([]);

  const phone = settings?.generalPhone || settings?.phone || '+91 98194 83036';
  const whatsappNum = (settings?.purchaseWhatsApp || settings?.livestreamWhatsApp || phone).replace(/\D/g, '') || '919819483036';
  const email = settings?.contactEmail || 'vdhavade50@gmail.com';
  const instagram = settings?.instagram || 'https://www.instagram.com/vmdsportlive?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==';
  const youtube = settings?.youtubeChannel || 'https://www.youtube.com/@vmdsportslive';
  const whatsappChatUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hello VMD Sports! I would like to get in touch with you.')}`;

  // Fetch real products from backend to enrich fallback with live MongoDB data
  useEffect(() => {
    productsAPI.getAll({ limit: 20 })
      .then((res) => {
        const fetched = res.data?.products || res.data?.data || [];
        if (fetched.length > 0) {
          setDbProducts(fetched);
        }
      })
      .catch((err) => {
        console.debug('Using curated foundational products', err);
      });
  }, []);

  // Merge live DB products with foundational products to ensure all 5 categories have accurate individual images
  const products = useMemo(() => {
    const enriched = FOUNDATIONAL_PRODUCTS.map((fallback) => {
      const match = dbProducts.find((p) => p.slug === fallback.slug || p._id === fallback._id);
      if (!match) return fallback;

      const rawImg = match.images?.[0];
      const matchImg = (typeof rawImg === 'string' ? rawImg : rawImg?.url) || fallback.image;

      return {
        ...fallback,
        _id: match._id || fallback._id,
        name: match.name || fallback.name,
        price: match.price !== undefined ? match.price : fallback.price,
        discountPrice: match.discountPrice !== undefined ? match.discountPrice : fallback.discountPrice,
        category: match.category || fallback.category,
        categorySlug: match.category?.slug || fallback.categorySlug,
        image: matchImg,
        images: match.images?.length ? match.images : fallback.images,
      };
    });

    const extraDbProds = dbProducts.filter(
      (p) => !FOUNDATIONAL_PRODUCTS.some((f) => f.slug === p.slug || f._id === p._id)
    );

    return [...enriched, ...extraDbProds];
  }, [dbProducts]);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length, 't-shirts': 0, track: 0, shorts: 0, sleeves: 0, accessories: 0 };
    products.forEach((p) => {
      const catSlug = p.category?.slug || p.categorySlug;
      if (catSlug && counts[catSlug] !== undefined) {
        counts[catSlug]++;
      }
    });
    return counts;
  }, [products]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => {
      const catSlug = p.category?.slug || p.categorySlug;
      return catSlug === activeCategory;
    });
  }, [products, activeCategory]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDirectWhatsApp = (prod) => {
    openDirectWhatsAppEnquiry({
      product: prod,
      settings,
      tracker: { trackWhatsappEnquiry },
      onSuccess: ({ phoneFormatted }) => {
        toast.success(`Opening WhatsApp chat with VMD Sports (${phoneFormatted || '+91 98194 83036'})...`);
      },
      onError: (errMsg) => {
        toast.error(errMsg);
      },
    });
  };

  return (
    <div className="bg-sports-canvas text-white selection:bg-[#FF6B00] selection:text-black relative overflow-hidden">

      {/* ─── Ambient Glow Accents (Desktop Depth) ─── */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#FF6B00]/12 via-[#BFFF00]/5 to-transparent blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-[1200px] -left-48 w-96 h-96 bg-[#FF6B00]/8 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-[2200px] -right-48 w-96 h-96 bg-[#BFFF00]/6 rounded-full blur-3xl -z-10" />

      {/* ════════════════════════════════════════════════════════════════════════
          1. HERO SECTION (PREMIUM SPORTSWEAR & BROADCAST BRAND IDENTITY)
      ════════════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-32 pb-20"
      >
        {/* Cinematic Cricket Stadium Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-cricket-stadium.webp"
            alt="Cricket Stadium Floodlights and Match Action"
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-125 scale-100"
          />
          {/* Multi-layered cinematic vignette & lighting */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 50% 25%, rgba(255,107,0,0.22) 0%, transparent 60%),
                radial-gradient(circle at 80% 80%, rgba(191,255,0,0.12) 0%, transparent 50%),
                linear-gradient(180deg, rgba(7,8,10,0.85) 0%, rgba(7,8,10,0.3) 35%, rgba(7,8,10,0.85) 80%, #07080A 100%)
              `,
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">

          {/* Top Brand Tag */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md shadow-[0_0_20px_rgba(255,107,0,0.25)]"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
            <span className="text-[11px] font-sport uppercase tracking-[0.28em] text-white font-bold">
              Official Cricket Media & Sports Brand
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display uppercase tracking-tight text-white leading-[0.92] mb-6 drop-shadow-2xl"
            style={{ fontSize: 'clamp(46px, 9vw, 102px)' }}
          >
            MORE THAN A GAME.<br />
            <span className="bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#FFB800] bg-clip-text text-transparent">
              IT'S A PASSION.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/80 text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed mb-8"
          >
            VMD Sports brings cricket closer through broadcast-grade live streaming, professional match cinematography, and pro-engineered sports merchandise built for athletes who demand peak performance.
          </motion.p>

          {/* Value Highlights Pill Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden sm:flex items-center gap-6 text-xs font-sport uppercase tracking-wider text-white/60 mb-10 pb-2"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#BFFF00]" /> Multi-Cam Broadcast
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#FF6B00]" /> 4K Action Stills
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#BFFF00]" /> Pro Matchwear
            </span>
          </motion.div>

          {/* Two Primary Buttons: Shop Now & Contact Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => scrollTo('merchandise')}
              className="btn-primary w-full sm:w-auto text-xs py-4 px-9 group"
            >
              <ShoppingBag size={16} />
              <span>Shop Now</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="btn-secondary w-full sm:w-auto text-xs py-4 px-9"
            >
              <Phone size={16} />
              <span>Contact Us</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="hairline-divider" />

      {/* ════════════════════════════════════════════════════════════════════════
          2. MERCHANDISE SECTION (FEATURED PRODUCTS & 5 CATEGORIES)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="merchandise" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="section-tag">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                Athlete Apparel & Gear
              </span>
              <h2 className="section-heading">
                VMD <span className="text-[#FF6B00]">SPORTSWEAR</span>
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-white/60 text-sm leading-relaxed mb-3">
                Official cricket sportswear engineered with premium performance fabrics, athletic breathability, and pro seam construction. Order directly on WhatsApp with instant confirmation.
              </p>
              <Link
                to="/merchandise"
                className="inline-flex items-center gap-1.5 text-xs font-sport uppercase tracking-wider text-[#FF6B00] hover:text-[#BFFF00] font-bold transition-colors"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* 5 Product Categories Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = activeCategory === cat.slug;
              const count = categoryCounts[cat.slug] ?? 0;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-sm border text-xs font-sport uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${isSelected
                    ? 'bg-[#FF6B00] text-black border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.35)]'
                    : 'bg-[#0E1015] border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                >
                  <span>{cat.name}</span>
                  <span className={`ml-2 text-[10px] font-mono ${isSelected ? 'text-black/80' : 'text-white/40'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Featured Products Grid: Clean & Consistent Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod._id || prod.slug}
                  product={prod}
                  onCardClick={(p) => trackClick(p, 'card_click')}
                  onWhatsAppClick={handleDirectWhatsApp}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="hairline-divider" />

      {/* ════════════════════════════════════════════════════════════════════════
          3. ABOUT SECTION (EDITORIAL SPLIT WITH SPORTS ACCENTS)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: Professional Cricket Media Visual */}
            <div className="lg:col-span-6 relative">
              <div className="relative img-zoom-wrap rounded-sm overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] aspect-[4/3] md:aspect-[16/11] bg-[#111317]">
                <img
                  src="/images/about-cricket-media.webp"
                  alt="VMD Sports Professional Cricket Cameraman Covering Live Match"
                  className="w-full h-full object-cover filter brightness-95 contrast-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                {/* On-image status tags */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-sport uppercase tracking-[0.25em] text-black font-extrabold bg-[#BFFF00] px-3 py-1 shadow-md">
                    Live Match Crew
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] font-sport uppercase tracking-[0.25em] text-[#FF6B00] font-bold block mb-1">
                      On-Pitch Cinematography
                    </span>
                    <span className="font-display text-2xl uppercase tracking-wider text-white">
                      Capturing Every Delivery & Boundary
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Stat Accent Box */}
              <div className="hidden sm:flex absolute -bottom-6 -right-6 glass-panel p-5 border border-white/15 rounded-sm shadow-2xl items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00]">
                  <Tv size={24} />
                </div>
                <div>
                  <span className="font-display text-2xl text-white block leading-none">500+</span>
                  <span className="text-[10px] font-sport uppercase tracking-wider text-white/60">
                    Matches Broadcast
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Narrative & Core Pillars */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <span className="section-tag">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                About VMD Sports
              </span>
              <h2 className="section-heading mb-6">
                COMMITTED TO THE <span className="text-[#FF6B00]">HEART OF CRICKET.</span>
              </h2>

              <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6 font-normal">
                VMD Sports is a dedicated cricket media production and athletic merchandise brand. We bring matches alive through high-definition live streaming, broadcast-standard multi-camera coverage, and dynamic sports photography.
              </p>

              <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8 font-normal">
                Alongside our broadcast media operations, VMD Sports engineers high-performance cricket sportswear — including pro match jerseys, compression track pants, fielding shorts, and specialized accessories built for athletes who demand the best on the pitch.
              </p>

              {/* 3 Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 pt-4 border-t border-white/10">
                <div className="glass-panel p-4 rounded-sm">
                  <span className="text-[#FF6B00] text-xs font-sport uppercase tracking-widest font-bold block mb-1">01 • Media</span>
                  <span className="text-white font-sport text-sm font-semibold block">Broadcast Grade</span>
                </div>
                <div className="glass-panel p-4 rounded-sm">
                  <span className="text-[#BFFF00] text-xs font-sport uppercase tracking-widest font-bold block mb-1">02 • Stills</span>
                  <span className="text-white font-sport text-sm font-semibold block">4K Action Burst</span>
                </div>
                <div className="glass-panel p-4 rounded-sm">
                  <span className="text-[#FFB800] text-xs font-sport uppercase tracking-widest font-bold block mb-1">03 • Apparel</span>
                  <span className="text-white font-sport text-sm font-semibold block">Athlete Engineered</span>
                </div>
              </div>

              <button
                onClick={() => scrollTo('services')}
                className="text-xs font-sport uppercase tracking-[0.2em] text-[#FF6B00] hover:text-white font-bold inline-flex items-center gap-2 transition-colors cursor-pointer group"
              >
                <span>View Our Capabilities</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="hairline-divider" />

      {/* ════════════════════════════════════════════════════════════════════════
          4. SERVICES SECTION (ELEVATED INTERACTIVE EDITORIAL TILES)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <span className="section-tag">
                <span className="w-2 h-2 rounded-full bg-[#BFFF00]" />
                Media Production
              </span>
              <h2 className="section-heading">
                OUR <span className="text-white/40">SERVICES</span>
              </h2>
            </div>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              Television-grade broadcast live streaming, telephoto action stills, and tournament media packages for premier clubs, corporate leagues, and organizers.
            </p>
          </div>

          {/* 4 Editorial Visual Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div
                  key={i}
                  className="group relative flex flex-col justify-between aspect-[3/4] bg-[#0E1015] subtle-border overflow-hidden cursor-default transition-all duration-500 hover:border-[#FF6B00]/60 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,107,0,0.15)] rounded-sm"
                >
                  {/* Background Image */}
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] contrast-125 transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                  />

                  {/* Multi-layered Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080A] via-[#07080A]/60 to-black/30 pointer-events-none" />

                  {/* Top Category Tag & Icon */}
                  <div className="relative z-10 p-6 flex items-center justify-between">
                    <span className="text-[10px] font-sport uppercase tracking-[0.25em] text-[#FF6B00] font-bold px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-xs border border-white/10">
                      {svc.category}
                    </span>
                    <div className="w-9 h-9 rounded-sm bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:text-[#FF6B00] group-hover:border-[#FF6B00]/40 transition-all">
                      <Icon size={18} />
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div className="relative z-10 p-6">
                    <span className="text-[10px] font-sport uppercase tracking-widest text-[#BFFF00] font-bold block mb-1">
                      {svc.badge}
                    </span>
                    <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-2 leading-tight group-hover:text-white transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-white/70 text-xs leading-relaxed line-clamp-3 mb-4">
                      {svc.desc}
                    </p>

                    {/* Micro Feature Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                      {svc.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[9px] font-sport uppercase tracking-wider text-white/50 bg-white/[0.05] px-2 py-0.5 rounded-xs"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="hairline-divider" />

      {/* ════════════════════════════════════════════════════════════════════════
          5. LIVE STREAMING SECTION (BROADCAST CALLOUT)
      ════════════════════════════════════════════════════════════════════════ */}
      <section
        id="livestreaming"
        className="relative py-28 md:py-40 overflow-hidden flex items-center justify-center text-center"
      >
        {/* Full-Width Stadium Broadcast Image Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/livestream-stadium-broadcast.webp"
            alt="Cricket Stadium Match Broadcast Setup"
            className="w-full h-full object-cover object-center filter brightness-[0.30] contrast-125 scale-100 hover:scale-105 transition-transform duration-10000"
          />
          {/* Deep dark gradient with stadium illumination overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 50% 50%, rgba(255,107,0,0.15) 0%, transparent 65%),
                linear-gradient(180deg, #07080A 0%, rgba(7,8,10,0.4) 40%, rgba(7,8,10,0.85) 85%, #07080A 100%)
              `,
            }}
          />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">

          {/* Red REC Recording Badge */}
          <div className="mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-red-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-sport uppercase tracking-[0.28em] text-white font-bold">
              Live Broadcast Production Desk
            </span>
          </div>

          <h2
            className="font-display uppercase tracking-tight text-white leading-none mb-6 drop-shadow-2xl"
            style={{ fontSize: 'clamp(42px, 8vw, 92px)' }}
          >
            YOUR MATCH.<br />
            <span className="bg-gradient-to-r from-white via-white/80 to-[#FF6B00] bg-clip-text text-transparent">
              OUR BROADCAST.
            </span>
          </h2>

          <p className="text-white/80 text-base sm:text-lg md:text-xl font-normal max-w-xl mx-auto leading-relaxed mb-10">
            Professional multi-camera cricket live streaming, synchronized scoreboards, and instant replays by VMD Sports.
          </p>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-10 text-xs font-sport uppercase tracking-wider text-white/70">
            <div className="glass-panel p-3 rounded-sm border border-white/10">
              <span className="text-[#FF6B00] font-bold block mb-0.5">Multi-Cam</span>
              <span>2-6 HD Feeds</span>
            </div>
            <div className="glass-panel p-3 rounded-sm border border-white/10">
              <span className="text-[#BFFF00] font-bold block mb-0.5">Graphics</span>
              <span>Live Scoreboard</span>
            </div>
            <div className="glass-panel p-3 rounded-sm border border-white/10">
              <span className="text-[#FF6B00] font-bold block mb-0.5">Instant Replay</span>
              <span>1080p60 Slow-Mo</span>
            </div>
            <div className="glass-panel p-3 rounded-sm border border-white/10">
              <span className="text-[#BFFF00] font-bold block mb-0.5">Audio</span>
              <span>Dual Commentary</span>
            </div>
          </div>

          {/* Two Buttons: Call Now & WhatsApp Us */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${phone}`}
              className="btn-primary w-full sm:w-auto text-xs py-4 px-9"
            >
              <Phone size={16} />
              <span>Call Production Desk</span>
            </a>
            <a
              href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                ' Hello ! Im interested in your sportswear collection.Could you share some details.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full sm:w-auto text-xs py-4 px-9"
            >
              <MessageCircle size={16} />
              <span>WhatsApp for Streaming</span>
            </a>
          </div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="hairline-divider" />

      {/* ════════════════════════════════════════════════════════════════════════
          6. CONTACT SECTION (ELEGANT DIRECT CHANNELS)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="section-tag">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
            Direct Communication
          </span>
          <h2 className="section-heading mb-4">
            CONTACT <span className="text-white/40">VMD SPORTS</span>
          </h2>
          <p className="text-white/60 text-base max-w-md mx-auto mb-14">
            Connect with our team directly for match coverage, live streaming bookings, or merchandise enquiries.
          </p>

          {/* Contact Direct Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-14">
            {/* Phone */}
            <div className="p-8 glass-panel-interactive rounded-sm flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00] mb-1">
                <Phone size={22} />
              </div>
              <span className="text-xs font-sport uppercase tracking-[0.2em] text-white/50">Direct Line</span>
              <a href={`tel:${phone}`} className="font-display text-2xl text-white hover:text-[#FF6B00] transition-colors">
                {phone}
              </a>
              <a
                href={`tel:${phone}`}
                className="btn-secondary text-xs py-2.5 px-6 mt-2"
              >
                <Phone size={14} /> Call Now
              </a>
            </div>

            {/* WhatsApp */}
            <div className="p-8 glass-panel-interactive rounded-sm flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] mb-1">
                <MessageCircle size={22} />
              </div>
              <span className="text-xs font-sport uppercase tracking-[0.2em] text-white/50">WhatsApp Channel</span>
              <span className="font-display text-2xl text-white">Direct Chat</span>
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-xs py-2.5 px-6 mt-2"
              >
                <MessageCircle size={14} /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Direct Email Channel */}
          {email && (
            <div className="flex items-center justify-center pt-8 border-t border-white/10 text-xs font-sport uppercase tracking-wider text-white/60">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 hover:text-[#FF6B00] transition-colors"
              >
                <Mail size={16} className="text-[#FF6B00]" /> {email}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Floating Instant WhatsApp Button */}
      <a
        href={whatsappChatUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,211,102,0.6)]"
      >
        <MessageCircle size={26} fill="black" />
      </a>

    </div>
  );
}
