const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', default: null },
  audioUrl: { type: String, required: true },
  coverImage: { type: String, default: "" },
  album: { type: String, default: "" },
  duration: { type: String, default: "" },
  artistPhoto: { type: String, default: "" },
  artistCover: { type: String, default: "" },
  plays: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('track', trackSchema);
