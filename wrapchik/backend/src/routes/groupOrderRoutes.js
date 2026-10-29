const express = require('express');
const router = express.Router();
const { createGroup, joinGroup, getGroupDetails, lockGroup, leaveGroup } = require('../controllers/groupOrderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGroup);
router.post('/join', protect, joinGroup);
router.get('/:id', protect, getGroupDetails);
router.post('/:id/lock', protect, lockGroup);
router.post('/:id/leave', protect, leaveGroup);

module.exports = router;
