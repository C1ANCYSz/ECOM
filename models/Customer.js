const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    MinLength: [3, 'Name must be at least 3 characters long'],
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
    },
  },

  password: {
    type: String,
    required: true,
    MinLength: [8, 'Password must be at least 8 characters long'],
  },

  address: {
    type: [String],
  },

  phoneNumber: {
    type: Number,
    required: true,
  },

  wishlist: {
    type: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
    default: [],
  },

  cart: {
    type: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    default: [],
  },

  img: {
    type: String,
    default: ``,
  },
});

customerSchema.pre('save', async function (next) {
  const customer = this;
  if (customer.isModified('password')) {
    customer.password = await bcrypt.hash(customer.password, 10);
  }
  if (customer.isModified('name') || customer.isNew) {
    customer.img = `https://avatar.iran.liara.run/public/boy?username=${customer.name}`;
  }
  next();
});

customerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
