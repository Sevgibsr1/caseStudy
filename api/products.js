import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Cache for gold price (refresh every 30 minutes)
let goldPriceCache = {
  price: null,
  timestamp: null,
  ttl: 30 * 60 * 1000 // 30 minutes
};

// Load products data
const loadProducts = () => {
  try {
    const productsPath = path.join(process.cwd(), 'products.json');
    const data = fs.readFileSync(productsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

// Fetch gold price from API
const fetchGoldPrice = async () => {
  try {
    // Check cache first
    if (goldPriceCache.price && goldPriceCache.timestamp && 
        Date.now() - goldPriceCache.timestamp < goldPriceCache.ttl) {
      return goldPriceCache.price;
    }

    const apiKey = process.env.GOLD_API_KEY;
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { id } = req.query;

    if (id) {
      // Get single product by ID
      const products = loadProducts();
      const productId = parseInt(id);
      
      if (productId < 1 || productId > products.length) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      const processedProducts = await processProducts([products[productId - 1]]);
      
      return res.json({
        success: true,
        data: processedProducts[0]
      });
    }

    // Get all products
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
} 