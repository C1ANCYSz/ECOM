const Product = require('../models/Product');
const Customer = require('../models/Customer');

exports.home = async (req, res) => {
  const products = await Product.find({ featured: true }).limit(8);

  const categories = await Product.distinct('category');

  const special = ['New', 'Sale', 'Trending', 'Best Seller', 'under 100'];

  const user = req.user || null;

  res.render('home', { products, user, categories, special });
};

exports.getCart = async (req, res) => {
  const id = req.user._id;
  const customer = await Customer.findById(id);

  const categories = await Product.distinct('category');
  let products = customer.cart;
  products = await Promise.all(
    products.map(async (product) => {
      const prod = await Product.findById(product.productId).select(
        'name price image'
      );
      return {
        ...prod._doc,
        quantity: product.quantity,
        id: product.productId,
      };
    })
  );

  const user = req.user || null;

  res.render('cart', { products, categories, user });
};

exports.getWishlist = async (req, res) => {
  const id = req.user._id;
  const customer = await Customer.findById(id).populate('wishlist');
  const user = req.user || null;
  const categories = await Product.distinct('category');
  let products = customer.wishlist;

  products = await Promise.all(
    products.map(async (product) => {
      const prod = await Product.findById(product.productId).select(
        'name price image'
      );
      return {
        ...prod._doc,
        quantity: product.quantity,
        id: product.productId,
      };
    })
  );

  res.render('wishlist', { products, user, categories });
};

exports.getLogin = async (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/');
  }
  res.render('login');
};

exports.getSignup = async (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/');
  }
  res.render('signup');
};

exports.getProfile = async (req, res) => {
  const user = req.user;
  res.render('profile', { user });
};

exports.getCheckout = async (req, res) => {
  const user = req.user || null;
  const address = user.address || null;
  let products = user.cart;
  products = await Promise.all(
    products.map(async (product) => {
      const prod = await Product.findById(product.productId).select(
        'name price image'
      );
      return {
        ...prod._doc,
        quantity: product.quantity,
        id: product.productId,
      };
    })
  );

  res.render('checkout', { user, products, address });
};
