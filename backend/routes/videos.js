const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/videos - Public
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const filter = { isActive: true };
    if (featured === 'true') filter.isFeatured = true;
    const videos = await Video.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/videos - Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const video = new Video({ ...req.body, addedBy: req.user._id });
    await video.save();
    res.status(201).json({ success: true, video });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/videos/:id - Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, video });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/videos/:id - Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Video removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

