const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: false, // Defaults to false until a spot is offered
    },
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User who is offering the parking spot
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User who claims the parking spot
    },
    tokensOffered: {
      type: Number,
      default: 0, // Number of tokens offered by the user leaving the spot
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);