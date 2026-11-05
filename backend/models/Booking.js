const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true },
  customerName: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  serviceType: {
    type: String,
    required: true,
    enum: ['Cricket Photography', 'Match Videography', 'Full Match Coverage', 'Other Cricket Media Services']
  },
  matchDate: { type: Date, required: true },
  matchLocation: { type: String, required: true, trim: true },
  tournamentName: { type: String, trim: true },
  expectedDuration: { type: String, required: true },
  additionalRequirements: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Quotation Sent', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  estimatedPrice: { type: Number },
  quotationDetails: { type: String },
  adminNotes: { type: String },
  assignedCameraman: { type: String },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }]
}, { timestamps: true });

// Auto-generate reference number
bookingSchema.pre('save', async function(next) {
  if (!this.referenceNumber) {
    const count = await mongoose.model('Booking').countDocuments();
    const date = new Date();
    this.referenceNumber = `VMD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

