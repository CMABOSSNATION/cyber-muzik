const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Playlist name is required'], // Added custom error message
    trim: true 
  },
  description: { type: String },
  coverImage: { type: String },
  // Ensure 'User' and 'Track' models are actually defined elsewhere
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tracks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Track' 
  }],
  isPublic: { type: Boolean, default: true }
}, { timestamps: true }); // Good practice for sorting by "recently created"

// Prevent model overwrite error during re-deploys
module.exports = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
