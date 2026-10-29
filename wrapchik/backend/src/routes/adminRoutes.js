const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
} = require('../controllers/adminController');
const { getAllIssues, resolveIssue } = require('../controllers/issueController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/analytics', getAnalytics);

router.get('/issues', getAllIssues);
router.put('/issues/:id/resolve', resolveIssue);

module.exports = router;
