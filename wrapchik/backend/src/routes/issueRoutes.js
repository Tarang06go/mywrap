const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createIssue, getMyIssues } = require('../controllers/issueController');

router.post('/', protect, createIssue);
router.get('/my', protect, getMyIssues);

module.exports = router;
