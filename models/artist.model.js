const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, unique: true, trim: true, minlength: 1 },
    country: { type: String, default: 'Unknown', trim: true },
    bio:     { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artist', artistSchema);

/*
  WHAT THIS FILE DOES AND WHY:
  - Defines the Artist document. Adapted from project2/models/artist.model.js.
  - One-to-many owner side: Song documents each store one Artist ObjectId reference.
  - unique: true on name prevents duplicate artists in the collection.
*/
