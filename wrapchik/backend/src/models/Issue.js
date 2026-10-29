const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['WRONG_ITEM', 'MISSING_ITEM', 'QUALITY', 'LATE', 'OTHER'],
      required: [true, 'Issue category is required'],
    },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    adminResponse: { type: String, default: null },
    resolution: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);
