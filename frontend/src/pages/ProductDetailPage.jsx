import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Share2,
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
  Heart,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, settingsAPI } from '../services/api';
import { DEFAULT_3D_PRODUCTS } from './MerchandisePage';
import { useProductClickTracker } from '../hooks/useProductClickTracker';

const WHATSAPP_FALLBACK = '919999999999';
const CALL_FALLBACK = '+91 99999 99999';

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
          <div className="h-14 bg-brand-lime/20 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Stock Indicator ─── */
function StockIndicator({ stock }) {
  if (stock === 0)
    return (
      <span className="flex items-center gap-1.5 text-red-400 text-sm">
        <XCircle size={14} /> Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
        <AlertCircle size={14} /> Only {stock} left
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-brand-lime text-sm">
      <CheckCircle size={14} /> In Stock
    </span>
  );
}

/* ─── Related Product Card ─── */
function RelatedCard({ product }) {
  const rawImg = product.images?.[0];
  const img =
    (typeof rawImg === 'string' ? rawImg : rawImg?.url) ||
    '/images/vmd_cricket_jersey.jpg';
  const price = product.discountPrice || product.price;
  return (
    <Link to={`/merchandise/${product.slug}`} className="group">
      <div className="card-dark overflow-hidden">
        <div className="product-img-wrap h-40">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <p className="text-white text-sm font-bold line-clamp-2 group-hover:text-brand-lime transition-colors">
            {product.name}
          </p>
          <p className="text-brand-lime font-bold mt-1 text-sm">₹{price}</p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Page ─── */
export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [mainImg, setMainImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);

  // ── Click tracking ──
  const { trackClick, trackWhatsappEnquiry } = useProductClickTracker();

  /* Helper to set fallback product */
  const applyFallback = (targetSlug) => {
    const fallback = DEFAULT_3D_PRODUCTS.find((p) => p.slug === targetSlug) || DEFAULT_3D_PRODUCTS[0];
    if (fallback) {
      setProduct({
        ...fallback,
        description:
          fallback.description ||
          `Engineered for professional cricket athletes, the ${fallback.name} delivers athletic performance, moisture control, and iconic VMD sports aesthetics.`,
        sizes: [
          { size: 'S', stock: 12 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 30 },
          { size: 'XL', stock: 18 },
          { size: 'XXL', stock: 8 },
        ],
        colors: [
          { name: 'Stealth Black & Lime', hex: '#BFFF00' },
          { name: 'Onyx Monochrome', hex: '#111111' },
        ],
        material: 'Breathable High-Performance Micro-Poly Stretch Fabric',
        careInstructions: 'Machine wash cold inside out. Do not tumble dry. Line dry in shade.',
        totalStock: 35,
      });
      setMainImg(0);
      setSelectedSize('M');
      setSelectedColor('Stealth Black & Lime');
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
        setSelectedSize(p.sizes?.[0]?.size || p.sizes?.[0] || 'M');
        setSelectedColor(p.colors?.[0]?.name || p.colors?.[0] || 'Default');
        setQty(1);

        // Track detail_view for real products (not fallbacks)
        trackClick(p, 'detail_view');

        /* Fetch related */
        if (p.category?.slug || p.category?._id) {
          productsAPI
            .getAll({
              category: p.category.slug || p.category._id,
              limit: 4,
              page: 1,
            })
            .then((r) => {
              const list = r.data?.products || r.data?.data || [];
              setRelated(list.filter((x) => x._id !== p._id).slice(0, 4));
            })
            .catch(() => {
              setRelated(DEFAULT_3D_PRODUCTS.filter((x) => x.slug !== slug).slice(0, 4));
            });
        }
      })
      .catch(() => {
        applyFallback(slug);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  /* Fetch settings */
  useEffect(() => {
    settingsAPI
      .getPublic()
      .then((r) => setSettings(r.data?.settings || r.data?.data || r.data))
      .catch(() => {});
  }, []);

  /* Helpers */
  const whatsappNumber =
    settings?.purchaseWhatsApp ||
    settings?.whatsappNumber ||
    settings?.contact?.whatsapp ||
    WHATSAPP_FALLBACK;
  const callNumber =
    settings?.generalPhone || settings?.phone || settings?.contact?.phone || CALL_FALLBACK;

  const rawImages = product?.images?.length > 0 ? product.images : [];
  const images = rawImages.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
  if (images.length === 0) images.push('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop');

  const displayPrice = product?.discountPrice || product?.price || 0;
  const hasDiscount =
    product?.discountPrice && product.discountPrice < product.price;
  const savingsPct = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;
  const totalPrice = displayPrice * qty;

  /* Sizes can be objects {size, stock} or strings */
  const sizes = product?.sizes || [];
  const sizeIsObject = sizes.length > 0 && typeof sizes[0] === 'object';

  const getSizeStock = (sz) => {
    if (!sizeIsObject) return product?.stock;
    const found = sizes.find(
      (s) => s.size === sz || s === sz,
    );
    return typeof found === 'object' ? found.stock : product?.stock;
  };

  const handleWhatsApp = async () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    // Track the WhatsApp enquiry BEFORE opening the app
    if (product?._id && !String(product._id).startsWith('default-')) {
      trackWhatsappEnquiry(product).catch(() => {});
    }

    const productUrl = `https://vmd-sports.vercel.app/merchandise/${product?.slug || ''}`;
    const msg =
      `Hello VMD Sports! 👋\n\nI want to order:\n` +
      `🏏 *${product.name}*\n` +
      (selectedSize  ? `📐 Size: ${selectedSize}\n`   : '') +
      (selectedColor ? `🎨 Color: ${selectedColor}\n` : '') +
      `🔢 Quantity: ${qty}\n` +
      `💰 Price: ₹${totalPrice}\n` +
      `🔗 Product Link: ${productUrl}\n\n` +
      `Please confirm availability and payment details. Thank you!`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`,
      '_blank',
    );
  };

  const handleCall = () => {
    window.location.href = `tel:${callNumber.replace(/\s/g, '')}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.name,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const prevImg = () =>
    setMainImg((p) => (p === 0 ? images.length - 1 : p - 1));
  const nextImg = () =>
    setMainImg((p) => (p === images.length - 1 ? 0 : p + 1));

  /* ─── 404 ─── */
  if (notFound)
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center px-4">
          <Package size={72} className="text-white/10 mx-auto mb-6" />
          <h1 className="text-white font-display text-5xl uppercase mb-4">
            404
          </h1>
          <p className="text-white/50 mb-8">Product not found.</p>
          <Link to="/merchandise" className="btn-primary">
            <ChevronLeft size={16} />
            Back to Shop
          </Link>
        </div>
      </div>
    );

  /* ─── Loading ─── */
  if (loading)
    return (
      <div className="min-h-screen bg-brand-dark pt-24">
        <DetailSkeleton />
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Zoom overlay */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
          >
            <motion.img
              src={images[mainImg]}
              alt={product?.name}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white"
              onClick={() => setZoomed(false)}
            >
              <XCircle size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-sm text-white/40 mb-8 flex-wrap">
          <Link
            to="/"
            className="hover:text-brand-lime transition-colors flex items-center gap-1"
          >
            <Home size={13} /> Home
          </Link>
          <ChevronRight size={13} />
          <Link
            to="/merchandise"
            className="hover:text-brand-lime transition-colors"
          >
            Merchandise
          </Link>
          <ChevronRight size={13} />
          {product?.category?.name && (
            <>
              <span className="hover:text-brand-lime transition-colors">
                {product.category.name}
              </span>
              <ChevronRight size={13} />
            </>
          )}
          <span className="text-white/70 line-clamp-1">{product?.name}</span>
        </nav>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* ─── LEFT: Gallery ─── */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Main image */}
            <div className="relative bg-brand-gray-3 aspect-square overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={mainImg}
                  src={images[mainImg]}
                  alt={product?.name}
                  className="w-full h-full object-contain cursor-zoom-in"
                  onClick={() => setZoomed(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 glass-dark p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:border-brand-lime/50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 glass-dark p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:border-brand-lime/50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 glass-dark p-1.5 text-white/40 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn size={12} /> Click to zoom
              </div>

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-3 glass-dark px-2 py-1 text-xs text-white/60">
                  {mainImg + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImg(i)}
                    className={`flex-shrink-0 w-20 h-20 border-2 overflow-hidden transition-all ${
                      mainImg === i
                        ? 'border-brand-lime'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ─── RIGHT: Details ─── */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Category Badge */}
            {product?.category?.name && (
              <span className="inline-flex items-center gap-1.5 bg-brand-lime text-brand-black text-xs font-bold font-sport uppercase tracking-widest px-3 py-1">
                <Tag size={11} />
                {product.category.name}
              </span>
            )}

            {/* Name */}
            <h1 className="font-display text-4xl md:text-5xl text-white uppercase leading-none tracking-tight">
              {product?.name}
            </h1>

            {/* Price */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-brand-lime font-bold text-4xl">
                ₹{displayPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-white/40 text-xl line-through">
                    ₹{product.price}
                  </span>
                  <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold px-2 py-0.5">
                    {savingsPct}% OFF
                  </span>
                </>
              )}
            </div>

            {hasDiscount && (
              <p className="text-green-400 text-sm">
                You save ₹{product.price - product.discountPrice}!
              </p>
            )}

            {/* Stock */}
            <StockIndicator stock={product?.stock} />

            {/* Description */}
            {product?.description && (
              <p className="text-white/60 leading-relaxed text-sm border-l-2 border-brand-lime/30 pl-4">
                {product.description}
              </p>
            )}

            <div className="neon-line" />

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div>
                <label className="label-dark">
                  Select Size
                  {selectedSize && (
                    <span className="ml-2 text-brand-lime normal-case tracking-normal font-normal">
                      — {selectedSize}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizes.map((sz) => {
                    const szVal = typeof sz === 'object' ? sz.size : sz;
                    const szStock = getSizeStock(szVal);
                    const isOOS = szStock === 0;
                    return (
                      <button
                        key={szVal}
                        onClick={() => !isOOS && setSelectedSize(szVal)}
                        disabled={isOOS}
                        title={
                          isOOS
                            ? 'Out of stock'
                            : szStock <= 5
                            ? `Only ${szStock} left`
                            : 'In stock'
                        }
                        className={`min-w-[52px] h-12 text-sm font-bold font-sport uppercase border-2 transition-all relative ${
                          isOOS
                            ? 'border-white/10 text-white/20 cursor-not-allowed line-through'
                            : selectedSize === szVal
                            ? 'border-brand-lime bg-brand-lime text-brand-black'
                            : 'border-white/30 text-white hover:border-brand-lime hover:text-brand-lime'
                        }`}
                      >
                        {szVal}
                        {szStock !== undefined && szStock <= 5 && szStock > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-yellow-500 rounded-full text-[8px] flex items-center justify-center text-black font-bold">
                            {szStock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product?.colors?.length > 0 && (
              <div>
                <label className="label-dark">
                  Color
                  {selectedColor && (
                    <span className="ml-2 text-brand-lime normal-case tracking-normal font-normal">
                      — {selectedColor}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm font-sport uppercase border-2 transition-all ${
                        selectedColor === color
                          ? 'border-brand-lime text-brand-lime'
                          : 'border-white/20 text-white/60 hover:border-brand-lime/50 hover:text-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="label-dark">Quantity</label>
              <div className="flex items-center gap-0 mt-2 w-fit border border-white/20">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-r border-white/20"
                >
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center text-white font-bold text-lg select-none">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) =>
                      product?.stock ? Math.min(product.stock, q + 1) : q + 1,
                    )
                  }
                  className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-l border-white/20"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Total */}
            {qty > 1 && (
              <div className="glass-dark p-3 flex items-center justify-between">
                <span className="text-white/60 text-sm">Total ({qty} items)</span>
                <span className="text-brand-lime font-bold text-xl">
                  ₹{totalPrice}
                </span>
              </div>
            )}

            <div className="neon-line" />

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsApp}
                disabled={product?.stock === 0}
                className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageCircle size={18} />
                Order on WhatsApp
              </button>
              <button
                onClick={handleCall}
                className="btn-secondary flex-1 justify-center"
              >
                <Phone size={18} />
                Call Us
              </button>
              <button
                onClick={handleShare}
                className="btn-ghost px-4 py-3 flex items-center justify-center gap-2"
                title="Share"
              >
                <Share2 size={18} />
                <span className="sm:hidden">Share</span>
              </button>
            </div>

            {/* Material & Care */}
            {(product?.material || product?.careInstructions) && (
              <div className="glass-dark p-4 space-y-3">
                <h4 className="text-white/70 text-xs font-sport uppercase tracking-widest flex items-center gap-2">
                  <Info size={12} />
                  Material & Care
                </h4>
                {product.material && (
                  <p className="text-white/60 text-sm">
                    <span className="text-white/40">Material:</span>{' '}
                    {product.material}
                  </p>
                )}
                {product.careInstructions && (
                  <p className="text-white/60 text-sm">
                    <span className="text-white/40">Care:</span>{' '}
                    {product.careInstructions}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Related Products ─── */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="neon-line mb-10" />
            <div className="flex items-center gap-4 mb-8">
              <div>
                <p className="section-subtitle">More Products</p>
                <h2 className="font-display text-3xl text-white uppercase mt-1">
                  You May Also Like
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <RelatedCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
