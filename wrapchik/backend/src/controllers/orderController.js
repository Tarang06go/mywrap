const Order = require('../models/Order');
const Product = require('../models/Product');
const socketManager = require('../config/socketManager');

// @desc    Create new order & recalculate price server-side
// @route   POST /api/orders
// @access  Private (Student)
const createOrder = async (req, res, next) => {
  try {
    const { items, pickupTimeSlot, pickupLocation, orderType = 'TAKEAWAY', hostel, roomNumber, deliveryInstructions, tableId, idempotencyKey } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items cannot be empty',
      });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({ success: false, message: 'Each item must have a valid productId and quantity greater than 0' });
      }
    }

    const allowedOrderTypes = ['TAKEAWAY', 'DELIVERY', 'DINE_IN'];
    if (!allowedOrderTypes.includes(orderType)) {
      return res.status(400).json({ success: false, message: 'Invalid orderType' });
    }

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey, userId: req.user._id });
      if (existingOrder) {
        await existingOrder.populate('userId', 'name email phone');
        return res.status(200).json({
          success: true,
          message: 'Order already placed (Idempotent response)',
          order: existingOrder,
        });
      }
    }

    const RestaurantSettings = require('../models/RestaurantSettings');
    const settings = await RestaurantSettings.getSettings();
    if (!settings.acceptingOrders) {
      return res.status(503).json({ success: false, message: 'Restaurant is currently not accepting orders. Please try again later.' });
    }

    if (orderType === 'DELIVERY') {
      if (!hostel || String(hostel).trim() === '' || !roomNumber || String(roomNumber).trim() === '') {
        return res.status(400).json({ success: false, message: 'Hostel and room number are required for delivery' });
      }
    } else if (orderType === 'DINE_IN') {
      if (!tableId || !tableId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, message: 'Table ID is required and must be a valid ObjectId for dine-in' });
      }
      const Table = require('../models/Table');
      const table = await Table.findById(tableId);
      if (!table || table.status !== 'AVAILABLE') {
        return res.status(400).json({ success: false, message: 'Table is not available' });
      }
    }

    let verifiedItems = [];
    let calculatedSubtotal = 0;

    // Backend Business Rule 1 & 2: Validate product availability and recalculate prices from DB
    for (const reqItem of items) {
      const product = await Product.findById(reqItem.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${reqItem.name || reqItem.productId}`,
        });
      }

      if (!product.available) {
        return res.status(400).json({
          success: false,
          message: `Item "${product.name}" is currently unavailable/out of stock.`,
        });
      }

      let itemUnitPrice = product.price;
      let selectedCustomizations = [];

      // Validate and compute customizations price
      if (reqItem.customizations && Array.isArray(reqItem.customizations)) {
        for (const cust of reqItem.customizations) {
          const matchedCust = product.customizations.find(
            (c) => c.name === cust.name
          );
          if (matchedCust) {
            itemUnitPrice += matchedCust.price;
            selectedCustomizations.push({
              name: matchedCust.name,
              price: matchedCust.price,
            });
          }
        }
      }

      const qty = Number(reqItem.quantity) || 1;
      const lineTotal = itemUnitPrice * qty;
      calculatedSubtotal += lineTotal;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        priceAtPurchase: itemUnitPrice,
        quantity: qty,
        customizations: selectedCustomizations,
        itemTotal: lineTotal,
      });
    }

    const taxAndFees = Math.round(calculatedSubtotal * 0.05); // 5% GST/Platform Fee
    let totalAmount = calculatedSubtotal + taxAndFees;

    if (orderType === 'DELIVERY') {
      totalAmount += settings.deliveryFee || 0;
    }

    // Generate unique Order Number
    const orderNumber = `WRP-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      userId: req.user._id,
      orderNumber,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      taxAndFees,
      totalAmount,
      pickupLocation: orderType === 'TAKEAWAY' ? (pickupLocation || 'Wrapchik Counter, SAC Ground Floor') : undefined,
      pickupTimeSlot: orderType === 'TAKEAWAY' ? (pickupTimeSlot || '15-20 Mins') : undefined,
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      orderType,
      hostel: orderType === 'DELIVERY' ? hostel : undefined,
      roomNumber: orderType === 'DELIVERY' ? roomNumber : undefined,
      deliveryInstructions: orderType === 'DELIVERY' ? deliveryInstructions : undefined,
      tableId: orderType === 'DINE_IN' ? tableId : undefined,
      estimatedPrepTime: settings.estimatedPrepMinutes,
      idempotencyKey,
    });

    if (orderType === 'DINE_IN') {
      const Table = require('../models/Table');
      const table = await Table.findById(tableId);
      if (table) {
        table.status = 'OCCUPIED';
        table.currentOrderId = order._id;
        await table.save();
      }
    }

    // Populate user info for immediate response
    await order.populate('userId', 'name email phone');

    socketManager.emitNewOrder(order);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully (Pay at Counter)',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Rule 3: Enforce authorization check (Must belong to user or user is admin)
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order details',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel student's order (Only if status is PLACED)
// @route   POST /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized action',
      });
    }

    if (order.orderStatus !== 'PLACED') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order after it has been ${order.orderStatus.toLowerCase()}`,
      });
    }

    order.orderStatus = 'CANCELLED';
    order.paymentStatus = 'CANCELLED';
    await order.save();

    socketManager.emitOrderUpdate(order);

    if (order.orderType === 'DINE_IN') {
      const Table = require('../models/Table');
      await Table.findByIdAndUpdate(order.tableId, { status: 'AVAILABLE', currentOrderId: null });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

const reorderFromPast = async (req, res, next) => {
  try {
    const pastOrder = await Order.findById(req.params.id);
    if (!pastOrder) return res.status(404).json({ success: false, message: 'Order not found' });
    if (pastOrder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const reorderItems = [];
    const unavailableItems = [];
    
    for (const item of pastOrder.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.available) {
        unavailableItems.push({ name: item.name, reason: product ? 'Currently unavailable' : 'No longer on menu' });
        continue;
      }
      // Use CURRENT price, not historical
      let unitPrice = product.price;
      const validCustomizations = [];
      if (item.customizations) {
        for (const cust of item.customizations) {
          const matchedCust = product.customizations.find(c => c.name === cust.name);
          if (matchedCust) {
            unitPrice += matchedCust.price;
            validCustomizations.push({ name: matchedCust.name, price: matchedCust.price });
          }
        }
      }
      reorderItems.push({
        productId: product._id,
        name: product.name,
        basePrice: product.price,
        unitPrice,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
        isVeg: product.isVeg,
        customizations: validCustomizations,
      });
    }
    
    res.json({
      success: true,
      reorderItems,
      unavailableItems,
      message: unavailableItems.length > 0 ? `${unavailableItems.length} item(s) are no longer available` : 'All items available',
    });
  } catch (error) { next(error); }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  reorderFromPast,
};
