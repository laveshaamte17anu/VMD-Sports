import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Plus, Trash2, Upload, Tag, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { galleryAPI, uploadAPI } from '../../services/api';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('All');
  const [loading, setLoading] = useState(true);

  // Add form
  const [title, setTitle] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [photographer, setPhotographer] = useState('VMD Media Crew');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [selectedTournament]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params = selectedTournament !== 'All' ? { tournament: selectedTournament } : {};
      const [galRes, tourRes] = await Promise.allSettled([
        galleryAPI.getAll(params),
        galleryAPI.getTournaments()
      ]);

      if (galRes.status === 'fulfilled' && galRes.value.data?.images) {
        setItems(galRes.value.data.images);
      }
      if (tourRes.status === 'fulfilled' && tourRes.value.data?.tournaments) {
        setTournaments(['All', ...tourRes.value.data.tournaments]);
      }
    } catch (err) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      setUploading(true);
      const res = await uploadAPI.galleryImages(data);
      if (res.data?.images?.[0]?.url) {
        setImageUrl(res.data.images[0].url);
        toast.success('Image uploaded! Click "Publish to Gallery" to save.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. You can also paste an image URL directly.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a photo title');
    if (!imageUrl.trim()) return toast.error('Please provide or upload an image');

    try {
      setSubmitting(true);
      await galleryAPI.create({
        title,
        tournamentName: tournamentName.trim() || 'General Matches',
        imageUrl,
        caption,
        photographer
      });
      toast.success('Photo added to gallery!');
      setTitle('');
      setImageUrl('');
      setCaption('');
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, photoTitle) => {
    if (!window.confirm(`Delete photo "${photoTitle}" from gallery?`)) return;
    try {
      await galleryAPI.delete(id);
      toast.success('Image deleted');
      setItems(prev => prev.filter(x => x._id !== id));
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wider text-white">
          Photo Gallery <span className="text-brand-lime">Manager</span>
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
          Organize Cricket Match Photographs by League & Tournament
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Add Photo Form (4 Cols) */}
        <div className="lg:col-span-4">
          <form onSubmit={handleCreate} className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              Upload / Add Photo
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Photo Title <span className="text-brand-lime">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diving Catch At Backward Point"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Tournament / League Name
              </label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="e.g. Mumbai Champions Trophy 2026"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Image Web URL or Upload
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/cricket.jpg"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime mb-2"
              />
              <label className="block w-full py-2 px-3 border border-dashed border-white/20 hover:border-brand-lime/40 rounded-xl text-center cursor-pointer bg-black/30 transition-colors">
                <span className="text-[11px] text-brand-lime font-medium">Or choose file from device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {uploading && <span className="text-[10px] text-brand-lime font-mono">Uploading file...</span>}
            </div>

            {imageUrl && (
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Caption
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Brief moment context or batsman/bowler name..."
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Photographer Credit
              </label>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                placeholder="VMD Media Crew"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish to Gallery'}
            </button>
          </form>
        </div>

        {/* Gallery Grid Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">

          {/* Tournament filter selector */}
          <div className="bg-brand-black border border-white/10 rounded-2xl p-4 flex flex-wrap gap-2">
            {tournaments.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTournament(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sport uppercase tracking-wider border transition-all ${
                  selectedTournament === t
                    ? 'bg-brand-lime text-black border-brand-lime font-bold'
                    : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-16 text-center text-gray-500 text-xs">
              Loading gallery...
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl bg-brand-black border border-white/10 overflow-hidden group relative flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-black">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleDelete(item._id, item.title)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {item.tournamentName && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-brand-lime font-sport uppercase tracking-wider">
                        {item.tournamentName}
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h4 className="font-bold text-white text-xs truncate mb-0.5">{item.title}</h4>
                    {item.caption && (
                      <p className="text-[11px] text-gray-400 line-clamp-1">{item.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-gray-500 text-xs bg-brand-black border border-white/10 rounded-2xl">
              No gallery images found for this tournament filter.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
