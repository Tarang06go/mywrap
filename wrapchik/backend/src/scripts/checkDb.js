const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wrapchik';

async function checkDatabase() {
  try {
    console.log('\n==================================================');
    console.log('🔍 CONNECTING TO WRAPCHIK MONGODB DATABASE...');
    console.log('==================================================');

    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to: ${MONGO_URI}\n`);

    const User = require('../models/User');
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const Category = require('../models/Category');

    const users = await User.find().select('-passwordHash');
    const orders = await Order.find().populate('userId', 'name email phone');
    const products = await Product.find();
    const categories = await Category.find();

    console.log('--------------------------------------------------');
    console.log(`👤 REGISTERED USERS (${users.length}):`);
    console.log('--------------------------------------------------');
    console.dir(users, { depth: null, colors: true });

    console.log('\n--------------------------------------------------');
    console.log(`📦 LIVE ORDERS IN DATABASE (${orders.length}):`);
    console.log('--------------------------------------------------');
    console.dir(orders, { depth: null, colors: true });

    console.log('\n--------------------------------------------------');
    console.log(`🍕 PRODUCTS IN MENU (${products.length}):`);
    console.log('--------------------------------------------------');
    console.dir(products, { depth: null, colors: true });

    console.log('\n--------------------------------------------------');
    console.log(`🏷️ CATEGORIES (${categories.length}):`);
    console.log('--------------------------------------------------');
    console.dir(categories, { depth: null, colors: true });

    console.log('\n==================================================');
    console.log('✨ DATABASE CHECK COMPLETE!');
    console.log('==================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Database Check Error:', err.message);
    process.exit(1);
  }
}

checkDatabase();
