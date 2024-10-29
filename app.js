const express = require('express');
const morgan = require('morgan');

const getters = require('./Routes/getters');
const productRoute = require('./Routes/productRoute');
const ordersRoute = require('./Routes/ordersRoute');
const authRouter = require('./Routes/authRoute');
const cookieParser = require('cookie-parser');
const wishlistRoute = require('./Routes/wishlistRoute');
const cartRoute = require('./Routes/cartRoute');
const searchRoute = require('./Routes/searchRoute');
const customerRoute = require('./Routes/customerRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(morgan('dev'));
app.use(cookieParser());

require('dotenv').config();

app.get('/favicon.ico', (req, res) => {
  res.send('ok');
});

app.use('/', getters);

app.use('/wishlist', wishlistRoute);

app.use('/cart', cartRoute);

app.use('/auth', authRouter);

app.use('/products', productRoute);

app.use('/orders', ordersRoute);

app.use('/search', searchRoute);

app.use('/customer', customerRoute);

app.get('*', (req, res) => {
  res.status(404).send('<h1>Page Not Found</h1>');
});

module.exports = app;
