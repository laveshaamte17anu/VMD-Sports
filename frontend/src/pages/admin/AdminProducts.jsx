import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Plus, Search, Edit3, Trash2, Star, Eye,
  AlertCircle, Check, X, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI } from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCat]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      if (res.data?.categories) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search) params.search = search;
      const res = await productsAPI.getAllAdmin(params);
      if (res.data?.products) {
        let prods = res.data.products;
        if (selectedCat) {
          prods = prods.filter(p => p.category?.slug === selectedCat || p.category?._id === selectedCat);
        }
        setProducts(prods);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const updated = !product.isFeatured;
      await productsAPI.update(product._id, { isFeatured: updated });
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isFeatured: updated } : p));
      toast.success(updated ? 'Product marked as featured' : 'Product unfeatured');
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  return (
    <div className="space-y-6">

      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            Merchandise <span className="text-brand-lime">Catalog</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
            Manage Track Suits, T-Shirts, Shorts & Compression Sleeves
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-5 py-2.5 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* ─── Filters & Search ─── */}
      <div className="bg-brand-black border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            placeholder="Search products by name..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-xs"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-lime"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug || c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={fetchProducts}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors"
        >
          Filter
        </button>
      </div>

      {/* ─── Product Table ─── */}
      <div className="bg-brand-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-6 h-6 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading catalog...
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-gray-400 uppercase font-sport tracking-wider">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price (INR)</th>
                  <th className="py-3 px-4 font-semibold">Stock Total</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Featured</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => {
                  const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=200&auto=format&fit=crop';
                  return (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg border border-white/10 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white text-sm block leading-tight">{p.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">/{p.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-300">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {p.discountPrice && p.discountPrice < p.price ? (
                          <>
                            <span className="font-mono text-brand-lime font-bold text-sm block">
                              ₹{p.discountPrice?.toLocaleString('en-IN')}
                            </span>
                            <span className="font-mono text-[10px] text-gray-400 line-through block">
                              MRP: ₹{p.price?.toLocaleString('en-IN')}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-white font-bold text-sm">
                            ₹{p.price?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          (p.totalStock ?? 0) === 0 ? 'bg-red-500/20 text-red-400' :
                          (p.totalStock ?? 0) <= 5 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-brand-lime/20 text-brand-lime'
                        }`}>
                          {p.totalStock ?? 0} in stock
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-sport tracking-wider ${
                          p.status === 'active' ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/30' :
                          'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleFeatured(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.isFeatured ? 'text-brand-lime bg-brand-lime/10' : 'text-gray-600 hover:text-gray-400'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-brand-lime transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="font-sport uppercase text-sm text-white tracking-wider mb-1">No Products Found</h3>
            <p className="text-xs text-gray-500 mb-6">Create your first cricket merchandise item or adjust search filters.</p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
