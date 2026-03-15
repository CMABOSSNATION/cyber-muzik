const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'default-avatar.png' },
  // Store IDs of tracks the user has liked
  likedTracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  // Reference to playlists they created
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
