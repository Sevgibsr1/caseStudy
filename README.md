# Product Listing Application

A full-stack web application for displaying luxury jewelry products with dynamic pricing, color selection, and filtering capabilities.

## 🚀 Features

### Backend API
- **Dynamic Pricing**: Real-time price calculation based on gold prices
- **RESTful API**: Clean, documented endpoints
- **Filtering**: Price range and popularity filters
- **Real-time Gold Price**: Fetches current gold prices with caching
- **Error Handling**: Comprehensive error handling with fallbacks

### Frontend
- **Modern React UI**: Clean, responsive design matching provided mockup
- **Product Carousel**: Smooth navigation with arrows and progress bar
- **Color Selection**: Interactive color picker (Yellow, White, Rose Gold)
- **Star Ratings**: Visual popularity ratings (converted to 5-star scale)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Custom Fonts**: Uses Avenir and Montserrat fonts as specified

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **Axios** for HTTP requests
- **CORS** enabled
- **Real-time gold price API integration**

### Frontend
- **React 18** with hooks
- **Custom CSS** with responsive design
- **Axios** for API calls
- **Modern ES6+** syntax

## 📁 Project Structure

```
├── backend/
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── products.json       # Product data
├── frontend/
│   ├── public/
│   │   ├── fonts/         # Custom fonts (Avenir, Montserrat)
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js         # Header component
│   │   │   ├── ProductList.js    # Main product carousel
│   │   │   ├── ProductCard.js    # Individual product card
│   │   │   └── FontPanel.js      # Font/color legend
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js               # Main app component
│   │   ├── App.css              # Main styles
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles + fonts
│   └── package.json             # Frontend dependencies
└── Fonts/                       # Font files
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

3. Server will run on `http://localhost:3001`

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

4. Frontend will run on `http://localhost:3000`

## 📋 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/gold-price` - Get current gold price
- `GET /health` - Health check

### Filtering Options
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `minPopularity` - Minimum popularity (0-1)
- `maxPopularity` - Maximum popularity (0-1)

### Example API Calls
```bash
# Get all products
curl http://localhost:3001/api/products

# Filter by price range
curl "http://localhost:3001/api/products?minPrice=200&maxPrice=500"

# Filter by popularity
curl "http://localhost:3001/api/products?minPopularity=0.8"
```

## 🎨 Design Features

### Color System
- **Yellow Gold**: #E6CA97
- **White Gold**: #D9D9D9
- **Rose Gold**: #E14A49

### Typography
- **Avenir**: Primary font (Book, Medium weights)
- **Montserrat**: Secondary font (Regular, Medium weights)

### Responsive Breakpoints
- **Desktop**: 4 products per view
- **Tablet**: 3 products per view
- **Mobile**: 1-2 products per view

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3001
NODE_ENV=development
```

### Frontend Configuration
The frontend automatically connects to the backend API. For production deployment, set:
```env
REACT_APP_API_URL=https://your-api-domain.com
```

## 📊 Pricing Formula

Products are priced using the formula:
```
Price = (popularityScore + 1) × weight × goldPrice
```

Where:
- `popularityScore`: 0-1 scale popularity
- `weight`: Product weight in grams
- `goldPrice`: Current gold price per gram (USD)

## 🌟 Key Features Implemented

### ✅ Required Features
- [x] RESTful API with product data
- [x] Dynamic price calculation with real-time gold prices
- [x] Frontend matching provided design
- [x] Color picker functionality
- [x] Star rating display (converted from popularity score)
- [x] Carousel with arrow navigation
- [x] Progress bar indicator
- [x] Responsive design

### ✅ Bonus Features
- [x] Filtering by price range
- [x] Filtering by popularity score
- [x] Comprehensive error handling
- [x] Loading states and animations
- [x] Font panel with design specifications

## 🚀 Deployment

### Backend Deployment
The backend is ready for deployment to platforms like:
- Heroku
- Railway
- DigitalOcean
- AWS

### Frontend Deployment
The frontend can be deployed to:
- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

## 🐛 Testing

### Backend Testing
```bash
# Health check
curl http://localhost:3001/health

# Test products endpoint
curl http://localhost:3001/api/products

# Test filtering
curl "http://localhost:3001/api/products?minPrice=100&maxPrice=300"
```

### Frontend Testing
1. Open `http://localhost:3000`
2. Verify product images load correctly
3. Test color picker functionality
4. Test carousel navigation
5. Test responsive design on different screen sizes

## 📝 Notes

- Gold prices are cached for 30 minutes to optimize performance
- Falls back to mock gold price if external API fails
- All product images are served from external CDN
- Font files are included in the project for offline use
- Design closely matches provided mockup specifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. 