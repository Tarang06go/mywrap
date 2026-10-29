const RestaurantSettings = require('../models/RestaurantSettings');

const getSettings = async (req, res, next) => {
  try {
    const settings = await RestaurantSettings.getSettings();
    res.json({ success: true, settings });
  } catch (error) { next(error); }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await RestaurantSettings.getSettings();
    const allowedFields = ['acceptingOrders', 'openTime', 'closeTime', 'busyStatus', 'deliveryEnabled', 'dineInEnabled', 'takeawayEnabled', 'estimatedPrepMinutes', 'deliveryFee'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    }
    await settings.save();
    res.json({ success: true, message: 'Restaurant settings updated', settings });
  } catch (error) { next(error); }
};

module.exports = { getSettings, updateSettings };
