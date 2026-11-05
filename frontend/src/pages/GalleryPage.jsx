import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Filter, Trophy, Eye, Maximize2, X, ChevronLeft, ChevronRight,
  ExternalLink, Sparkles
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { galleryAPI } from '../services/api';

const DEFAULT_GALLERY = [
  {
    _id: 'sample-1',
    title: 'Cover Drive In The Floodlights',
    tournamentName: 'T20 Championship 2026',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop',
    caption: 'Classic textbook follow-through during the playoff semifinal.',
    photographer: 'VMD Senior Lens'
  },
  {
    _id: 'sample-2',
    title: 'Flying Catch At Backward Point',
    tournamentName: 'Mumbai Premier Cup',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop',
    caption: 'Airborne horizontal dive to dismiss the set batsman.',
    photographer: 'VMD Media Crew'
  },
  {
    _id: 'sample-3',
    title: 'Fast Bowler Delivery Stride',
    tournamentName: 'State Trophy Final',
    imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=1200&auto=format&fit=crop',
    caption: 'High-speed capture of seam release at 142 km/h.',
    photographer: 'VMD Action Team'
  },
  {
    _id: 'sample-4',
    title: 'Trophy Lifting Celebration',
    tournamentName: 'Corporate Super League',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    caption: 'Golden hour confetti burst with victorious squad.',
    photographer: 'VMD Lead Lead'
  },
  {
    _id: 'sample-5',
    title: 'Stump Shattered Slow-Mo Still',
    tournamentName: 'T20 Championship 2026',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    caption: 'Off stump cartwheeling back towards the wicketkeeper.',
    photographer: 'VMD Crew'
  },
  {
    _id: 'sample-6',
    title: 'Opening Batsmen Walking Out',
    tournamentName: 'Mumbai Premier Cup',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop',
    caption: 'Entering the cauldron with 10,000 cheering spectators.',
    photographer: 'VMD Senior Lens'
  }
];

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('All');
  const [loading, setLoading] = useState(true);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadGalleryData();
  }, [selectedTournament]);

  const loadGalleryData = async () => {
    try {
      setLoading(true);
      const params = selectedTournament !== 'All' ? { tournament: selectedTournament } : {};
      const [galRes, tourRes] = await Promise.allSettled([
        galleryAPI.getAll(params),
        galleryAPI.getTournaments()
      ]);

      if (galRes.status === 'fulfilled' && galRes.value.data?.images?.length > 0) {
        setItems(galRes.value.data.images);
      } else {
        // Filter sample gallery
        if (selectedTournament === 'All') {
          setItems(DEFAULT_GALLERY);
        } else {
          setItems(DEFAULT_GALLERY.filter(x => x.tournamentName === selectedTournament));
        }
      }

      if (tourRes.status === 'fulfilled' && tourRes.value.data?.tournaments?.length > 0) {
        setTournaments(['All', ...tourRes.value.data.tournaments]);
      } else {
        const uniqueTours = ['All', ...new Set(DEFAULT_GALLERY.map(x => x.tournamentName))];
        setTournaments(uniqueTours);
      }
    } catch (err) {
      setItems(DEFAULT_GALLERY);
      setTournaments(['All', ...new Set(DEFAULT_GALLERY.map(x => x.tournamentName))]);
    } finally {
      setLoading(false);
    }
  };

  const slides = items.map(item => ({
    src: item.imageUrl,
    title: item.title,
    description: `${item.tournamentName ? item.tournamentName + ' • ' : ''}${item.caption || ''}`
  }));

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-sport uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5" />
            VMD Media Vault
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider mb-4">
            Cricket <span className="text-brand-lime">Photo Gallery</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Relive the greatest moments captured through our telephoto lenses. Explore tournament galleries, winning celebrations, and raw athletic intensity.
          </p>
        </div>

        {/* ─── Tournament Filter Pills ─── */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {tournaments.map((tour) => {
            const isSelected = selectedTournament === tour;
            return (
              <button
                key={tour}
                onClick={() => setSelectedTournament(tour)}
                className={`px-5 py-2 rounded-xl text-xs font-sport uppercase tracking-wider transition-all duration-200 border ${
                  isSelected
                    ? 'bg-brand-lime text-black border-brand-lime font-black shadow-[0_0_20px_rgba(191,255,0,0.3)]'
                    : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {tour === 'All' ? 'All Matches' : tour}
              </button>
            );
          })}
        </div>

        {/* ─── Responsive Gallery Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item._id || idx}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-black border border-white/10 hover:border-brand-lime/40 cursor-pointer shadow-lg"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Tournament Tag (Top Left) */}
                {item.tournamentName && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-sport uppercase tracking-wider text-brand-lime">
                      {item.tournamentName}
                    </span>
                  </div>
                )}

                {/* Zoom Icon (Top Right) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 rounded-lg bg-brand-lime text-black shadow-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Title & Caption (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="font-display text-lg uppercase tracking-wide text-white group-hover:text-brand-lime transition-colors mb-1">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                  {item.photographer && (
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                      Shot by: {item.photographer}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-brand-black border border-white/10 rounded-2xl p-12 text-center max-w-md mx-auto">
            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="font-sport uppercase text-base text-white tracking-wider mb-1">No Photos Found</h3>
            <p className="text-gray-400 text-xs">There are no photographs uploaded for this tournament filter yet.</p>
          </div>
        )}

        {/* Lightbox Modal */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={slides}
        />

      </div>
    </div>
  );
}
