const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filtering & search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { search, category, veg, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Category filter
    if (category) {
      query.categoryId = category;
    }

    // Veg filter
    if (veg !== undefined) {
      query.isVeg = veg === 'true';
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Sort order
    const sortParams = {};
    if (['price', 'name', 'createdAt'].includes(sortBy)) {
      sortParams[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortParams['createdAt'] = -1;
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name imageUrl')
      .sort(sortParams);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, categoryId, imageUrl, isVeg, available, customizations } = req.body;

    if (!name || !description || price === undefined || !categoryId || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required product details (name, description, price, categoryId, imageUrl)',
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID provided',
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      categoryId,
      imageUrl,
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      available: available !== undefined ? Boolean(available) : true,
      customizations: customizations || [],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const { name, description, price, categoryId, imageUrl, isVeg, available, customizations } = req.body;

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
      });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (categoryId) product.categoryId = categoryId;
    if (imageUrl) product.imageUrl = imageUrl;
    if (isVeg !== undefined) product.isVeg = Boolean(isVeg);
    if (available !== undefined) product.available = Boolean(available);
    if (customizations) product.customizations = customizations;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick toggle product availability
// @route   PATCH /api/products/:id/availability
// @access  Private/Admin
const toggleProductAvailability = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.available = !product.available;
    await product.save();

    res.json({
      success: true,
      message: `Product availability set to ${product.available ? 'AVAILABLE' : 'UNAVAILABLE'}`,
      available: product.available,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  deleteProduct,
};
