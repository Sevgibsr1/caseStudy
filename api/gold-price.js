import axios from 'axios';

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
} 