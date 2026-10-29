const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  confirmCounterPayment,
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/create', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/counter-confirm', protect, adminOnly, confirmCounterPayment);

module.exports = router;
