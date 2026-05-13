const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    releaseYear: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true, // song must have an artist
    },
    playlists: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Song', songSchema);

/*
  WHAT THIS FILE DOES AND WHY:
  - Defines the Song document. Adapted from project2/models/song.model.js.
  - Many-to-one with Artist: `artist` stores a single ObjectId ref.
  - Many-to-many with Playlist: `playlists` stores an array of ObjectId refs.
    The Playlist model also holds `songs` refs — both sides are kept in sync
    by song.controller.js and playlist.controller.js on create/update/delete.
  - duration is stored in seconds; views format it as MM:SS.
*/
