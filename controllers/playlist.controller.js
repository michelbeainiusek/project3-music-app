const Playlist = require('../models/playlist.model');
const Song = require('../models/song.model');

exports.index = async (req, res, next) => {
  try {
    const playlists = await Playlist.find().sort({ name: 1 });
    res.render('playlists/index', { title: 'Playlists', playlists });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({ path: 'songs', populate: { path: 'artist' } });
    if (!playlist) return res.status(404).render('error', { title: '404', message: 'Playlist not found.' });
    res.render('playlists/show', { title: playlist.name, playlist });
  } catch (err) {
    next(err);
  }
};

exports.renderCreate = (req, res) => {
  res.render('playlists/create', { title: 'Create Playlist' });
};

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    await Playlist.create({ name, description });
    req.flash('success', 'Playlist created successfully.');
    res.redirect('/playlists');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/playlists/new');
  }
};

exports.renderEdit = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).render('error', { title: '404', message: 'Playlist not found.' });
    res.render('playlists/edit', { title: 'Edit Playlist', playlist });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    await Playlist.findByIdAndUpdate(req.params.id, { name, description }, { runValidators: true });
    req.flash('success', 'Playlist updated.');
    res.redirect(`/playlists/${req.params.id}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/playlists/${req.params.id}/edit`);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (playlist) {
      await Song.updateMany({ playlists: playlist._id }, { $pull: { playlists: playlist._id } });
      await playlist.deleteOne();
    }
    req.flash('success', 'Playlist deleted.');
    res.redirect('/playlists');
  } catch (err) {
    next(err);
  }
};

exports.renderManageSongs = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    if (!playlist) return res.status(404).render('error', { title: '404', message: 'Playlist not found.' });
    const allSongs = await Song.find().populate('artist').sort({ title: 1 });
    res.render('playlists/manage-songs', { title: 'Manage Songs', playlist, allSongs });
  } catch (err) {
    next(err);
  }
};

exports.updateSongs = async (req, res, next) => {
  try {
    const { songs } = req.body;
    const newIds = songs
      ? Array.isArray(songs) ? songs : [songs]
      : [];
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      req.flash('error', 'Playlist not found.');
      return res.redirect('/playlists');
    }
    const oldIds = playlist.songs.map((id) => id.toString());

    const removed = oldIds.filter((id) => !newIds.includes(id));
    const added = newIds.filter((id) => !oldIds.includes(id));

    if (removed.length) await Song.updateMany({ _id: { $in: removed } }, { $pull: { playlists: playlist._id } });
    if (added.length) await Song.updateMany({ _id: { $in: added } }, { $addToSet: { playlists: playlist._id } });

    playlist.songs = newIds;
    await playlist.save();
    req.flash('success', 'Song assignments updated.');
    res.redirect(`/playlists/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};

/*
  WHAT THIS FILE DOES AND WHY:
  - Full CRUD for Playlist documents plus relationship management.
  - Relationship sync mirrors song.controller.js: diffs old vs new song arrays,
    uses $pull and $addToSet on Song documents to keep both sides of the
    many-to-many in sync.
  - destroy removes this playlist's _id from all songs' playlists arrays before deleting.
  - show uses a nested populate (songs → artist) so the playlist detail page can
    display both song titles and artist names.
*/
