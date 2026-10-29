const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  priceAtPurchase: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  customizations: [
    {
      name: String,
      price: Number,
    },
  ],
  itemTotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    taxAndFees: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    pickupLocation: {
      type: String,
      default: 'Wrapchik Campus Counter, Student Activity Center',
    },
    pickupTimeSlot: {
      type: String,
      default: 'Immediate (15-20 mins)',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'COMPLETED',
        'PICKED_UP',
        'DELIVERED',
        'SERVED',
        'REJECTED',
        'CANCELLED',
      ],
      default: 'PLACED',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    orderType: { type: String, enum: ['DELIVERY', 'TAKEAWAY', 'DINE_IN'], default: 'TAKEAWAY' },
    hostel: { type: String, default: null },
    roomNumber: { type: String, default: null },
    deliveryInstructions: { type: String, default: null },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    deliveryStatus: { type: String, enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED', null], default: null },
    estimatedPrepTime: { type: Number, default: 15 },
    estimatedDeliveryTime: { type: Date, default: null },
    courierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    groupOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder', default: null },
    idempotencyKey: { type: String, default: null, index: { unique: true, sparse: true } },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
