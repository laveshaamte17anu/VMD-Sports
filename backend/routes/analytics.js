const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const ProductClick = require('../models/ProductClick');
const WhatsappEnquiry = require('../models/WhatsappEnquiry');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function daysAgoIST(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function istDayBounds(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+05:30`);
  const end   = new Date(`${dateStr}T23:59:59.999+05:30`);
  return { start, end };
}

// Extract safe image URL from Product images array
function extractImageUrl(images) {
  if (!images || !images.length) return null;
  const first = images[0];
  if (typeof first === 'string') return first;
  return first?.url || null;
}

// ─── Rate limiters ───────────────────────────────────────────────────────────
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const enquiryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many enquiry requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: POST /api/analytics/product-click
// Records a product card_click or detail_view event
// ════════════════════════════════════════════════════════════════════════════
router.post(
  '/product-click',
  trackLimiter,
  [
    body('productId')
      .notEmpty().withMessage('productId is required')
      .custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid productId'),
    body('eventType')
      .optional()
      .isIn(['card_click', 'detail_view']).withMessage('eventType must be card_click or detail_view'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { productId, eventType = 'card_click' } = req.body;

      const product = await Product.findById(productId).select('name images price discountPrice').lean();
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const now = new Date();
      const dateIST = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      await ProductClick.create({
        productId,
        productName: product.name,
        productImageUrl: extractImageUrl(product.images),
        productPrice: product.discountPrice || product.price || null,
        eventType,
        clickedAt: now,
        dateIST,
      });

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error('Track click error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to record click' });
    }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: POST /api/analytics/whatsapp-enquiry
// Records a WhatsApp enquiry event BEFORE opening WhatsApp
// ════════════════════════════════════════════════════════════════════════════
router.post(
  '/whatsapp-enquiry',
  enquiryLimiter,
  [
    body('productId')
      .notEmpty().withMessage('productId is required')
      .custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage('Invalid productId'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { productId } = req.body;

      const product = await Product.findById(productId)
        .select('name images price discountPrice slug')
        .populate('category', 'name')
        .lean();

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const now = new Date();
      const dateIST = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      const enquiry = await WhatsappEnquiry.create({
        productId,
        productName: product.name,
        productImageUrl: extractImageUrl(product.images),
        productPrice: product.price,
        productDiscountPrice: product.discountPrice || null,
        productCategory: product.category?.name || null,
        productSlug: product.slug || null,
        eventType: 'whatsapp_enquiry',
        enquiredAt: now,
        dateIST,
        status: 'WhatsApp Opened',
      });

      return res.status(201).json({ success: true, enquiryId: enquiry._id });
    } catch (err) {
      console.error('WhatsApp enquiry error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to record enquiry' });
    }
  }
);

// ─── ADMIN AUTH MIDDLEWARE ────────────────────────────────────────────────────
router.use(protect, adminOnly);

// ════════════════════════════════════════════════════════════════════════════
// ADMIN: GET /api/analytics/summary
// Summary cards: today, yesterday, week, month, most clicked, unique products
// ════════════════════════════════════════════════════════════════════════════
router.get('/summary', async (req, res) => {
  try {
    const today     = todayIST();
    const yesterday = daysAgoIST(1);
    const weekAgo   = daysAgoIST(6);
    const monthAgo  = daysAgoIST(29);

    const { start: todayStart, end: todayEnd }         = istDayBounds(today);
    const { start: yesterdayStart, end: yesterdayEnd } = istDayBounds(yesterday);
    const { start: weekStart }                         = istDayBounds(weekAgo);
    const { start: monthStart }                        = istDayBounds(monthAgo);

    const [
      clicksToday,
      clicksYesterday,
      clicksWeek,
      clicksMonth,
      mostClicked,
      uniqueProducts,
      enquiriesToday,
      enquiriesTotal,
    ] = await Promise.all([
      ProductClick.countDocuments({ clickedAt: { $gte: todayStart, $lte: todayEnd } }),
      ProductClick.countDocuments({ clickedAt: { $gte: yesterdayStart, $lte: yesterdayEnd } }),
      ProductClick.countDocuments({ clickedAt: { $gte: weekStart } }),
      ProductClick.countDocuments({ clickedAt: { $gte: monthStart } }),
      ProductClick.aggregate([
        { $group: { _id: '$productId', productName: { $last: '$productName' }, productImageUrl: { $last: '$productImageUrl' }, total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      ProductClick.distinct('productId').then((ids) => ids.length),
      WhatsappEnquiry.countDocuments({ enquiredAt: { $gte: todayStart, $lte: todayEnd } }),
      WhatsappEnquiry.countDocuments({}),
    ]);

    return res.json({
      success: true,
      summary: {
        clicksToday,
        clicksYesterday,
        clicksWeek,
        clicksMonth,
        mostClicked: mostClicked[0] || null,
        uniqueProducts,
        enquiriesToday,
        enquiriesTotal,
      },
    });
  } catch (err) {
    console.error('Summary error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN: GET /api/analytics/daily
// Daily click counts — zero-filled, IST-grouped
// Query: preset=7d|30d  OR  startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// ════════════════════════════════════════════════════════════════════════════
router.get(
  '/daily',
  [
    query('preset').optional().isIn(['7d', '30d']),
    query('startDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let startDate, endDate;

      if (req.query.startDate && req.query.endDate) {
        startDate = req.query.startDate;
        endDate   = req.query.endDate;
      } else {
        const days = req.query.preset === '30d' ? 29 : 6;
        startDate  = daysAgoIST(days);
        endDate    = todayIST();
      }

      const { start } = istDayBounds(startDate);
      const { end }   = istDayBounds(endDate);

      const rawData = await ProductClick.aggregate([
        { $match: { clickedAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$dateIST', clicks: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const clickMap = {};
      rawData.forEach((d) => { clickMap[d._id] = d.clicks; });

      const result = [];
      const cur  = new Date(`${startDate}T00:00:00+05:30`);
      const endD = new Date(`${endDate}T00:00:00+05:30`);
      while (cur <= endD) {
        const dStr = cur.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        result.push({ date: dStr, clicks: clickMap[dStr] || 0 });
        cur.setDate(cur.getDate() + 1);
      }

      return res.json({ success: true, daily: result, startDate, endDate });
    } catch (err) {
      console.error('Daily error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// ADMIN: GET /api/analytics/products
// Per-product breakdown with today/week/month/total
// ════════════════════════════════════════════════════════════════════════════
router.get('/products', async (req, res) => {
  try {
    const today    = todayIST();
    const weekAgo  = daysAgoIST(6);
    const monthAgo = daysAgoIST(29);

    const { start: todayStart, end: todayEnd } = istDayBounds(today);
    const { start: weekStart }                 = istDayBounds(weekAgo);
    const { start: monthStart }                = istDayBounds(monthAgo);

    const sort  = req.query.sort === 'least' ? 1 : -1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const rows = await ProductClick.aggregate([
      {
        $group: {
          _id: '$productId',
          productName:    { $last: '$productName' },
          productImageUrl: { $last: '$productImageUrl' },
          productPrice:   { $last: '$productPrice' },
          total: { $sum: 1 },
          todayClicks: {
            $sum: { $cond: [{ $and: [{ $gte: ['$clickedAt', todayStart] }, { $lte: ['$clickedAt', todayEnd] }] }, 1, 0] },
          },
          weekClicks:  { $sum: { $cond: [{ $gte: ['$clickedAt', weekStart] }, 1, 0] } },
          monthClicks: { $sum: { $cond: [{ $gte: ['$clickedAt', monthStart] }, 1, 0] } },
          lastClickedAt: { $max: '$clickedAt' },
        },
      },
      { $sort: { total: sort } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      {
        $addFields: {
          productSlug:   { $arrayElemAt: ['$productDoc.slug', 0] },
          productExists: { $gt: [{ $size: '$productDoc' }, 0] },
        },
      },
      { $project: { productDoc: 0 } },
    ]);

    return res.json({ success: true, products: rows });
  } catch (err) {
    console.error('Products analytics error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN: GET /api/analytics/recent
// Latest N click events (populated with product data)
// ════════════════════════════════════════════════════════════════════════════
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const events = await ProductClick.find({})
      .sort({ clickedAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ success: true, events });
  } catch (err) {
    console.error('Recent analytics error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN: GET /api/analytics/whatsapp-enquiries
// All WhatsApp enquiries with filters
// ════════════════════════════════════════════════════════════════════════════
router.get('/whatsapp-enquiries', async (req, res) => {
  try {
    const {
      status,
      dateFilter,  // today | yesterday | 7d | 30d
      productName,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    // Date filter
    if (dateFilter) {
      const today = todayIST();
      let startDate;
      if (dateFilter === 'today')     startDate = today;
      if (dateFilter === 'yesterday') startDate = daysAgoIST(1);
      if (dateFilter === '7d')        startDate = daysAgoIST(6);
      if (dateFilter === '30d')       startDate = daysAgoIST(29);

      if (startDate) {
        const { start } = istDayBounds(startDate);
        const endDateStr = dateFilter === 'yesterday' ? daysAgoIST(1) : today;
        const { end }   = istDayBounds(endDateStr);
        filter.enquiredAt = { $gte: start, $lte: end };
      }
    }

    if (status && status !== 'All') filter.status = status;
    if (productName) filter.productName = { $regex: productName, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);

    const [enquiries, total] = await Promise.all([
      WhatsappEnquiry.find(filter)
        .sort({ enquiredAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      WhatsappEnquiry.countDocuments(filter),
    ]);

    return res.json({ success: true, enquiries, total, page: Number(page) });
  } catch (err) {
    console.error('WhatsApp enquiries fetch error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN: PATCH /api/analytics/whatsapp-enquiries/:id
// Update enquiry status or admin notes
// ════════════════════════════════════════════════════════════════════════════
router.patch('/whatsapp-enquiries/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const allowedStatuses = ['WhatsApp Opened', 'Contacted', 'Order Confirmed', 'Not Interested', 'Pending Confirmation'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const update = { updatedAt: new Date() };
    if (status)     update.status     = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const enquiry = await WhatsappEnquiry.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).lean();

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    return res.json({ success: true, enquiry });
  } catch (err) {
    console.error('Update enquiry error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN: DELETE /api/analytics/whatsapp-enquiries/:id
// ════════════════════════════════════════════════════════════════════════════
router.delete('/whatsapp-enquiries/:id', async (req, res) => {
  try {
    const enquiry = await WhatsappEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    return res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
