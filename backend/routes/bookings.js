const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/bookings - Public (submit booking request)
router.post('/', [
  body('customerName').notEmpty().trim(),
  body('mobileNumber').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('serviceType').isIn(['Cricket Photography', 'Match Videography', 'Full Match Coverage', 'Other Cricket Media Services']),
  body('matchDate').isISO8601().toDate(),
  body('matchLocation').notEmpty().trim(),
  body('expectedDuration').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. Our team will review and contact you shortly.',
      referenceNumber: booking.referenceNumber,
      booking
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/status/:ref - Public (check status)
router.get('/status/:ref', async (req, res) => {
  try {
    const booking = await Booking.findOne({ referenceNumber: req.params.ref })
      .select('referenceNumber customerName serviceType matchDate status statusHistory estimatedPrice quotationDetails createdAt');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found. Check the reference number.' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings - Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Booking.countDocuments(filter)
    ]);
    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id - Admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id - Admin (update status, notes, etc.)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes, estimatedPrice, quotationDetails, assignedCameraman } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (status && status !== booking.status) {
      booking.statusHistory.push({ status, changedBy: req.user._id, note: adminNotes });
      booking.status = status;
    }
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    if (estimatedPrice !== undefined) booking.estimatedPrice = estimatedPrice;
    if (quotationDetails !== undefined) booking.quotationDetails = quotationDetails;
    if (assignedCameraman !== undefined) booking.assignedCameraman = assignedCameraman;

    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/admin/stats - Admin
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const result = {};
    stats.forEach(s => { result[s._id] = s.count; });
    result.total = await Booking.countDocuments();
    res.json({ success: true, stats: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

