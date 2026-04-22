const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    songs: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);

/*
  WHAT THIS FILE DOES AND WHY:
  - Defines the Playlist document. Adapted from project2/models/playlist.model.js.
  - Many-to-many with Song: `songs` stores an array of ObjectId refs to Song documents.
  - The other side of this relationship lives in Song.playlists.
  - Both sides are kept in sync by controllers whenever songs are added/removed.
*/
