const mongoose = require('mongoose');

const restaurantSettingsSchema = new mongoose.Schema(
  {
    acceptingOrders: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String,
      default: '09:00',
    },
    closeTime: {
      type: String,
      default: '23:00',
    },
    busyStatus: {
      type: String,
      enum: ['NORMAL', 'BUSY', 'VERY_BUSY'],
      default: 'NORMAL',
    },
    deliveryEnabled: {
      type: Boolean,
      default: true,
    },
    dineInEnabled: {
      type: Boolean,
      default: true,
    },
    takeawayEnabled: {
      type: Boolean,
      default: true,
    },
    estimatedPrepMinutes: {
      type: Number,
      default: 15,
      min: 5,
    },
    deliveryFee: {
      type: Number,
      default: 20,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
restaurantSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('RestaurantSettings', restaurantSettingsSchema);
