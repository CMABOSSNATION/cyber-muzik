const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to their login account
  name: { type: String, required: true },
  bio: { type: String },
  bannerImage: { type: String },
  isVerified: { type: Boolean, default: false },
  monthlyListeners: { type: Number, default: 0 },
  totalStreams: { type: Number, default: 0 },
  socials: {
    instagram: String,
    twitter: String
  }
});

module.exports = mongoose.model('Artist', ArtistSchema);
