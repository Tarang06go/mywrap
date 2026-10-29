const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
    },
    label: {
      type: String,
      default: '',
      trim: true,
    },
    capacity: {
      type: Number,
      default: 4,
      min: 1,
    },
    qrCode: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
      default: 'AVAILABLE',
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Table', tableSchema);
