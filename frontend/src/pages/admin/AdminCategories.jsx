import React, { useState, useEffect } from 'react';
import {
  FolderTree, Plus, Edit2, Trash2, Check, X, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesAPI } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesAPI.getAll();
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setSortOrder(cat.sortOrder || 1);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder(categories.length + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');
    if (!slug.trim()) return toast.error('Category slug is required');

    try {
      setSubmitting(true);
      const payload = { name, slug, description, sortOrder: Number(sortOrder) || 1 };

      if (editingId) {
        await categoriesAPI.update(editingId, payload);
        toast.success('Category updated successfully');
      } else {
        await categoriesAPI.create(payload);
        toast.success('Category created successfully');
      }
      cancelEdit();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wider text-white">
          Merchandise <span className="text-brand-lime">Categories</span>
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
          Track, T-Shirts, Shorts, Sleeves & Custom Sportswear
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Form Column (5 Cols) */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Category Name <span className="text-brand-lime">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Sleeves"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                URL Slug <span className="text-brand-lime">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. sleeves"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. UV-protected compression arm sleeves for fielders and bowlers."
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                min="1"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-brand-black border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-gray-500 text-xs">
                Loading categories...
              </div>
            ) : categories.length > 0 ? (
              <div className="divide-y divide-white/5">
                {categories.map((c) => (
                  <div key={c._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        <span className="font-mono text-[10px] text-brand-lime bg-brand-lime/10 px-2 py-0.5 rounded">
                          /{c.slug}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-1 max-w-md">{c.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.name)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 text-xs">
                No categories created yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
