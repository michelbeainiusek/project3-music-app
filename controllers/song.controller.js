const Song = require('../models/song.model');
const Artist = require('../models/artist.model');
const Playlist = require('../models/playlist.model');

exports.index = async (req, res, next) => {
  try {
    const songs = await Song.find().populate('artist').sort({ title: 1 });
    res.render('songs/index', { title: 'Songs', songs });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist')
      .populate('playlists');
    if (!song) return res.status(404).render('error', { title: '404', message: 'Song not found.' });
    res.render('songs/show', { title: song.title, song });
  } catch (err) {
    next(err);
  }
};

exports.renderCreate = async (req, res, next) => {
  try {
    const artists = await Artist.find().sort({ name: 1 });
    const playlists = await Playlist.find().sort({ name: 1 });
    res.render('songs/create', { title: 'Add Song', artists, playlists });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, duration, releaseYear, artist, playlists } = req.body;
    const playlistIds = playlists
      ? Array.isArray(playlists) ? playlists : [playlists]
      : [];
    const song = await Song.create({ title, duration, releaseYear, artist, playlists: playlistIds });
    // Sync: add this song to each selected playlist's songs array
    if (playlistIds.length) {
      await Playlist.updateMany({ _id: { $in: playlistIds } }, { $addToSet: { songs: song._id } });
    }
    req.flash('success', 'Song created successfully.');
    res.redirect('/songs');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/songs/new');
  }
};

exports.renderEdit = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).render('error', { title: '404', message: 'Song not found.' });
    const artists = await Artist.find().sort({ name: 1 });
    const playlists = await Playlist.find().sort({ name: 1 });
    res.render('songs/edit', { title: 'Edit Song', song, artists, playlists });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, duration, releaseYear, artist, playlists } = req.body;
    const newIds = playlists
      ? Array.isArray(playlists) ? playlists : [playlists]
      : [];
    const existing = await Song.findById(req.params.id);
    if (!existing) {
      req.flash('error', 'Song not found.');
      return res.redirect('/songs');
    }
    const oldIds = existing.playlists.map((id) => id.toString());

    const removed = oldIds.filter((id) => !newIds.includes(id));
    const added = newIds.filter((id) => !oldIds.includes(id));

    if (removed.length) await Playlist.updateMany({ _id: { $in: removed } }, { $pull: { songs: existing._id } });
    if (added.length) await Playlist.updateMany({ _id: { $in: added } }, { $addToSet: { songs: existing._id } });

    await Song.findByIdAndUpdate(
      req.params.id,
      { title, duration, releaseYear, artist, playlists: newIds },
      { runValidators: true }
    );
    req.flash('success', 'Song updated successfully.');
    res.redirect(`/songs/${req.params.id}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/songs/${req.params.id}/edit`);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (song) {
      await Playlist.updateMany({ songs: song._id }, { $pull: { songs: song._id } });
      await song.deleteOne();
    }
    req.flash('success', 'Song deleted.');
    res.redirect('/songs');
  } catch (err) {
    next(err);
  }
};

exports.renderManagePlaylists = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id).populate('playlists');
    if (!song) return res.status(404).render('error', { title: '404', message: 'Song not found.' });
    const allPlaylists = await Playlist.find().sort({ name: 1 });
    res.render('songs/manage-playlists', { title: 'Manage Playlists', song, allPlaylists });
  } catch (err) {
    next(err);
  }
};

exports.updatePlaylists = async (req, res, next) => {
  try {
    const { playlists } = req.body;
    const newIds = playlists
      ? Array.isArray(playlists) ? playlists : [playlists]
      : [];
    const song = await Song.findById(req.params.id);
    const oldIds = song.playlists.map((id) => id.toString());

    const removed = oldIds.filter((id) => !newIds.includes(id));
    const added = newIds.filter((id) => !oldIds.includes(id));

    if (removed.length) await Playlist.updateMany({ _id: { $in: removed } }, { $pull: { songs: song._id } });
    if (added.length) await Playlist.updateMany({ _id: { $in: added } }, { $addToSet: { songs: song._id } });

    song.playlists = newIds;
    await song.save();
    req.flash('success', 'Playlist assignments updated.');
    res.redirect(`/songs/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};

/*
  WHAT THIS FILE DOES AND WHY:
  - Full CRUD for Song documents plus relationship management.
  - Relationship sync pattern: when playlists change on a song, the controller
    diffs old vs new playlist arrays, then uses $pull and $addToSet on Playlist
    documents to keep both sides of the many-to-many consistent.
  - destroy removes this song's _id from all playlists' songs arrays before deleting.
  - renderManagePlaylists / updatePlaylists handle the dedicated relationship view.
*/
