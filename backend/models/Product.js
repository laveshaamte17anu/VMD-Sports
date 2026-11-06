const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ url: String, publicId: String }],
  price: { type: Number, required: true, min: 0 },
  discountPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(val) {
        if (val == null || val === '') return true;
        const currentPrice = this.price != null
          ? this.price
          : (this.getUpdate ? (this.getUpdate().$set?.price ?? this.getUpdate()?.price) : null);
        if (currentPrice != null) {
          return val < currentPrice;
        }
        return true;
      },
      message: 'Selling / Offer price ({VALUE}) must be strictly lower than regular MRP price.'
    }
  },
  sizes: [{
    size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL'] },
    stock: { type: Number, default: 0, min: 0 }
  }],
  colors: [{ name: String, hex: String }],
  totalStock: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'draft', 'out_of_stock'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  material: String,
  careInstructions: String,
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-calculate totalStock from sizes
productSchema.pre('save', function(next) {
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);

