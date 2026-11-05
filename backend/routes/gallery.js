const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, adminOnly } = require('../middleware/auth');
const { cloudinary } = require('../middleware/upload');

// GET /api/gallery - Public
router.get('/', async (req, res) => {
  try {
    const { tournament } = req.query;
    const filter = { isActive: true };
    if (tournament) filter.tournament = { $regex: tournament, $options: 'i' };
    const images = await Gallery.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/gallery/tournaments - Public (get unique tournaments)
router.get('/tournaments', async (req, res) => {
  try {
    const tournaments = await Gallery.distinct('tournament', { isActive: true, tournament: { $ne: '' } });
    res.json({ success: true, tournaments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/gallery - Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const image = new Gallery({ ...req.body, uploadedBy: req.user._id });
    await image.save();
    res.status(201).json({ success: true, image });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/gallery/:id - Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, image });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/gallery/:id - Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    await image.deleteOne();
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

