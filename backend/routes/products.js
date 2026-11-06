const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/products - Public, with filtering
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, status, sort, page = 1, limit = 20 } = req.query;
    const filter = { status: 'active' };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const sortObj = sort === 'price_asc' ? { price: 1 } :
                    sort === 'price_desc' ? { price: -1 } :
                    sort === 'newest' ? { createdAt: -1 } : { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:slug - Public
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.viewCount += 1;
    await product.save({ validateBeforeSave: false });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products - Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, discountPrice, ...rest } = req.body;
    const regularPrice = Number(price);
    if (isNaN(regularPrice) || regularPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Regular MRP price must be a valid number greater than 0.' });
    }

    let finalDiscount = null;
    if (discountPrice !== undefined && discountPrice !== null && discountPrice !== '') {
      const d = Number(discountPrice);
      if (isNaN(d) || d <= 0) {
        return res.status(400).json({ success: false, message: 'Selling/Offer price must be greater than 0.' });
      }
      if (d >= regularPrice) {
        return res.status(400).json({ success: false, message: `Selling/Offer price (₹${d}) must be strictly lower than regular MRP price (₹${regularPrice}).` });
      }
      finalDiscount = d;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const product = new Product({
      name,
      slug,
      price: regularPrice,
      discountPrice: finalDiscount,
      ...rest,
    });
    await product.save();
    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id - Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.body.price !== undefined) {
      const p = Number(req.body.price);
      if (isNaN(p) || p <= 0) {
        return res.status(400).json({ success: false, message: 'Regular MRP price must be a valid number greater than 0.' });
      }
      product.price = p;
    }

    if (req.body.discountPrice !== undefined) {
      if (req.body.discountPrice === '' || req.body.discountPrice === null) {
        product.discountPrice = null;
      } else {
        const d = Number(req.body.discountPrice);
        if (isNaN(d) || d <= 0) {
          return res.status(400).json({ success: false, message: 'Selling/Offer price must be greater than 0.' });
        }
        if (d >= product.price) {
          return res.status(400).json({ success: false, message: `Selling/Offer price (₹${d}) must be strictly lower than regular MRP price (₹${product.price}).` });
        }
        product.discountPrice = d;
      }
    }

    const { price, discountPrice, ...otherFields } = req.body;
    Object.assign(product, otherFields);

    await product.save();
    await product.populate('category', 'name slug');
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id - Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/admin/all - Admin (includes draft/out_of_stock)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter)
    ]);
    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

