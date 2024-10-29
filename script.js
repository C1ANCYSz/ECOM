const mongoose = require('mongoose');
const Product = require('./models/Product'); // Adjust this path based on your project structure
const { faker } = require('@faker-js/faker');

// MongoDB connection URL
const mongoURI = 'mongodb://localhost:27017/ecom';

async function connectToDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function createProducts() {
  try {
    const categories = [
      'Electronics',
      'Fashion',
      'Home Appliances',
      'Books',
      'Toys',
      'Sports',
      'Beauty',
      'Automotive',
    ];

    // Create 100 products, with the first 10 being featured
    const products = [];
    for (let i = 0; i < 100; i++) {
      const product = new Product({
        name: faker.commerce.productName(),
        price: faker.commerce.price(10, 1000, 2), // Generates price between $10 and $1000
        quantity: faker.number.int({ min: 1, max: 100 }), // Random stock quantity between 1 and 100
        category: faker.helpers.arrayElement(categories), // Randomly select a category from the list
        description: faker.commerce.productDescription(),
        image: 'https://via.placeholder.com/300', // Placeholder image URL
        featured: i < 10, // Make the first 10 products featured
        rating: faker.number
          .float({ min: 1, max: 5, precision: 0.1 })
          .toFixed(1), // Generates a random rating between 1 and 5
      });

      products.push(product);
    }

    await Product.insertMany(products);
    console.log('100 products have been added to the database successfully');
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Execute the script
(async () => {
  await connectToDB();
  await createProducts();
})();
