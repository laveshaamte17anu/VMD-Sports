const express = require('express');
const router = express.Router();
const WebsiteSettings = require('../models/WebsiteSettings');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/settings - Public (safe fields only)
router.get('/', async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({});
    }
    // Return only public-safe fields
    const publicSettings = {
      brandName: settings.brandName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      youtubeChannel: settings.youtubeChannel,
      youtubeChannelName: settings.youtubeChannelName,
      instagram: settings.instagram,
      facebook: settings.facebook,
      twitter: settings.twitter,
      contactEmail: settings.contactEmail,
      footerAbout: settings.footerAbout,
      address: settings.address,
      livestreamInfo: settings.livestreamInfo,
      generalPhone: settings.generalPhone,
      purchaseWhatsApp: settings.purchaseWhatsApp,
      livestreamWhatsApp: settings.livestreamWhatsApp,
      bookingWhatsApp: settings.bookingWhatsApp
    };
    res.json({ success: true, settings: publicSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/settings/admin - Admin (all fields)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) settings = await WebsiteSettings.create({});
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/settings - Admin
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings({ ...req.body, updatedBy: req.user._id });
    } else {
      Object.assign(settings, req.body);
      settings.updatedBy = req.user._id;
    }
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

