const Product = require('../models/Product');
const Order = require('../models/Order');

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

exports.getCategoryOfSoldProducts = async (req, res) => {
  try {
    const categories = await Order.aggregate([
      // Step 1: Unwind the products array
      { $unwind: '$products' },

      // Step 2: Lookup to join Product collection by productId
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },

      // Step 3: Unwind productDetails (each product should have only one detail)
      { $unwind: '$productDetails' },

      // Step 4: Group by category and sum quantities
      {
        $group: {
          _id: '$productDetails.category',
          count: { $sum: '$products.quantity' },
        },
      },

      // Step 5: Project results into desired format
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: '$count',
        },
      },
    ]);

    return categories;
  } catch (error) {
    console.log(error);
  }
};

exports.getTopSoldProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      // Step 1: Unwind the products array to get individual products
      { $unwind: '$products' },

      // Step 2: Group by productId and calculate total quantity sold for each product
      {
        $group: {
          _id: '$products.productId',
          totalSold: { $sum: '$products.quantity' },
        },
      },

      // Step 3: Sort by totalSold in descending order
      { $sort: { totalSold: -1 } },

      // Step 4: Limit to top 5 products
      { $limit: 5 },

      // Step 5: Lookup to get product details from the Product collection
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },

      // Step 6: Unwind productDetails (each product should have only one detail)
      { $unwind: '$productDetails' },

      // Step 7: Project the fields we need
      {
        $project: {
          _id: 0,
          productId: '$_id',
          image: '$productDetails.image',
          name: '$productDetails.name',
          totalSold: '$totalSold',
          rating: '$productDetails.rating',
        },
      },
    ]);

    return topProducts;
  } catch (error) {
    console.log(error);
  }
};

exports.getTopUsers = async (req, res) => {
  try {
    const topUsers = await Order.aggregate([
      // Step 1: Group by customerId and count the number of orders per customer
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
        },
      },

      // Step 2: Sort by orderCount in descending order
      { $sort: { orderCount: -1 } },

      // Step 3: Limit to top 10 users
      { $limit: 10 },

      // Step 4: Lookup to get user details from the Customer collection
      {
        $lookup: {
          from: 'customers', // Collection name for customers
          localField: '_id', // customerId from the orders
          foreignField: '_id', // _id in the customers collection
          as: 'userDetails', // Output field name for joined details
        },
      },

      // Step 5: Unwind userDetails to get a single document per user
      { $unwind: '$userDetails' },

      // Step 6: Project the fields we want
      {
        $project: {
          _id: 0,
          customerId: '$_id',
          name: '$userDetails.name',
          image: '$userDetails.img',
          orderCount: '$orderCount',
        },
      },
    ]);

    return topUsers;
  } catch (error) {
    console.log(error);
  }
};

exports.getSalesData = async (req, res) => {
  try {
    const period = req.params.period || 'daily';
    let dateFormat;

    // Define date format based on the period
    if (period === 'daily') {
      dateFormat = {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
      }; // e.g., "2024-11-01"
    } else if (period === 'weekly') {
      dateFormat = {
        $dateToString: { format: '%Y-%U', date: '$createdAt' }, // e.g., "2024-45" (Year-Week)
      };
    } else if (period === 'monthly') {
      dateFormat = {
        $dateToString: { format: '%Y-%m', date: '$createdAt' }, // e.g., "2024-11"
      };
    } else {
      throw new Error('Invalid period specified'); // Handle invalid period input
    }

    const salesData = await Order.aggregate([
      // Step 1: Group by the formatted date based on the selected period
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: '$total' }, // Sum of the total field in each order
        },
      },
      // Step 2: Sort by date
      { $sort: { _id: 1 } }, // Sort in ascending order by the date bucket
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
