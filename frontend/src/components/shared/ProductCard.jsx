import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { getProductPricing } from '../../utils/whatsapp';

export default function ProductCard({ product, onCardClick, onWhatsAppClick }) {
  if (!product) return null;

  const {
    name,
    slug,
    images,
    image,
    category,
    categorySlug,
    badge,
  } = product;

  const pricing = getProductPricing(product);
  const displayPrice = pricing.sellingPrice;
  const originalPrice = pricing.mrp;
  const hasDiscount = pricing.hasDiscount;
  const discountPct = pricing.discountPercent;

  const rawImg = images?.[0] || image;
  const imgSrc =
    (typeof rawImg === 'string' ? rawImg : rawImg?.url) ||
    '/images/vmd_cricket_jersey.jpg';

  const categoryName = category?.name || category || 'Sportswear';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col bg-[#0C0E12] border border-white/10 hover:border-[#FF6B00]/60 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,107,0,0.12)] rounded-lg overflow-hidden"
    >
      {/* 1. Product Image Frame with Radial Studio Highlight */}
      <Link
        to={`/merchandise/${slug}`}
        onClick={() => onCardClick && onCardClick(product)}
        className="relative aspect-[3/4] bg-[#0E1015] overflow-hidden flex items-center justify-center p-3 select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/vmd_cricket_jersey.jpg';
          }}
        />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 text-[10px] font-sport uppercase tracking-wider text-white/90 bg-black/80 backdrop-blur-md px-2.5 py-1 border border-white/10 rounded-xs">
          {categoryName}
        </span>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 right-3 text-[10px] font-sport uppercase tracking-wider bg-[#FF6B00] text-black font-extrabold px-2 py-0.5 rounded-xs shadow-md">
            {discountPct}% OFF
          </span>
        )}

        {/* Optional Pro / Special Badge if no discount */}
        {!hasDiscount && badge && (
          <span className="absolute top-3 right-3 text-[9px] font-sport uppercase tracking-wider bg-[#BFFF00] text-black font-extrabold px-2 py-0.5 rounded-xs shadow-md">
            {badge}
          </span>
        )}
      </Link>

      {/* 2. Product Information & View Product Action */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-[#090A0D]">
        <div>
          <Link
            to={`/merchandise/${slug}`}
            onClick={() => onCardClick && onCardClick(product)}
            className="font-sport font-bold text-sm uppercase tracking-wide text-white group-hover:text-[#FF6B00] transition-colors line-clamp-2 min-h-[2.5rem] block"
          >
            {name}
          </Link>

          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-display tracking-tight text-white font-bold">
              ₹{Number(displayPrice).toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-xs font-mono text-white/40 line-through">
                ₹{Number(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Action: Single Clean 'View Details' Button */}
        <div className="mt-3">
          <Link
            to={`/merchandise/${slug}`}
            onClick={() => onCardClick && onCardClick(product)}
            className="w-full py-2.5 px-3 rounded-md border border-white/15 bg-white/[0.04] hover:bg-[#FF6B00] hover:text-black hover:border-[#FF6B00] text-white text-xs font-sport uppercase tracking-wider font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 group/btn shadow-sm"
          >
            <span>View Details</span>
            <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

