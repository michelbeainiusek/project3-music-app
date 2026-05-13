const Artist = require('../models/artist.model');
const Song = require('../models/song.model');
const Playlist = require('../models/playlist.model');

exports.index = async (req, res, next) => {
  try {
    const [artistCount, songCount, playlistCount] = await Promise.all([ //run3 queries in parallel
      Artist.countDocuments(),
      Song.countDocuments(),
      Playlist.countDocuments(), // count each and wait since promise
    ]);
    res.render('dashboard/index', { // render dashboard view with counts 5fartist etc
      title: 'Dashboard',
      artistCount,
      songCount,
      playlistCount,
    });
  } catch (err) {
    next(err);
  }
};

/*
  WHAT THIS FILE DOES AND WHY:
  - Fetches aggregate counts for each entity type in parallel using Promise.all
    to minimize DB round-trips.
  - Passes counts to the dashboard view so the user can see a quick overview.
*/
