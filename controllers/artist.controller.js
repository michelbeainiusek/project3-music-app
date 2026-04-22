const Artist = require('../models/artist.model');
const Song = require('../models/song.model');
const Playlist = require('../models/playlist.model');

exports.index = async (req, res, next) => {
  try {
    const artists = await Artist.find().sort({ name: 1 });
    res.render('artists/index', { title: 'Artists', artists });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).render('error', { title: '404', message: 'Artist not found.' });
    const songs = await Song.find({ artist: artist._id }).sort({ title: 1 });
    res.render('artists/show', { title: artist.name, artist, songs });
  } catch (err) {
    next(err);
  }
};

exports.renderCreate = (req, res) => {
  res.render('artists/create', { title: 'Add Artist' });
};

exports.create = async (req, res, next) => {
  try {
    const { name, country, bio } = req.body;
    await Artist.create({ name, country, bio });
    req.flash('success', 'Artist created successfully.');
    res.redirect('/artists');
  } catch (err) {
    req.flash('error', err.code === 11000 ? 'An artist with that name already exists.' : err.message);
    res.redirect('/artists/new');
  }
};

exports.renderEdit = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).render('error', { title: '404', message: 'Artist not found.' });
    res.render('artists/edit', { title: 'Edit Artist', artist });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, country, bio } = req.body;
    await Artist.findByIdAndUpdate(req.params.id, { name, country, bio }, { runValidators: true });
    req.flash('success', 'Artist updated successfully.');
    res.redirect(`/artists/${req.params.id}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/artists/${req.params.id}/edit`);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    // Collect song IDs before deleting so we can clean up playlist references
    const songs = await Song.find({ artist: req.params.id }, '_id');
    const songIds = songs.map((s) => s._id);
    if (songIds.length) {
      // Remove all those song IDs from every playlist that referenced them
      await Playlist.updateMany(
        { songs: { $in: songIds } },
        { $pull: { songs: { $in: songIds } } }
      );
    }
    await Song.deleteMany({ artist: req.params.id });
    await Artist.findByIdAndDelete(req.params.id);
    req.flash('success', 'Artist and their songs deleted.');
    res.redirect('/artists');
  } catch (err) {
    next(err);
  }
};

/*
  WHAT THIS FILE DOES AND WHY:
  - Full CRUD for Artist documents.
  - destroy also cascades: deletes all songs belonging to the artist.
  - Duplicate name errors (MongoDB code 11000) are presented as a readable message.
  - runValidators: true on update ensures Mongoose schema constraints are re-checked.
*/
