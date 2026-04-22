const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/playlist.controller');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.get('/', requireAuth, ctrl.index);
router.get('/new', requireAuth, requireRole('admin'), ctrl.renderCreate);
router.post('/', requireAuth, requireRole('admin'), ctrl.create);
// Relationship management routes must come before /:id to avoid matching conflicts
router.get('/:id/songs', requireAuth, requireRole('admin'), ctrl.renderManageSongs);
router.post('/:id/songs', requireAuth, requireRole('admin'), ctrl.updateSongs);
router.get('/:id', requireAuth, ctrl.show);
router.get('/:id/edit', requireAuth, requireRole('admin'), ctrl.renderEdit);
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.destroy);

module.exports = router;
