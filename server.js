const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load products data
const loadProducts = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

// Cache for gold price (refresh every 30 minutes)
let goldPriceCache = {
  price: null,
  timestamp: null,
  ttl: 30 * 60 * 1000 // 30 minutes
};

// Fetch gold price from API
const fetchGoldPrice = async () => {
  try {
    // Check cache first
    if (goldPriceCache.price && goldPriceCache.timestamp && 
        Date.now() - goldPriceCache.timestamp < goldPriceCache.ttl) {
      return goldPriceCache.price;
    }

    const apiKey = process.env.GOLD_API_KEY || 'goldapi-64pusmcuh5ttc-io';
    if (!apiKey) {
      throw new Error('Gold API key is not configured.');
    }

    const response = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': apiKey }
    });

    const goldPrice = response.data.price; // Price per ounce
    const goldPricePerGram = goldPrice / 31.1035; // Convert to price per gram
    
    // Update cache
    goldPriceCache.price = goldPricePerGram;
    goldPriceCache.timestamp = Date.now();
    
    return goldPricePerGram;
  } catch (error) {
    console.error('Error fetching gold price:', error.response ? error.response.data : error.message);
    // Return a mock price if API fails (current approximate gold price per gram)
    return 65.0; // ~$65 per gram as fallback
  }
};

// Calculate product price
const calculatePrice = (popularityScore, weight, goldPrice) => {
  return (popularityScore + 1) * weight * goldPrice;
};

// Convert popularity score to 5-star rating
const convertPopularityToRating = (popularityScore) => {
  return parseFloat((popularityScore * 5).toFixed(1));
};

// Process products with calculated prices
const processProducts = async (products) => {
  const goldPrice = await fetchGoldPrice();
  
  return products.map((product, index) => ({
    ...product,
    id: index + 1,
    price: parseFloat(calculatePrice(product.popularityScore, product.weight, goldPrice).toFixed(2)),
    popularityRating: convertPopularityToRating(product.popularityScore),
    goldPrice: parseFloat(goldPrice.toFixed(2))
  }));
};

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = loadProducts();
    const processedProducts = await processProducts(products);
    
    // Apply filters if provided
    let filteredProducts = processedProducts;
    
    const { minPrice, maxPrice, minPopularity, maxPopularity } = req.query;
    
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price;
        return (!minPrice || price >= parseFloat(minPrice)) &&
               (!maxPrice || price <= parseFloat(maxPrice));
      });
    }
    
    if (minPopularity || maxPopularity) {
      filteredProducts = filteredProducts.filter(product => {
        const popularity = product.popularityScore;
        return (!minPopularity || popularity >= parseFloat(minPopularity)) &&
               (!maxPopularity || popularity <= parseFloat(maxPopularity));
      });
    }
    
    res.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get single product by index
app.get('/api/products/:id', async (req, res) => {
  try {
    const products = loadProducts();
    const productId = parseInt(req.params.id);
    
    if (productId < 0 || productId >= products.length) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const processedProducts = await processProducts([products[productId]]);
    
    res.json({
      success: true,
      data: processedProducts[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Get current gold price
app.get('/api/gold-price', async (req, res) => {
  try {
    const goldPrice = await fetchGoldPrice();
    res.json({
      success: true,
      data: {
        pricePerGram: parseFloat(goldPrice.toFixed(2)),
        currency: 'USD',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching gold price',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Products API: http://localhost:${PORT}/api/products`);
}); 