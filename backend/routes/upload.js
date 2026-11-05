const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProduct, uploadGallery, uploadLogo, hasCloudinary } = require('../middleware/upload');

const resolveFileUrl = (req, file) => {
  if (hasCloudinary && file.path && file.path.startsWith('http')) {
    return file.path;
  }
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${file.filename}`;
};

// POST /api/upload/product - Admin
router.post('/product', protect, adminOnly, uploadProduct.array('images', 8), (req, res) => {
  try {
    const images = (req.files || []).map(f => ({
      url: resolveFileUrl(req, f),
      publicId: f.filename || `local-${Date.now()}`
    }));
    res.json({ success: true, images });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/upload/gallery - Admin
router.post('/gallery', protect, adminOnly, uploadGallery.array('images', 20), (req, res) => {
  try {
    const images = (req.files || []).map(f => ({
      url: resolveFileUrl(req, f),
      publicId: f.filename || `local-${Date.now()}`
    }));
    res.json({ success: true, images });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/upload/logo - Admin
router.post('/logo', protect, adminOnly, uploadLogo.single('logo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = resolveFileUrl(req, req.file);
    res.json({ success: true, url, publicId: req.file.filename });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
