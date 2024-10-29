const { name } = require('ejs');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

exports.addProduct = async (field, req, res) => {
  try {
    const { productId } = req.body;
    const quantity = parseInt(req.body.quantity, 10) || 1;

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not authenticated' });
    }

    if (!productId || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID and a positive quantity are required',
      });
    }

    const customer = req.user;
    const item = await Product.findById(productId);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    await item.save();

    const productWithQuantity = {
      productId: productId,
      quantity,
    };

    let index =
      field === 'wishlist'
        ? customer.wishlist.findIndex((item) => item.productId == productId)
        : customer.cart.findIndex((item) => item.productId == productId);

    if (index !== -1) {
      customer[field][index].quantity += quantity;
      await customer.save();
      return res.json({
        success: true,
        message: `Quantity updated in ${field}`,
      });
    }

    if (field === 'cart') {
      customer.cart.push(productWithQuantity);
    } else if (field === 'wishlist') {
      customer.wishlist.push(productWithQuantity);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid field' });
    }

    await customer.save();

    res.json({
      success: true,
      message: `Product added to ${field} with quantity ${quantity}`,
    });
  } catch (error) {
    console.error(`Error adding product to ${field}:`, error);
    res
      .status(500)
      .json({ success: false, message: `Failed to add product to ${field}` });
  }
};

exports.removeProduct = async (field, req, res) => {
  const customerId = req.user._id;
  const { id } = req.params;
  try {
    const customer = await Customer.findById(customerId);
    let index;
    field === 'wishlist'
      ? (index = customer.wishlist.findIndex((item) => item.productId == id))
      : (index = customer.cart.findIndex((item) => item.productId == id));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Product not found in ${field}`,
      });
    }

    field === 'cart'
      ? customer.cart.splice(index, 1)
      : customer.wishlist.splice(index, 1);

    await customer.save();
    res.json({
      success: true,
      message: `Product removed from ${field}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    if (!req.user) {
      return res.redirect('/login');
    }
    const customer = req.user;
    const item = await Product.findById(productId);

    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const index = customer.cart.findIndex(
      (item) => item.productId == productId
    );

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    customer.cart[index].quantity = quantity;
    await customer.save();

    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.toggleProduct = async (field, req, res) => {
  try {
    const { productId } = req.body;
    const quantity = parseInt(req.body.quantity, 10) || 1;

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not authenticated' });
    }

    if (!productId || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID and a positive quantity are required',
      });
    }

    const customer = req.user;
    const item = await Product.findById(productId);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    let index =
      field === 'wishlist'
        ? customer.wishlist.findIndex((item) => item.productId == productId)
        : customer.cart.findIndex((item) => item.productId == productId);

    if (index !== -1) {
      field === 'cart'
        ? customer.cart.splice(index, 1)
        : customer.wishlist.splice(index, 1);

      await customer.save();
      return res.json({
        success: true,
        message: `Product removed from ${field}`,
      });
    } else {
      if (field === 'cart' && item.quantity < quantity) {
        return res
          .status(400)
          .json({ success: false, message: 'Insufficient stock' });
      }

      const productWithQuantity = {
        productId: productId,
        quantity: quantity,
        name: item.name,
        price: item.price,
      };

      if (field === 'cart') {
        if (item.quantity < quantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        customer.cart.push(productWithQuantity);
      } else if (field === 'wishlist') {
        customer.wishlist.push(productWithQuantity);
      } else {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid field' });
      }

      await customer.save();

      return res.json({
        success: true,
        message: `Product added to ${field} with quantity ${quantity}`,
      });
    }
  } catch (error) {
    console.error(`Error toggling product in ${field}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to toggle product in ${field}`,
    });
  }
};

exports.moveToCart = async (req, res) => {
  const id = req.params.id;
  const customerId = req.user._id;
  try {
    const customer = await Customer.findById(customerId);
    const product = customer.wishlist.find((item) => item._id == id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    customer.wishlist.splice(customer.wishlist.indexOf(product), 1);
    customer.cart.push(product);
    await customer.save();

    res.json({
      success: true,
      message: 'Product moved from wishlist to cart',
    });
  } catch (error) {
    console.error('Error moving product to cart:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while moving product to cart',
    });
  }
};
