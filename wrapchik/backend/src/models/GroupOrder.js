const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['JOINED', 'LEFT'], default: 'JOINED' },
});

const groupOrderSchema = new mongoose.Schema(
  {
    groupCode: { type: String, required: true, unique: true, uppercase: true },
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [groupMemberSchema],
    status: { type: String, enum: ['OPEN', 'LOCKED', 'ORDERED', 'COMPLETED'], default: 'OPEN' },
    orderType: { type: String, enum: ['DELIVERY', 'TAKEAWAY', 'DINE_IN'], default: 'TAKEAWAY' },
    hostel: { type: String, default: null },
    roomNumber: { type: String, default: null },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    maxMembers: { type: Number, default: 8, min: 2 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
