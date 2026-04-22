const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/artist.controller');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// All artist routes require authentication
router.get('/', requireAuth, ctrl.index);
router.get('/new', requireAuth, requireRole('admin'), ctrl.renderCreate);
router.post('/', requireAuth, requireRole('admin'), ctrl.create);
router.get('/:id', requireAuth, ctrl.show);
router.get('/:id/edit', requireAuth, requireRole('admin'), ctrl.renderEdit);
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.destroy);

module.exports = router;
