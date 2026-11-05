const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  tournament: { type: String, trim: true },
  tags: [String],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);

