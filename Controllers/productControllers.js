const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'No products found',
      });
    }
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true });

    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'No featured products found',
      });
    }

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = req.user || null;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.render('productDetails', { product, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, price, quantity, category, description, image } = req.body;
    if (!name || !price || !quantity || !category || !description || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all the details',
      });
    }
    const product = await Product.create({
      name,
      price,
      quantity,
      category,
      description,
      image,
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product not created',
      });
    }

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({
      success: true,
      message: 'Product is deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const user = req.user || null;

    if (category === 'all') {
      {
        const products = await Product.find();
        const categories = await Product.distinct('category');

        if (!products) {
          return res.status(404).json({
            success: false,
            message: 'No products found',
          });
        }

        return res.render('productsByCategory', {
          category,
          products,
          categories,
          user,
        });
      }
    }

    const products = await Product.find({ category });
    const categories = await Product.distinct('category');

    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'No products found',
      });
    }

    res.render('productsByCategory', {
      category,
      products,
      categories,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProductsBySearch = async (req, res) => {
  try {
    const search = req.query.search;
    const products = await Product.find({
      name: { $regex: search, $options: 'i' },
    });

    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'No products found',
      });
    }

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSpecialProducts = async (req, res) => {
  try {
    let offer = req.params.offer;
    const user = req.user || null;
    let products;
    offer = offer.toLowerCase();

    const categories = await Product.distinct('category');
    offer === 'new'
      ? (products = await Product.find().sort({ createdAt: -1 }).limit(20))
      : offer === 'sale'
      ? (products = await Product.find({ price: { $gt: 200 } }).limit(20))
      : offer === 'trending'
      ? (products = await Product.find({ rating: { $gt: 4 } }))
      : offer === 'best-seller'
      ? (products = await Product.find({ rating: { $gte: 3.5 } }))
      : offer === 'under-100'
      ? (products = await Product.find({ price: { $lte: 100 } }))
      : null;

    offer = offer.replace(/-/g, ' ');
    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'No special products found',
      });
    }

    res.render('special', { products, offer, user, categories });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
