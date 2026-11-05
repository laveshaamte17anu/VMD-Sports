const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema({
  // Contact Numbers
  purchaseWhatsApp: { type: String, default: '' },
  livestreamWhatsApp: { type: String, default: '' },
  bookingWhatsApp: { type: String, default: '' },
  generalPhone: { type: String, default: '' },
  // Email
  contactEmail: { type: String, default: '' },
  bookingEmail: { type: String, default: '' },
  // Brand
  brandName: { type: String, default: 'VMD Sports' },
  tagline: { type: String, default: 'Behind Every Great Match, There\'s a Story.' },
  logoUrl: { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  faviconUrl: { type: String, default: '' },
  // Social Media
  youtubeChannel: { type: String, default: '' },
  youtubeChannelName: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  // Footer
  footerAbout: { type: String, default: 'VMD Sports – Premium cricket media and merchandise brand.' },
  address: { type: String, default: '' },
  // Live Streaming
  livestreamInfo: { type: String, default: '' },
  // Admin
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);

