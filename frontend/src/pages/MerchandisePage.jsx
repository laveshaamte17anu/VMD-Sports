import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  Tag,
  ArrowUpDown,
  Filter,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, settingsAPI } from '../services/api';

const WHATSAPP_NUMBER_FALLBACK = '919999999999';
const PRODUCTS_PER_PAGE = 12;

export const DEFAULT_3D_PRODUCTS = [
  {
    _id: 'default-1',
    name: 'VMD Pro Strike Cricket Track Pants',
    slug: 'vmd-pro-strike-cricket-track-pants',
    price: 2499,
    discountPrice: 1999,
    category: { name: 'Track Pants', slug: 'track' },
    images: ['/images/vmd_track_pants.jpg'],
    totalStock: 25,
    isFeatured: true,
  },
  {
    _id: 'default-2',
    name: 'VMD AeroDry Match Day Jersey',
    slug: 'vmd-aerodry-match-day-jersey',
    price: 1299,
    discountPrice: 999,
    category: { name: 'T-Shirts', slug: 't-shirts' },
    images: ['/images/vmd_cricket_jersey.jpg'],
    totalStock: 35,
    isFeatured: true,
  },
  {
    _id: 'default-3',
    name: 'VMD Speedster Fielding Shorts',
    slug: 'vmd-speedster-fielding-shorts',
    price: 999,
    discountPrice: 799,
    category: { name: 'Shorts', slug: 'shorts' },
    images: ['/images/vmd_cricket_shorts.jpg'],
    totalStock: 30,
    isFeatured: true,
  },
  {
    _id: 'default-4',
    name: 'VMD Seam Precision UV Arm Sleeves',
    slug: 'vmd-seam-precision-uv-arm-sleeves',
    price: 599,
    discountPrice: 449,
    category: { name: 'Sleeves', slug: 'sleeves' },
    images: ['/images/vmd_arm_sleeves.jpg'],
    totalStock: 40,
    isFeatured: true,
  },
  {
    _id: 'default-5',
    name: 'VMD Elite Cricket Gear & Accessories Kit',
    slug: 'vmd-elite-cricket-gear-accessories-kit',
    price: 1899,
    discountPrice: 1499,
    category: { name: 'Accessories', slug: 'accessories' },
    images: ['/images/vmd_sports_accessories.jpg'],
    totalStock: 50,
    isFeatured: true,
  },
];

export const DEFAULT_CATEGORIES = [
  { name: 'Track Pants', slug: 'track' },
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Shorts', slug: 'shorts' },
  { name: 'Sleeves', slug: 'sleeves' },
  { name: 'Accessories', slug: 'accessories' },
];

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="card-dark animate-pulse">
      <div className="bg-white/5 h-64 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-5 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-10 bg-white/10 rounded w-full mt-2" />
      </div>
    </div>
  );
}

/* ─── Stock Badge ─── */
function StockBadge({ stock }) {
  if (stock === undefined || stock === null) return null;
  if (stock === 0)
    return (
      <span className="text-xs font-sport uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5">
        Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="text-xs font-sport uppercase tracking-widest bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-2 py-0.5">
        Only {stock} Left
      </span>
    );
  return (
    <span className="text-xs font-sport uppercase tracking-widest bg-brand-lime/20 text-brand-lime border border-brand-lime/30 px-2 py-0.5">
      In Stock
    </span>
  );
}

/* ─── Product Card ─── */
function ProductCard({ product, whatsappNumber }) {
  const {
    name,
    slug,
    images,
    price,
    discountPrice,
    category,
    totalStock,
    stock: legacyStock,
  } = product;
  const stock = totalStock !== undefined ? totalStock : legacyStock;

  const displayPrice = discountPrice || price;
  const hasDiscount = Boolean(discountPrice && price && discountPrice < price);
  const rawImg = images && images.length > 0 ? images[0] : null;
  const imgSrc =
    (typeof rawImg === 'string' ? rawImg : rawImg?.url) ||
    '/images/vmd_cricket_jersey.jpg';

  const handleWhatsApp = () => {
    const msg = `Hello VMD Sports! I would like to order:\n• Product: ${name}\n• Price: ₹${displayPrice}\n• Category: ${category?.name || 'VMD Official Merchandise'}\nPlease confirm availability and payment details.`;
    const encoded = encodeURIComponent(msg);
    const num = whatsappNumber || WHATSAPP_NUMBER_FALLBACK;
    window.open(`https://wa.me/${num}?text=${encoded}`, '_blank');
  };

  return (
    <motion.div
      className="card-dark group flex flex-col merch-card overflow-hidden border border-white/10 hover:border-brand-lime/40 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6 }}
    >
      {/* 3D Product Image Display */}
      <div className="product-img-wrap relative h-64 bg-black/60 overflow-hidden flex items-center justify-center">
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />
        {/* Subtle radial lighting reflection */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity" />

        {/* Category badge over image */}
        {category?.name && (
          <span className="absolute top-3 left-3 bg-brand-lime text-black font-sport font-black text-[11px] uppercase tracking-wider px-2.5 py-1 shadow-lg shadow-brand-lime/20 z-10">
            {category.name}
          </span>
        )}

        {/* 3D Render Badge */}
        <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-brand-orange/40 text-brand-orange font-sport text-[10px] uppercase tracking-widest px-2 py-0.5 z-10">
          3D Render
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-2.5 bg-gradient-to-b from-[#111111] to-[#0a0a0a]">
        <h3 className="text-white font-sport font-bold text-base leading-snug line-clamp-2 group-hover:text-brand-lime transition-colors">
          {name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-brand-lime font-display text-2xl tracking-tight">
            ₹{displayPrice?.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-white/40 text-sm line-through">₹{price?.toLocaleString('en-IN')}</span>
          )}
          {hasDiscount && (
            <span className="bg-brand-orange/20 text-brand-orange text-[11px] font-bold px-2 py-0.5 border border-brand-orange/40">
              {Math.round(((price - discountPrice) / price) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="pt-1">
          <StockBadge stock={stock} />
        </div>

        {/* Actions - Direct WhatsApp Order & View Details */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <button
            onClick={handleWhatsApp}
            disabled={stock === 0}
            className="btn-whatsapp w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed text-xs py-3 font-sport uppercase tracking-wider font-bold shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40"
          >
            <MessageCircle size={15} />
            Order on WhatsApp
          </button>
          <Link
            to={`/merchandise/${slug}`}
            className="btn-secondary w-full justify-center text-xs py-2.5 font-sport uppercase tracking-wider"
          >
            Product Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function MerchandisePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  /* Fetch settings for WhatsApp number */
  useEffect(() => {
    settingsAPI
      .getPublic()
      .then((res) => setSettings(res.data?.settings || res.data?.data || res.data))
      .catch(() => {});
  }, []);

  /* Fetch categories */
  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => {
        const cats = res.data?.categories || res.data?.data || res.data || [];
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  /* Fetch products */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PRODUCTS_PER_PAGE,
        sort,
      };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (search.trim()) params.search = search.trim();

      const res = await productsAPI.getAll(params);
      const data = res.data;
      setProducts(data?.data || data?.products || []);
      setTotalPages(data?.totalPages || data?.pagination?.totalPages || 1);
      setTotalCount(data?.total || data?.pagination?.total || 0);
    } catch {
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, activeCategory, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* Reset page on filter change */
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPage(1);
  };
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };
  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const whatsappNumber =
    settings?.purchaseWhatsApp ||
    settings?.whatsappNumber ||
    settings?.contact?.whatsapp ||
    WHATSAPP_NUMBER_FALLBACK;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* ─── Page Header ─── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #BFFF00 0, #BFFF00 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-brand-dark" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.p
            className="section-subtitle mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            VMD Sports
          </motion.p>
          <motion.h1
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            MERCHAN
            <span className="gradient-lime-text">DISE</span>
          </motion.h1>
          <motion.p
            className="text-white/50 mt-4 text-lg max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Premium cricket sports gear crafted for champions.
          </motion.p>
        </div>

        <div className="neon-line mt-10" />
      </section>

      {/* ─── Filters Bar ─── */}
      <section className="sticky top-16 z-30 bg-brand-black/90 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-dark pl-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-dark pl-8 pr-8 text-sm appearance-none cursor-pointer w-full md:w-52"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className="md:hidden btn-secondary py-2 px-4 text-xs"
            >
              <Filter size={14} />
              Filters
            </button>
          </div>

          {/* Category Tabs */}
          <div
            className={`mt-3 overflow-x-auto scrollbar-hide ${
              showFilters ? 'flex' : 'hidden md:flex'
            } gap-2 pb-1`}
          >
            <button
              onClick={() => handleCategoryChange('all')}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-sport uppercase tracking-widest border transition-all duration-200 flex-shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-brand-lime text-brand-black border-brand-lime font-bold'
                  : 'border-white/20 text-white/60 hover:border-brand-lime/50 hover:text-white'
              }`}
            >
              All
            </button>
            {(categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((cat) => (
              <button
                key={cat._id || cat.id || cat.slug}
                onClick={() =>
                  handleCategoryChange(cat.slug || cat._id || cat.id)
                }
                className={`whitespace-nowrap px-4 py-1.5 text-xs font-sport uppercase tracking-widest border transition-all duration-200 flex-shrink-0 ${
                  activeCategory === (cat.slug || cat._id || cat.id)
                    ? 'bg-brand-lime text-brand-black border-brand-lime font-bold'
                    : 'border-white/20 text-white/60 hover:border-brand-lime/50 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Results Info ─── */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
          <p className="text-white/40 text-sm">
            Showing {(products.length > 0 ? products : DEFAULT_3D_PRODUCTS.filter(p => activeCategory === 'all' || p.category.slug === activeCategory)).length} premium cricket products
          </p>
        </div>
      )}

      {/* ─── Product Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 py-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {(products.length > 0
                  ? products
                  : DEFAULT_3D_PRODUCTS.filter(p => activeCategory === 'all' || p.category.slug === activeCategory)
                ).map((product, i) => (
                  <motion.div
                    key={product._id || product.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      whatsappNumber={whatsappNumber}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary py-2 px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pg = i + 1;
                    if (
                      pg === 1 ||
                      pg === totalPages ||
                      (pg >= page - 1 && pg <= page + 1)
                    ) {
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={`w-9 h-9 text-sm font-bold transition-all ${
                            pg === page
                              ? 'bg-brand-lime text-brand-black'
                              : 'border border-white/20 text-white/60 hover:border-brand-lime hover:text-brand-lime'
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    }
                    if (pg === page - 2 || pg === page + 2) {
                      return (
                        <span
                          key={pg}
                          className="w-9 h-9 flex items-center justify-center text-white/30 text-sm"
                        >
                          …
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary py-2 px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
