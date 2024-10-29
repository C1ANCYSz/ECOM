const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

exports.getOrders = async (req, res) => {
  try {
    const user = req.user;
    const orders = await Order.find().populate({
      path: 'products.productId',
      select: 'name price image',
    });

    res.render('orders', { orders, user });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching orders',
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { total, payment, address } = req.body;
    let { items } = req.body;
    if (!items) {
      return res.status(400).json({ message: 'Please provide items' });
    }
    if (!req.user) {
      return res.redirect('/login');
    }
    const id = req.user._id;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    items.map(async (item) => {
      const productToBeUpdated = await Product.findById(item.productId);
      if (productToBeUpdated.quantity < item.quantity) {
        return res.status(400).json({ message: 'Not enough quantity' });
      }
      productToBeUpdated.quantity -= item.quantity;
      await productToBeUpdated.save();
    });

    const order = new Order({
      customerId: customer._id,
      products: items,
      total,
      address,
      paymentMethod: payment,
    });

    await order.save();

    customer.cart = [];
    await customer.save();

    res.status(200).render('checkoutSuccess', { user: req.user });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while placing order',
    });
  }
};

exports.addAdress = async (req, res) => {
  const { address } = req.body;
  const user = req.user;
  const customer = await Customer.findById(user._id);
  if (!customer) {
    return res.status(400).json({
      success: false,
      message: 'User not found',
    });
  }
  customer.address.push(address);
  await customer.save();

  res.json({ success: true, message: 'address added successfully' });
};
