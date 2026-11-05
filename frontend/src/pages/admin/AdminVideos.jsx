import React, { useState, useEffect } from 'react';
import {
  Youtube, Plus, Trash2, ExternalLink, Play, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { videosAPI } from '../../services/api';

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [category, setCategory] = useState('Match Highlights');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getAll();
      if (res.data?.videos) setVideos(res.data.videos);
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter video title');
    if (!youtubeUrl.trim()) return toast.error('Please enter YouTube video URL');

    const yId = extractYoutubeId(youtubeUrl);
    const thumbnail = yId
      ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop';

    try {
      setSubmitting(true);
      await videosAPI.create({
        title,
        youtubeUrl,
        youtubeId: yId,
        thumbnail,
        category,
        duration,
        description
      });
      toast.success('YouTube video added!');
      setTitle('');
      setYoutubeUrl('');
      setDuration('');
      setDescription('');
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, videoTitle) => {
    if (!window.confirm(`Delete video "${videoTitle}"?`)) return;
    try {
      await videosAPI.delete(id);
      toast.success('Video removed');
      setVideos(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wider text-white">
          YouTube Broadcast <span className="text-brand-lime">Manager</span>
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
          Add match streams, tournament highlights and slow-motion compilation videos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Add Video Form (5 Cols) */}
        <div className="lg:col-span-5">
          <form onSubmit={handleAddVideo} className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              Add YouTube Video
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Video Title <span className="text-brand-lime">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grand Finale Highlights: Super Kings vs Royals"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                YouTube URL <span className="text-brand-lime">*</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Automatic thumbnail generation from video ID.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime"
                >
                  <option value="Match Highlights">Match Highlights</option>
                  <option value="Full Match Broadcast">Full Match Broadcast</option>
                  <option value="Wicket Compilation">Wicket Compilation</option>
                  <option value="Player Reel">Player Reel</option>
                  <option value="BTS Production">BTS Production</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                  Duration (e.g. 12:45)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="12:45"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-brand-lime"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Description / Context
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key player moments or tournament round details..."
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? 'Adding Video...' : 'Add Video to Hub'}
            </button>
          </form>
        </div>

        {/* Video List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-brand-black border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-16 text-center text-gray-500 text-xs">
                Loading videos...
              </div>
            ) : videos.length > 0 ? (
              <div className="divide-y divide-white/5">
                {videos.map((vid) => (
                  <div key={vid._id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-24 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={vid.thumbnail || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=200&auto=format&fit=crop'}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                        {vid.duration && (
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] text-brand-lime font-sport uppercase block">
                          {vid.category || 'Highlights'}
                        </span>
                        <h4 className="font-bold text-white text-xs truncate max-w-sm">
                          {vid.title}
                        </h4>
                        <a
                          href={vid.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-gray-500 hover:text-white flex items-center gap-1 font-mono truncate mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          {vid.youtubeUrl}
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(vid._id, vid.title)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors flex-shrink-0"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-gray-500 text-xs">
                No YouTube videos added yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
