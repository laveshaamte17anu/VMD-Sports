import React, { useState } from 'react';

/**
 * Official VMD Sports Live Logo Component
 * Loads official logo from /images/vmd-logo.png
 * Includes responsive sizing and graceful fallback badge if the asset is still being copied into public/images/
 */
export default function VmdLogo({ className = 'h-10 md:h-11', showText = true, priority = false }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="inline-flex items-center gap-2.5 sm:gap-3 select-none group">
      {/* Official VMD Icon / Emblem */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {!imgError ? (
          <img
            src="/images/vmd-logo.png"
            alt="VMD Sports Live"
            onError={() => setImgError(true)}
            className={`w-auto object-contain rounded-md transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(255,107,0,0.35)] ${className}`}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] via-[#FFD700] to-[#BFFF00] p-[1.5px] shadow-[0_0_15px_rgba(255,107,0,0.35)]">
            <div className="w-full h-full bg-[#0d0d0d] rounded-[10px] flex items-center justify-center">
              <span className="font-display text-lg tracking-wider text-white font-black">
                V<span className="text-[#FF6B00]">M</span><span className="text-[#BFFF00]">D</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Brand Name Typography beside the icon */}
      {showText && (
        <div className="flex flex-col leading-none text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-xl md:text-2xl text-white uppercase tracking-wider font-black">
              VMD <span className="text-[#FF6B00]">SPORTS</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-sport uppercase font-black bg-red-600 text-white tracking-widest flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>
          <span className="text-[9px] font-sport uppercase tracking-[0.2em] text-[#BFFF00] font-semibold mt-0.5">
            Cricket Media
          </span>
        </div>
      )}
    </div>
  );
}
