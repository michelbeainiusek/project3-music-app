const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/playlist.controller');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.get('/', requireAuth, ctrl.index); // get all playlists
router.get('/new', requireAuth, requireRole('admin'), ctrl.renderCreate); // render create playlist form
router.post('/', requireAuth, requireRole('admin'), ctrl.create); // create playlist
// Relationship management routes must come before /:id to avoid matching conflicts
router.get('/:id/songs', requireAuth, requireRole('admin'), ctrl.renderManageSongs); // render manage songs form
router.post('/:id/songs', requireAuth, requireRole('admin'), ctrl.updateSongs); // update songs
router.get('/:id', requireAuth, ctrl.show); // show playlist        
router.get('/:id/edit', requireAuth, requireRole('admin'), ctrl.renderEdit); // render edit playlist form
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update); // update playlist
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.destroy); // delete playlist

module.exports = router;
