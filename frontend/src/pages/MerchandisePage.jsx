import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useProductClickTracker } from '../hooks/useProductClickTracker';
import { openDirectWhatsAppEnquiry } from '../utils/whatsapp';
import ProductCard from '../components/shared/ProductCard';

const PRODUCTS_PER_PAGE = 12;

export const DEFAULT_3D_PRODUCTS = [
  {
    _id: 'default-1',
    name: 'VMD Pro Strike Cricket Track Pants',
    slug: 'vmd-pro-strike-cricket-track-pants',
    price: 2499,
    discountPrice: 1999,
    category: { name: 'Track Pants', slug: 'track' },
    categorySlug: 'track',
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
    categorySlug: 't-shirts',
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
    categorySlug: 'shorts',
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
    categorySlug: 'sleeves',
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
    categorySlug: 'accessories',
    images: ['/images/vmd_sports_accessories.jpg'],
    totalStock: 50,
    isFeatured: true,
  },
];

export const REQUIRED_CATEGORIES = [
  { name: 'All Products', slug: 'all' },
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Track Pants', slug: 'track' },
  { name: 'Shorts', slug: 'shorts' },
  { name: 'Sleeves', slug: 'sleeves' },
  { name: 'Accessories', slug: 'accessories' },
];

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="bg-[#0C0E12] border border-white/10 rounded-lg overflow-hidden animate-pulse">
      <div className="bg-white/5 aspect-[3/4] w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-5 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-9 bg-white/10 rounded w-full mt-2" />
      </div>
    </div>
  );
}

export default function MerchandisePage() {
  const [products, setProducts] = useState([]);
  const [allDbProducts, setAllDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { settings } = useSettings();
  const { trackClick, trackWhatsappEnquiry } = useProductClickTracker();

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

  // Fetch all active products once to calculate exact category counts dynamically
  useEffect(() => {
    productsAPI.getAll({ limit: 100 })
      .then((res) => {
        const list = res.data?.products || res.data?.data || [];
        if (list.length > 0) {
          setAllDbProducts(list);
        } else {
          setAllDbProducts(DEFAULT_3D_PRODUCTS);
        }
      })
      .catch(() => {
        setAllDbProducts(DEFAULT_3D_PRODUCTS);
      });
  }, []);

  // Compute dynamic product count per category
  const categoryCounts = useMemo(() => {
    const counts = {
      all: allDbProducts.length,
      't-shirts': 0,
      track: 0,
      shorts: 0,
      sleeves: 0,
      accessories: 0,
    };
    allDbProducts.forEach((p) => {
      const slug = p.category?.slug || p.categorySlug;
      if (slug && counts[slug] !== undefined) {
        counts[slug]++;
      }
    });
    return counts;
  }, [allDbProducts]);

  /* Fetch filtered products */
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
      const list = data?.products || data?.data || [];

      if (list.length > 0) {
        setProducts(list);
        setTotalPages(data?.pages || data?.totalPages || 1);
        setTotalCount(data?.total || list.length);
      } else {
        // Fallback filter locally if backend returns 0 (e.g. initial setup)
        const filtered = DEFAULT_3D_PRODUCTS.filter((p) => {
          const matchCat = activeCategory === 'all' || p.category.slug === activeCategory;
          const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
          return matchCat && matchSearch;
        });
        setProducts(filtered);
        setTotalPages(1);
        setTotalCount(filtered.length);
      }
    } catch {
      const filtered = DEFAULT_3D_PRODUCTS.filter((p) => {
        const matchCat = activeCategory === 'all' || p.category.slug === activeCategory;
        const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      });
      setProducts(filtered);
      setTotalPages(1);
      setTotalCount(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [page, sort, activeCategory, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (catSlug) => {
    setActiveCategory(catSlug);
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

  return (
    <div className="min-h-screen bg-[#07080A] text-white pt-28 pb-20">
      {/* ─── Page Header ─── */}
      <section className="relative py-12 md:py-16 overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-sport uppercase tracking-[0.25em] text-[#FF6B00] font-bold block mb-2"
          >
            VMD Athlete Apparel
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white"
          >
            Official <span className="text-[#FF6B00]">Merchandise</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mt-3 text-sm sm:text-base max-w-xl leading-relaxed"
          >
            Engineered cricket sportswear designed for competitive fielders, bowlers and athletes. Select any item to view details and enquire directly on WhatsApp.
          </motion.p>
        </div>
      </section>

      {/* ─── Category Navigation Bar ─── */}
      <section className="sticky top-16 z-30 bg-[#07080A]/95 backdrop-blur-md border-b border-white/10 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Categories Tab Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {REQUIRED_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.slug;
              const count = categoryCounts[cat.slug] ?? 0;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`flex-shrink-0 px-4 py-2 rounded-md border text-xs font-sport uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF6B00] text-black border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.35)]'
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

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search sportswear..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-[#0E1015] border border-white/10 rounded-md pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00]"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown size={14} className="text-white/40" />
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-[#0E1015] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-white/20 mb-4" />
            <h3 className="font-sport uppercase text-lg text-white font-bold mb-1">
              No products found
            </h3>
            <p className="text-white/50 text-xs">
              Try selecting another category or clearing your search filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <ProductCard
                    key={product._id || product.slug}
                    product={product}
                    onCardClick={(p) => trackClick(p, 'card_click')}
                    onWhatsAppClick={handleDirectWhatsApp}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md bg-[#0E1015] border border-white/10 text-xs font-sport uppercase tracking-wider text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-9 h-9 rounded-md text-xs font-mono font-bold transition-all ${
                          page === pNum
                            ? 'bg-[#FF6B00] text-black font-extrabold'
                            : 'bg-[#0E1015] border border-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-md bg-[#0E1015] border border-white/10 text-xs font-sport uppercase tracking-wider text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                >
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
