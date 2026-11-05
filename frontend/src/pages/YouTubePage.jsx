import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube, Play, ExternalLink, Calendar, Eye, Clock,
  Film, Sparkles, X, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { videosAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const DEFAULT_VIDEOS = [
  {
    _id: 'v1',
    title: 'Final Over Thriller! Last Ball 6 Needed - Mumbai Corporate Cup',
    youtubeId: 'dQw4w9WgXcQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop',
    duration: '14:20',
    category: 'Match Highlights',
    views: '45K'
  },
  {
    _id: 'v2',
    title: 'Top 10 Unplayable Deliveries & Shattered Stumps 2026',
    youtubeId: 'dQw4w9WgXcQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=1200&auto=format&fit=crop',
    duration: '08:45',
    category: 'Wicket Compilation',
    views: '82K'
  },
  {
    _id: 'v3',
    title: 'Full Match Live Stream Replay: Rising Stars vs Super Kings',
    youtubeId: 'dQw4w9WgXcQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop',
    duration: '3:15:00',
    category: 'Full Match Broadcast',
    views: '110K'
  },
  {
    _id: 'v4',
    title: 'Behind The Scenes: 6-Camera Broadcast Setup & Drone Flyover',
    youtubeId: 'dQw4w9WgXcQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop',
    duration: '06:12',
    category: 'VMD Production BTS',
    views: '24K'
  }
];

export default function YouTubePage() {
  const { settings } = useSettings();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const youtubeChannelUrl = settings.youtubeChannel || 'https://www.youtube.com/@vmdsportslive';
  const youtubeChannelName = settings.youtubeChannelName || 'VMD Sports Official';

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getAll();
      if (res.data?.videos && res.data.videos.length > 0) {
        setVideos(res.data.videos);
      } else {
        setVideos(DEFAULT_VIDEOS);
      }
    } catch (err) {
      setVideos(DEFAULT_VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (video) => {
    if (video.youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`;
    }
    // Extract ID from url if available
    const match = video.youtubeUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const id = match ? match[1] : 'dQw4w9WgXcQ';
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Hero Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-sport uppercase tracking-wider mb-4">
            <Youtube className="w-3.5 h-3.5" />
            Official Broadcast Channel
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider mb-4">
            VMD Sports <span className="text-brand-lime">YouTube Hub</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
            Watch live cricket streams, high-definition match highlights, super slow-mo deliveries, and award ceremony celebrations.
          </p>

          {/* Subscribe CTA */}
          <a
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-sport uppercase tracking-wider text-xs font-bold transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)]"
          >
            <Youtube className="w-4 h-4 fill-current" />
            Subscribe to {youtubeChannelName}
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>

        {/* ─── Featured Video Banner (Top Video) ─── */}
        {videos.length > 0 && (
          <div className="mb-14 rounded-2xl bg-brand-black border border-white/10 overflow-hidden relative shadow-2xl group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-8 relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => setActiveVideo(videos[0])}>
                <img
                  src={videos[0].thumbnail || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop'}
                  alt={videos[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-lime text-black flex items-center justify-center shadow-[0_0_30px_rgba(191,255,0,0.5)] group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
                {videos[0].duration && (
                  <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm text-xs font-mono text-white">
                    {videos[0].duration}
                  </span>
                )}
              </div>

              <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[10px] font-sport uppercase tracking-widest text-brand-lime bg-brand-lime/10 border border-brand-lime/20 px-2.5 py-0.5 rounded-full mb-3">
                    Featured Broadcast
                  </span>
                  <h2 className="font-display text-2xl uppercase tracking-wider text-white mb-3">
                    {videos[0].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                    {videos[0].description || 'Catch all the boundary action, super-overs and bowler milestones with our official broadcast commentary.'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveVideo(videos[0])}
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch Now
                  </button>
                  <a
                    href={videos[0].youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Video Grid ─── */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl uppercase tracking-wider text-white">
              Latest Video Releases
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              {videos.length} Videos Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(1).map((vid, idx) => (
              <motion.div
                key={vid._id || idx}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl bg-brand-black border border-white/10 hover:border-brand-lime/40 overflow-hidden shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div
                    className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                    onClick={() => setActiveVideo(vid)}
                  >
                    <img
                      src={vid.thumbnail || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop'}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-brand-lime/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {vid.duration && (
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[11px] font-mono text-white">
                        {vid.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    {vid.category && (
                      <span className="text-[10px] font-sport uppercase tracking-wider text-brand-lime block mb-1.5">
                        {vid.category}
                      </span>
                    )}
                    <h4 className="font-bold text-white text-base leading-snug group-hover:text-brand-lime transition-colors line-clamp-2 mb-2">
                      {vid.title}
                    </h4>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0 flex items-center justify-between text-xs text-gray-400 border-t border-white/5 mt-auto">
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="text-brand-lime hover:underline font-sport uppercase tracking-wider text-[11px] flex items-center gap-1"
                  >
                    Watch Embedded
                  </button>
                  <a
                    href={vid.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white flex items-center gap-1"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    Open YouTube
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Video Embed Modal ─── */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
              onClick={() => setActiveVideo(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl bg-brand-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl relative"
              >
                {/* Modal Header */}
                <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between gap-4">
                  <h4 className="font-bold text-white text-sm sm:text-base truncate">
                    {activeVideo.title}
                  </h4>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={getEmbedUrl(activeVideo)}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-black/60 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Official VMD Sports Media Broadcast
                  </span>
                  <a
                    href={activeVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-lime hover:underline flex items-center gap-1"
                  >
                    Watch on YouTube
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
