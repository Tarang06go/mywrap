const Order = require('../models/Order');
const Product = require('../models/Product');

const socketManager = require('../config/socketManager');

// Allowed status transition state machine map
const TRANSITIONS_BY_TYPE = {
  TAKEAWAY: {
    PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY'],
    READY: ['COMPLETED'],
    COMPLETED: [], REJECTED: [], CANCELLED: [],
  },
  DELIVERY: {
    PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY'],
    READY: ['PICKED_UP'],
    PICKED_UP: ['DELIVERED'],
    DELIVERED: [], REJECTED: [], CANCELLED: [],
  },
  DINE_IN: {
    PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['SERVED'],
    SERVED: ['COMPLETED'],
    COMPLETED: [], REJECTED: [], CANCELLED: [],
  },
};

// @desc    Get all orders for admin shopkeeper
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Enforce state machine rule 7)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required',
      });
    }

    const order = await Order.findById(req.params.id).populate('userId', 'name email phone pushToken');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const currentStatus = order.orderStatus;
    const allowedNextStatuses = TRANSITIONS_BY_TYPE[order.orderType || 'TAKEAWAY'][currentStatus] || [];

    // Check invalid transition
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status transition from ${currentStatus} to ${status}. Allowed next states: ${allowedNextStatuses.join(', ') || 'None (Terminal state)'}`,
      });
    }

    order.orderStatus = status;
    if (status === 'REJECTED' && rejectionReason) {
      order.rejectionReason = rejectionReason;
    }

    await order.save();

    const { createNotification } = require('./notificationController');
    const userId = order.userId._id || order.userId;
    const statusMessages = {
      ACCEPTED: 'Your order has been accepted and is being processed!',
      PREPARING: 'Your order is now being prepared in the kitchen!',
      READY: 'Your order is ready for pickup!',
      COMPLETED: 'Your order has been completed. Enjoy your meal!',
      PICKED_UP: 'Your order has been picked up by the delivery person!',
      DELIVERED: 'Your order has been delivered! Enjoy your meal!',
      SERVED: 'Your food has been served at your table!',
      REJECTED: `Your order was rejected. Reason: ${rejectionReason || 'Not specified'}`,
      CANCELLED: 'Your order has been cancelled.',
    };
    const message = statusMessages[status] || `Order status updated to ${status}`;
    await createNotification(userId, `Order #${order.orderNumber} Update`, message);

    socketManager.emitOrderUpdate(order);

    if (order.orderType === 'DINE_IN' && (status === 'COMPLETED' || status === 'CANCELLED' || status === 'REJECTED')) {
      const Table = require('../models/Table');
      await Table.findByIdAndUpdate(order.tableId, { status: 'AVAILABLE', currentOrderId: null });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['PLACED', 'ACCEPTED', 'PREPARING'] } });
    const completedOrders = await Order.countDocuments({ orderStatus: 'COMPLETED' });
    const totalProducts = await Product.countDocuments();

    // Calculate revenue
    const revenueAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'SUCCESS', orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Calculate today's revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayRevenueAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'SUCCESS',
          orderStatus: { $ne: 'CANCELLED' },
          createdAt: { $gte: startOfToday },
        },
      },
      { $group: { _id: null, todayRevenue: { $sum: '$totalAmount' } } },
    ]);

    const todayRevenue = todayRevenueAgg.length > 0 ? todayRevenueAgg[0].todayRevenue : 0;
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

    const ordersByType = await Order.aggregate([
      { $group: { _id: '$orderType', count: { $sum: 1 } } }
    ]);
    const popularProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', name: { $first: '$items.name' }, totalQuantity: { $sum: '$items.quantity' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      analytics: {
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        totalProducts,
        totalRevenue,
        todayRevenue,
        ordersByType,
        popularProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
};
