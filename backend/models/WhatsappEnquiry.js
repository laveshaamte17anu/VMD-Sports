const mongoose = require('mongoose');

const whatsappEnquirySchema = new mongoose.Schema({
  // Product information at time of enquiry (denormalized for safe keeping)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
    index: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productImageUrl: {
    type: String,
    default: null,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productDiscountPrice: {
    type: Number,
    default: null,
  },
  productCategory: {
    type: String,
    default: null,
  },
  productSlug: {
    type: String,
    default: null,
  },
  selectedSize: {
    type: String,
    default: null,
  },
  selectedColor: {
    type: String,
    default: null,
  },

  // Event metadata
  eventType: {
    type: String,
    enum: ['whatsapp_enquiry'],
    default: 'whatsapp_enquiry',
  },
  enquiredAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  dateIST: {
    type: String,
    required: true,
    index: true,
  },

  // Admin management
  status: {
    type: String,
    enum: ['WhatsApp Opened', 'Contacted', 'Order Confirmed', 'Not Interested', 'Pending Confirmation'],
    default: 'WhatsApp Opened',
    index: true,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  versionKey: false,
});

whatsappEnquirySchema.index({ enquiredAt: -1 });
whatsappEnquirySchema.index({ productId: 1, enquiredAt: -1 });
whatsappEnquirySchema.index({ status: 1, enquiredAt: -1 });

module.exports = mongoose.model('WhatsappEnquiry', whatsappEnquirySchema);
