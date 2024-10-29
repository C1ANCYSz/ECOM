const Product = require('../models/Product');

exports.searchSuggestions = async (req, res) => {
  const query = req.query.query;
  try {
    const products = await Product.find({
      name: { $regex: query, $options: 'i' },
    }).limit(5);

    res.json(products);
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching search suggestions' });
  }
};

exports.getSearchResults = async (req, res) => {
  const query = req.query.query;

  try {
    const products = await Product.find({
      name: { $regex: query, $options: 'i' },
    });
    res.render('searchResults', { products, query });
  } catch (error) {
    console.error('Error while searching for products:', error);
    res.status(500).send('An error occurred while searching for products');
  }
};
