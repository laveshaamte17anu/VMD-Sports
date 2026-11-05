const mongoose = require('mongoose');

const productClickSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
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
    default: null,
  },
  eventType: {
    type: String,
    enum: ['card_click', 'detail_view'],
    default: 'card_click',
  },
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // IST date string for easy daily grouping (YYYY-MM-DD in Asia/Kolkata)
  dateIST: {
    type: String,
    required: true,
  },
}, {
  timestamps: false,
  versionKey: false,
});

// Compound index for fast aggregation queries
productClickSchema.index({ productId: 1, clickedAt: -1 });
productClickSchema.index({ dateIST: 1, productId: 1 });
productClickSchema.index({ clickedAt: -1 });

module.exports = mongoose.model('ProductClick', productClickSchema);
