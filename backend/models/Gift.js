const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  fromName: { type: String, default: "Anonymous" },
  toArtistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  toArtistName: { type: String, required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  artistAmount: { type: Number, required: true },
  senderPhone: { type: String, required: true },
  artistPhone: { type: String, default: "" },
  message: { type: String, default: "" },
  giftCard: { type: String, default: "" },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gift', giftSchema);
