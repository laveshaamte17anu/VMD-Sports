const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['general', 'merchandise', 'booking', 'livestream'],
    default: 'general'
  },
  isRead: { type: Boolean, default: false },
  isReplied: { type: Boolean, default: false },
  adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);

