const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  youtubeUrl: { type: String, required: true },
  youtubeId: { type: String, required: true },
  thumbnail: { type: String },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Extract YouTube ID before saving
videoSchema.pre('save', function(next) {
  if (this.youtubeUrl) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = this.youtubeUrl.match(regex);
    if (match) {
      this.youtubeId = match[1];
      this.thumbnail = `https://img.youtube.com/vi/${this.youtubeId}/maxresdefault.jpg`;
    }
  }
  next();
});

module.exports = mongoose.model('Video', videoSchema);

