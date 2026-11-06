import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, Plus, Trash2, Check, Image as ImageIcon,
  DollarSign, Tag, Layers, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api';

const DEFAULT_SIZES = [
  { size: 'S', stock: 10 },
  { size: 'M', stock: 15 },
  { size: 'L', stock: 20 },
  { size: 'XL', stock: 15 },
  { size: 'XXL', stock: 5 }
];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    price: '',
    discountPrice: '',
    status: 'active',
    isFeatured: false,
    material: '100% Breathable Performance Poly-Spandex',
    careInstructions: 'Machine wash cold inside-out. Do not iron directly on graphics.',
    sizes: DEFAULT_SIZES,
    colors: [
      { name: 'Neon Lime', hex: '#BFFF00' },
      { name: 'Stealth Black', hex: '#111111' }
    ],
    images: []
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#BFFF00');
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      if (res.data?.categories) {
        setCategories(res.data.categories);
        if (!isEditing && res.data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category: res.data.categories[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProduct = async () => {
    try {
      setFetching(true);
      const res = await productsAPI.getAllAdmin({ limit: 100 });
      const found = res.data?.products?.find(p => p._id === id);
      if (found) {
        setFormData({
          name: found.name || '',
          description: found.description || '',
          shortDescription: found.shortDescription || '',
          category: found.category?._id || found.category || '',
          price: found.price || '',
          discountPrice: found.discountPrice || '',
          status: found.status || 'active',
          isFeatured: found.isFeatured || false,
          material: found.material || '',
          careInstructions: found.careInstructions || '',
          sizes: found.sizes?.length > 0 ? found.sizes : DEFAULT_SIZES,
          colors: found.colors?.length > 0 ? found.colors : [],
          images: found.images || []
        });
      } else {
        toast.error('Product not found');
        navigate('/admin/products');
      }
    } catch (err) {
      toast.error('Failed to load product');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeStockChange = (index, stockVal) => {
    const updated = [...formData.sizes];
    updated[index].stock = Math.max(0, parseInt(stockVal, 10) || 0);
    setFormData(prev => ({ ...prev, sizes: updated }));
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: newImageUrl.trim(), publicId: `url-${Date.now()}` }]
    }));
    setNewImageUrl('');
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }]
    }));
    setNewColorName('');
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      setUploadingImages(true);
      const res = await uploadAPI.productImages(data);
      if (res.data?.images) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...res.data.images]
        }));
        toast.success(`${res.data.images.length} images uploaded!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed. You can also paste direct Image URLs.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.category) return toast.error('Please select a category');
    
    const regularPrice = Number(formData.price);
    if (!formData.price || isNaN(regularPrice) || regularPrice <= 0) {
      return toast.error('Please enter a valid MRP price in INR (greater than 0)');
    }

    let offerPrice = undefined;
    if (formData.discountPrice !== '' && formData.discountPrice != null) {
      offerPrice = Number(formData.discountPrice);
      if (isNaN(offerPrice) || offerPrice <= 0) {
        return toast.error('Selling/Offer price must be greater than ₹0');
      }
      if (offerPrice >= regularPrice) {
        return toast.error('Selling/Offer price must be strictly lower than regular MRP price');
      }
    }

    if (formData.images.length === 0) return toast.error('Please add at least one product image');

    const payload = {
      ...formData,
      price: regularPrice,
      discountPrice: offerPrice,
    };

    try {
      setLoading(true);
      if (isEditing) {
        await productsAPI.update(id, payload);
        toast.success('Product updated successfully!');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 text-center text-gray-500">
        <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading product details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wider text-white">
              {isEditing ? 'Edit Merchandise Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-400 text-xs font-sport uppercase tracking-wider">
              {isEditing ? `Updating ${formData.name}` : 'Fill in official merchandise specs'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Basic Info */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime mb-2">
            1. Core Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Product Title <span className="text-brand-lime">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. VMD Pro Strike Cricket Track Suit - Neon Black"
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Category <span className="text-brand-lime">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime text-sm"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime text-sm"
              >
                <option value="active">Active (Available on Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="out_of_stock">Out Of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Regular Price / MRP (₹) <span className="text-brand-lime">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 1299"
                required
                min="1"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-sm font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Maximum Retail Price printed on tag</span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Selling / Deal Price (Optional ₹)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="e.g. 999"
                min="1"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-sm font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Leave empty if selling at MRP</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Short Description (Card Teaser)
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="e.g. Premium moisture-wicking cricket track designed for rigorous fielding drills."
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Detailed Product Description <span className="text-brand-lime">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Complete fabric specs, fit details, pocket zippers, and athlete feedback..."
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-sm"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-lime rounded cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs uppercase tracking-wider text-white cursor-pointer select-none">
                Highlight as <span className="text-brand-lime font-bold">Featured Product</span> on Homepage Showcase
              </label>
            </div>
          </div>
        </div>

        {/* 2. Sizes & Stock Management */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime mb-2">
            2. Available Sizes & Inventory Units
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {formData.sizes.map((s, idx) => (
              <div key={s.size} className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <span className="font-sport uppercase text-sm font-bold text-white block mb-1">
                  Size {s.size}
                </span>
                <input
                  type="number"
                  min="0"
                  value={s.stock}
                  onChange={(e) => handleSizeStockChange(idx, e.target.value)}
                  className="w-full bg-black/80 border border-white/10 rounded-lg py-1.5 px-2 text-center text-brand-lime font-mono text-sm focus:outline-none focus:border-brand-lime"
                />
                <span className="text-[10px] text-gray-500 block mt-1">units</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Color Variations */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime mb-2">
            3. Color Variations
          </h3>

          <div className="flex flex-wrap gap-3 mb-4">
            {formData.colors.map((c, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs"
              >
                <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                <span className="text-white font-medium">{c.name}</span>
                <button
                  type="button"
                  onClick={() => removeColor(idx)}
                  className="text-gray-500 hover:text-rose-400 ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Color Name (e.g. Midnight Navy)"
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-brand-lime"
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-10 h-9 rounded-xl bg-black/60 border border-white/10 cursor-pointer p-0.5"
            />
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors"
            >
              Add Color
            </button>
          </div>
        </div>

        {/* 4. Product Images */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime mb-2">
            4. Product Photography & Images
          </h3>

          {/* Current Images Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                <img src={img.url} alt="product" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/80 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-brand-lime text-black text-[9px] font-sport uppercase font-bold">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* File Upload Or URL Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Upload Image File
              </label>
              <label className="border-2 border-dashed border-white/10 hover:border-brand-lime/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-black/40 text-center transition-colors">
                <Upload className="w-6 h-6 text-brand-lime mb-1" />
                <span className="text-xs text-gray-300 font-medium">Click to upload files</span>
                <span className="text-[10px] text-gray-500">JPG, PNG, WEBP (Max 5MB)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {uploadingImages && <p className="text-xs text-brand-lime mt-1 font-mono">Uploading...</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Or Add Image Web URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/jersey.jpg"
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-lime"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors"
                >
                  Add URL
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Add high-resolution cricket apparel mockups or photographs.</p>
            </div>
          </div>
        </div>

        {/* 5. Fabric & Care Details */}
        <div className="bg-brand-black border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-sport uppercase text-xs tracking-widest text-brand-lime mb-2">
            5. Technical Fabric & Care
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Material Composition
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g. 100% Interlock Micro-Poly Sweat Wicking"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                Washing & Care Instructions
              </label>
              <input
                type="text"
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleChange}
                placeholder="e.g. Machine wash cold, do not bleach"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-sport uppercase tracking-wider text-xs transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-black hover:bg-white transition-all shadow-[0_0_20px_rgba(191,255,0,0.3)] disabled:opacity-50"
          >
            {loading ? 'Saving Product...' : isEditing ? 'Update Product' : 'Publish Product'}
          </button>
        </div>

      </form>

    </div>
  );
}
