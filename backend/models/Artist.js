const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: "",
    maxlength: 500
  },
  coverPhoto: {
    type: String,
    default: ""
  },
  profilePhoto: {
    type: String,
    default: ""
  },
  mobileNumber: {
    type: String,
    default: ""
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'track'
  }],
  totalPlays: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Artist', ArtistSchema);
