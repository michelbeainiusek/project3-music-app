const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/artist.controller');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// All artist routes require authentication
router.get('/', requireAuth, ctrl.index);// get all artists
router.get('/new', requireAuth, requireRole('admin'), ctrl.renderCreate); // render create artist form
router.post('/', requireAuth, requireRole('admin'), ctrl.create); // create artist
router.get('/:id', requireAuth, ctrl.show); // show artist
router.get('/:id/edit', requireAuth, requireRole('admin'), ctrl.renderEdit); // render edit artist form
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update); // update artist
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.destroy); // delete artist

module.exports = router;
