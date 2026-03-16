const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  audioUrl: { type: String, required: true },
  imageUrl: { type: String },
  album: { type: String },
  duration: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('track', trackSchema);
