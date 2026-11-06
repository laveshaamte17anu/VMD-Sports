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

// ─── NOTIFY VMD TEAM (WhatsApp Cloud API / Email / Admin Dashboard) ────────
async function notifyVmdTeam(enquiryData) {
  const {
    META_WA_PHONE_NUMBER_ID,
    META_WA_SYSTEM_TOKEN,
    VMD_NOTIFICATION_PHONE,
    VMD_BUSINESS_PHONE = '919819483036',
  } = process.env;

  // 1. WhatsApp Business Cloud API (Dispatched only to a separate notification number, never to itself)
  if (META_WA_PHONE_NUMBER_ID && META_WA_SYSTEM_TOKEN && VMD_NOTIFICATION_PHONE) {
    const cleanNotifyPhone = String(VMD_NOTIFICATION_PHONE).replace(/\D/g, '');
    const cleanBusinessPhone = String(VMD_BUSINESS_PHONE).replace(/\D/g, '');

    if (cleanNotifyPhone && cleanNotifyPhone !== cleanBusinessPhone) {
      try {
        const https = require('https');
        const payload = JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanNotifyPhone,
          type: 'image',
          image: {
            link: enquiryData.productImageUrl || 'https://vmd-sports.vercel.app/images/vmd_cricket_jersey.jpg',
            caption: `*NEW VMD SPORTS ENQUIRY*\n\nProduct: ${enquiryData.productName}\nSelling Price: ₹${Number(enquiryData.productDiscountPrice || enquiryData.productPrice).toLocaleString('en-IN')}\nSize: ${enquiryData.selectedSize || 'N/A'}\nColor: ${enquiryData.selectedColor || 'N/A'}\nDate: ${enquiryData.dateIST}\n\nView details in Admin Dashboard.`
          }
        });

        const req = https.request({
          hostname: 'graph.facebook.com',
          path: `/v19.0/${META_WA_PHONE_NUMBER_ID}/messages`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${META_WA_SYSTEM_TOKEN}`,
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          let resData = '';
          res.on('data', chunk => resData += chunk);
          res.on('end', () => {
            console.log('[Notification] Cloud API notification dispatched. Status:', res.statusCode);
          });
        });

        req.on('error', (e) => {
          console.warn('[Notification] Cloud API dispatch notice:', e.message);
        });

        req.write(payload);
        req.end();
      } catch (err) {
        console.warn('[Notification] Cloud API non-fatal error:', err.message);
      }
    }
  }

  // 2. Email notification fallback if SMTP credentials exist
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'vdhavade50@gmail.com';
      await transporter.sendMail({
        from: `"VMD Sports Alerts" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `🚨 New Product WhatsApp Enquiry: ${enquiryData.productName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #FF6B00; margin-top: 0;">New Product Enquiry Received</h2>
            <p>A customer clicked <strong>Inquiry on WhatsApp</strong> for a product.</p>
            ${enquiryData.productImageUrl ? `<img src="${enquiryData.productImageUrl}" alt="${enquiryData.productName}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px; margin: 15px 0;" />` : ''}
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Product:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${enquiryData.productName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Selling Price:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${Number(enquiryData.productDiscountPrice || enquiryData.productPrice).toLocaleString('en-IN')}</td></tr>
              ${enquiryData.productDiscountPrice && enquiryData.productDiscountPrice < enquiryData.productPrice ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>MRP:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${Number(enquiryData.productPrice).toLocaleString('en-IN')}</td></tr>` : ''}
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Size:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${enquiryData.selectedSize || 'N/A'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Color:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${enquiryData.selectedColor || 'N/A'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date (IST):</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${enquiryData.dateIST}</td></tr>
            </table>
          </div>
        `
      });
      console.log('[Notification] Email alert sent to VMD team:', recipient);
    } catch (err) {
      console.warn('[Notification] Email alert non-fatal notice:', err.message);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC: POST /api/analytics/whatsapp-enquiry
// Records a WhatsApp enquiry event BEFORE opening WhatsApp
// Supports existing MongoDB ObjectId or client-provided product payload
// ════════════════════════════════════════════════════════════════════════════
router.post(
  '/whatsapp-enquiry',
  enquiryLimiter,
  async (req, res) => {
    try {
      const {
        productId,
        productName,
        productPrice,
        productDiscountPrice,
        productImageUrl,
        productCategory,
        productSlug,
        selectedSize,
        selectedColor,
      } = req.body;

      let product = null;
      if (productId && mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId)
          .select('name images price discountPrice slug')
          .populate('category', 'name')
          .lean();
      }

      const finalName = product?.name || productName;
      if (!finalName) {
        return res.status(400).json({ success: false, message: 'Product name or valid productId is required' });
      }

      const finalImage = (product ? extractImageUrl(product.images) : null) || productImageUrl || null;
      const rawPrice = product ? product.price : (Number(productPrice) || 0);
      const rawDiscount = product ? (product.discountPrice || null) : (productDiscountPrice ? Number(productDiscountPrice) : null);
      const finalPrice = rawPrice;
      const finalDiscount = (rawDiscount != null && rawDiscount < rawPrice) ? rawDiscount : null;
      const finalCategory = product?.category?.name || productCategory || null;
      const finalSlug = product?.slug || productSlug || null;

      const now = new Date();
      const dateIST = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      const enquiryData = {
        productName: finalName,
        productImageUrl: finalImage,
        productPrice: Number(finalPrice),
        productDiscountPrice: finalDiscount,
        productCategory: finalCategory,
        productSlug: finalSlug,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
        eventType: 'whatsapp_enquiry',
        enquiredAt: now,
        dateIST,
        status: 'WhatsApp Opened',
      };

      if (product?._id) {
        enquiryData.productId = product._id;
      } else if (productId && mongoose.Types.ObjectId.isValid(productId)) {
        enquiryData.productId = productId;
      } else {
        enquiryData.productId = new mongoose.Types.ObjectId();
      }

      const enquiry = await WhatsappEnquiry.create(enquiryData);

      // Asynchronously trigger team notification (Cloud API / Email) without blocking customer response
      notifyVmdTeam(enquiryData).catch(err => {
        console.debug('[Notification] Non-fatal background notify error:', err.message);
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
