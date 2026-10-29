const User = require('../models/User');
const Product = require('../models/Product');

const getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favourites');
    res.json({ success: true, favourites: user.favourites || [] });
  } catch (error) { next(error); }
};

const addFavourite = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    const user = await User.findById(req.user._id);
    if (user.favourites.includes(productId)) {
      return res.json({ success: true, message: 'Already in favourites', favourites: user.favourites });
    }
    user.favourites.push(productId);
    await user.save();
    res.json({ success: true, message: 'Added to favourites', favourites: user.favourites });
  } catch (error) { next(error); }
};

const removeFavourite = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    user.favourites = user.favourites.filter(id => id.toString() !== productId);
    await user.save();
    res.json({ success: true, message: 'Removed from favourites', favourites: user.favourites });
  } catch (error) { next(error); }
};

module.exports = { getFavourites, addFavourite, removeFavourite };
