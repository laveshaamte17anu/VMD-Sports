import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Tag,
  Package,
  Info,
  ZoomIn,
  Home,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, settingsAPI } from '../services/api';
import { DEFAULT_3D_PRODUCTS } from './MerchandisePage';
import { useProductClickTracker } from '../hooks/useProductClickTracker';
import {
  openDirectWhatsAppEnquiry,
  getProductPricing,
  validateAndNormalizeWhatsAppNumber,
  toAbsoluteUrl,
} from '../utils/whatsapp';
import ProductCard from '../components/shared/ProductCard';
import WhatsAppEnquiryModal from '../components/shared/WhatsAppEnquiryModal';

/* ─── Skeleton ─── */
function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="bg-white/5 h-96 w-full" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 h-20 w-20" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-4 bg-white/10 rounded w-24" />
          <div className="h-10 bg-white/10 rounded w-3/4" />
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="h-20 bg-white/10 rounded w-full" />
          <div className="h-14 bg-white/10 rounded w-full" />
          <div className="h-14 bg-[#25D366]/20 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Stock Indicator ─── */
function StockIndicator({ stock }) {
  if (stock === 0)
    return (
      <span className="flex items-center gap-1.5 text-red-400 text-sm font-sport uppercase tracking-wider font-semibold">
        <XCircle size={14} /> Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="flex items-center gap-1.5 text-amber-400 text-sm font-sport uppercase tracking-wider font-semibold">
        <AlertCircle size={14} /> Only {stock} left in stock
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-[#BFFF00] text-sm font-sport uppercase tracking-wider font-semibold">
      <CheckCircle size={14} /> In Stock (Ready to dispatch)
    </span>
  );
}

const FALLBACK_VARIANTS = {
  'vmd-aerodry-match-day-jersey': {
    colors: [
      { name: 'Neon Lime Surge', hex: '#BFFF00' },
      { name: 'Pure White Classic', hex: '#FFFFFF' },
    ],
    sizes: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 30 },
      { size: 'L', stock: 35 },
      { size: 'XL', stock: 20 },
      { size: 'XXL', stock: 10 },
    ],
    material: '100% Breathable Recycled Micro-Poly Mesh with AeroDry Ventilation',
    defaultSize: 'M',
    defaultColor: 'Neon Lime Surge',
  },
  'vmd-pro-strike-cricket-track-pants': {
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Stealth Black & Lime', hex: '#BFFF00' },
    ],
    sizes: [
      { size: 'S', stock: 12 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 25 },
      { size: 'XL', stock: 18 },
      { size: 'XXL', stock: 8 },
    ],
    material: 'Poly-Spandex Interlock (88% Polyester, 12% Spandex) with 4-Way Stretch',
    defaultSize: 'L',
    defaultColor: 'Black',
  },
  'vmd-speedster-fielding-shorts': {
    colors: [
      { name: 'Pitch Charcoal', hex: '#222222' },
      { name: 'Cricket White', hex: '#FFFFFF' },
    ],
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 30 },
      { size: 'XL', stock: 15 },
      { size: 'XXL', stock: 5 },
    ],
    material: '92% Micro-Poly, 8% Elastane with Deep Ball Pockets',
    defaultSize: 'XL',
    defaultColor: 'Pitch Charcoal',
  },
  'vmd-seam-precision-uv-arm-sleeves': {
    colors: [
      { name: 'Neon Lime Accent', hex: '#BFFF00' },
      { name: 'Stealth Black', hex: '#000000' },
    ],
    sizes: [
      { size: 'S', stock: 20 },
      { size: 'M', stock: 40 },
      { size: 'L', stock: 40 },
      { size: 'XL', stock: 20 },
    ],
    material: 'High-Tension Nylon-Spandex Compression Weave (UPF 50+)',
    defaultSize: 'M',
    defaultColor: 'Neon Lime Accent',
  },
  'vmd-elite-cricket-gear-accessories-kit': {
    colors: [
      { name: 'VMD Stealth Edition', hex: '#000000' },
      { name: 'VMD Lime Surge', hex: '#BFFF00' },
    ],
    sizes: [
      { size: 'Free Size', stock: 50 },
    ],
    material: 'Reinforced 600D Cordura & Cotton Terrycloth',
    defaultSize: 'Free Size',
    defaultColor: 'VMD Stealth Edition',
  },
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [settings, setSettings] = useState(null);
  const [related, setRelated] = useState([]);

  const [mainImg, setMainImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [enquiring, setEnquiring] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // ── Click tracking ──
  const { trackClick, trackWhatsappEnquiry } = useProductClickTracker();

  /* Helper to set fallback product */
  const applyFallback = (targetSlug) => {
    const fallback = DEFAULT_3D_PRODUCTS.find((p) => p.slug === targetSlug) || DEFAULT_3D_PRODUCTS[0];
    if (fallback) {
      const varInfo = FALLBACK_VARIANTS[fallback.slug] || {};
      setProduct({
        ...fallback,
        description:
          fallback.description ||
          `Engineered for professional cricket athletes, the ${fallback.name} delivers athletic performance, moisture control, and iconic VMD sports aesthetics.`,
        sizes: varInfo.sizes || [
          { size: 'S', stock: 12 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 30 },
          { size: 'XL', stock: 18 },
          { size: 'XXL', stock: 8 },
        ],
        colors: varInfo.colors || [
          { name: 'Stealth Black & Lime', hex: '#BFFF00' },
          { name: 'Onyx Monochrome', hex: '#111111' },
        ],
        material: varInfo.material || 'Breathable High-Performance Micro-Poly Stretch Fabric',
        careInstructions: 'Machine wash cold inside out. Do not tumble dry. Line dry in shade.',
        totalStock: fallback.totalStock || 35,
      });
      setMainImg(0);
      setSelectedSize(varInfo.defaultSize || 'M');
      setSelectedColor(varInfo.defaultColor || 'Stealth Black & Lime');
      setNotFound(false);
      setRelated(DEFAULT_3D_PRODUCTS.filter((x) => x.slug !== targetSlug).slice(0, 4));
    } else {
      setNotFound(true);
    }
  };

  /* Fetch product */
  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    productsAPI
      .getBySlug(slug)
      .then((res) => {
        const p = res.data?.product || res.data?.data || res.data;
        if (!p || !p._id) {
          applyFallback(slug);
          return;
        }
        setProduct(p);
        setMainImg(0);
        const initialSize = p.sizes?.[0]?.size || (typeof p.sizes?.[0] === 'string' ? p.sizes[0] : '') || '';
        const initialColor = p.colors?.[0]?.name || (typeof p.colors?.[0] === 'string' ? p.colors[0] : '') || '';
        setSelectedSize(initialSize);
        setSelectedColor(initialColor);

        // Track detail_view event
        trackClick(p, 'detail_view');

        // Fetch related products
        const catId = p.category?._id || p.category;
        if (catId) {
          productsAPI
            .getAll({ category: p.category?.slug, limit: 4 })
            .then((r) => {
              const rel = r.data?.products || r.data?.data || [];
              setRelated(rel.filter((x) => x._id !== p._id).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        applyFallback(slug);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, trackClick]);

  /* Update document metadata and Open Graph tags for WhatsApp link preview */
  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | VMD Sports Official Merchandise`;
      const rawImg = product.images?.[0]?.url || product.images?.[0] || product.image;
      if (rawImg) {
        const ogImage = document.querySelector("meta[property='og:image']");
        if (ogImage) {
          ogImage.setAttribute('content', toAbsoluteUrl(typeof rawImg === 'string' ? rawImg : rawImg?.url));
        }
      }
    }
  }, [product]);

  /* Fetch settings */
  useEffect(() => {
    settingsAPI
      .getPublic()
      .then((res) => setSettings(res.data?.settings || res.data?.data || res.data))
      .catch(() => {});
  }, []);

  const images = product?.images?.length
    ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
    : product?.image
    ? [product.image]
    : ['/images/vmd_cricket_jersey.jpg'];

  const pricing = getProductPricing(product);
  const price = pricing.sellingPrice;
  const originalPrice = pricing.mrp;
  const hasDiscount = pricing.hasDiscount;
  const discountPercent = pricing.discountPercent;

  const totalPrice = price * qty;
  const sizes = product?.sizes || [];
  const colors = product?.colors || [];

  const handleWhatsAppEnquiry = () => {
    // 1. Validate pricing
    if (!pricing.isValid) {
      toast.error(pricing.error || 'Product price is missing or invalid.');
      return;
    }

    // 2. Validate WhatsApp number configured in Website Settings
    const phoneValidation = validateAndNormalizeWhatsAppNumber(settings?.purchaseWhatsApp);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    // 3. Validate size selection if sizes configured
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size before enquiring.');
      return;
    }

    setShowEnquiryModal(true);
  };

  if (loading) return <DetailSkeleton />;

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#07080A] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-display text-7xl text-white/20 mb-4">404</p>
          <h2 className="text-2xl font-sport uppercase text-white font-bold mb-2">
            Product Not Found
          </h2>
          <p className="text-white/50 text-sm mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link to="/merchandise" className="btn-primary inline-flex">
            Browse All Merchandise
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080A] pt-28 pb-20 text-white">
      {/* ─── Breadcrumb ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <nav className="flex items-center gap-2 text-xs font-sport uppercase tracking-wider text-white/40">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home size={12} /> Home
          </Link>
          <span>/</span>
          <Link to="/merchandise" className="hover:text-white transition-colors">
            Merchandise
          </Link>
          <span>/</span>
          <span className="text-[#FF6B00] font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* ─── Left: Large Product Image & Gallery ─── */}
          <div className="space-y-4">
            <div
              className="relative aspect-square bg-[#0C0E12] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-4 cursor-zoom-in group select-none shadow-2xl"
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={images[mainImg]}
                alt={product.name}
                className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${
                  zoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105'
                }`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/vmd_cricket_jersey.jpg';
                }}
              />

              {hasDiscount && (
                <span className="absolute top-4 left-4 text-xs font-sport uppercase tracking-widest bg-[#FF6B00] text-black font-extrabold px-3 py-1 rounded-sm shadow-lg">
                  {discountPercent}% OFF
                </span>
              )}

              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-sport uppercase tracking-wider text-white/70 flex items-center gap-1.5 pointer-events-none">
                <ZoomIn size={12} />
                <span>{zoomed ? 'Click to reset' : 'Click to zoom'}</span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMainImg(i);
                      setZoomed(false);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      mainImg === i
                        ? 'border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.4)]'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Right: Product Details & WhatsApp Enquiry ─── */}
          <div className="space-y-6">
            
            {/* Category & Title */}
            <div>
              <span className="text-xs font-sport uppercase tracking-[0.2em] text-[#FF6B00] font-bold block mb-1">
                {product.category?.name || product.category || 'Official Merchandise'}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-white leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-3xl text-white">
                ₹{Number(price).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-base font-mono text-white/40 line-through">
                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs font-sport uppercase tracking-wider text-[#FF6B00] font-bold">
                  Save ₹{Number(originalPrice - price).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div>
              <StockIndicator stock={product.totalStock ?? product.stock ?? 25} />
            </div>

            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed border-t border-b border-white/10 py-4">
              {product.description}
            </p>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div>
                <label className="text-xs font-sport uppercase tracking-wider text-white/70 font-semibold block mb-2">
                  Select Size: <span className="text-[#FF6B00] font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map((s) => {
                    const sz = typeof s === 'object' ? s.size : s;
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-[48px] h-11 px-3 rounded-lg border text-xs font-sport uppercase tracking-wider font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF6B00] text-black border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.35)]'
                            : 'bg-white/5 border-white/15 text-white hover:border-white/30'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div>
                <label className="text-xs font-sport uppercase tracking-wider text-white/70 font-semibold block mb-2">
                  Select Color: <span className="text-white font-bold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => {
                    const colorName = typeof c === 'object' ? c.name : c;
                    const colorHex = typeof c === 'object' ? c.hex : null;
                    const isSelected = selectedColor === colorName;
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className={`h-10 px-3.5 rounded-lg border text-xs font-sport uppercase tracking-wider font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.35)]'
                            : 'bg-white/5 border-white/15 text-white hover:border-white/30'
                        }`}
                      >
                        {colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/30 flex-shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                        )}
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-xs font-sport uppercase tracking-wider text-white/70 font-semibold block mb-2">
                Quantity
              </label>
              <div className="flex items-center w-fit border border-white/20 rounded-lg overflow-hidden bg-white/5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="w-12 text-center text-white font-mono font-bold text-sm">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Total calculation for qty > 1 */}
            {qty > 1 && (
              <div className="p-3 bg-white/[0.04] border border-white/10 rounded-lg flex items-center justify-between text-xs font-sport uppercase tracking-wider">
                <span className="text-white/60">Total Amount ({qty} items):</span>
                <span className="text-base font-display text-white">
                  ₹{Number(totalPrice).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* PROMINENT DIRECT WHATSAPP ENQUIRY BUTTON */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleWhatsAppEnquiry}
                disabled={product.stock === 0 || enquiring}
                className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-sport uppercase tracking-wider font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#25D366]/20 hover:shadow-[#25D366]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <MessageCircle size={20} className="fill-current" />
                <span>{enquiring ? 'Connecting to WhatsApp...' : 'Inquiry on WhatsApp'}</span>
              </button>

              <p className="text-[11px] text-white/40 text-center font-sport tracking-wider">
                Direct chat with VMD Sports for sizes, availability, and ordering details.
              </p>
            </div>

            {/* Material & Care */}
            {(product.material || product.careInstructions) && (
              <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-2 text-xs">
                <h4 className="font-sport uppercase tracking-wider text-white/50 font-bold flex items-center gap-1.5">
                  <Info size={14} /> Material & Specifications
                </h4>
                {product.material && (
                  <p className="text-white/70">
                    <span className="text-white/40">Material:</span> {product.material}
                  </p>
                )}
                {product.careInstructions && (
                  <p className="text-white/70">
                    <span className="text-white/40">Care:</span> {product.careInstructions}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Related Products ─── */}
        {related.length > 0 && (
          <section className="mt-24 pt-12 border-t border-white/10">
            <div className="mb-8">
              <span className="text-xs font-sport uppercase tracking-[0.2em] text-[#FF6B00] font-bold block mb-1">
                You May Also Like
              </span>
              <h2 className="font-display text-2xl uppercase tracking-wider text-white">
                Related Sportswear
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p._id || p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── WhatsApp Enquiry & Attachment Preview Modal ─── */}
      <WhatsAppEnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        product={product}
        settings={settings}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        qty={qty}
        currentImage={images[mainImg] || images[0]}
        tracker={{ trackWhatsappEnquiry }}
      />
    </div>
  );
}
