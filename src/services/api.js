import axios from 'axios';

// Production veya development için API base URL'ini ayarla
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Vercel'de aynı domain olacak
  : 'http://localhost:3000'; // Local development için

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetch all products
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.minPopularity) params.append('minPopularity', filters.minPopularity);
  if (filters.maxPopularity) params.append('maxPopularity', filters.maxPopularity);
  
  const response = await api.get(`/api/products${params.toString() ? `?${params.toString()}` : ''}`);
  if (response.data.success) return response.data.data;
  throw new Error(response.data.message || 'Failed to fetch products');
};

/**
 * Fetch a single product by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const fetchProduct = async (id) => {
  const response = await api.get(`/api/products?id=${id}`);
  if (response.data.success) return response.data.data;
  throw new Error(response.data.message || 'Failed to fetch product');
};

/**
 * Fetch current gold price
 * @returns {Promise<Object>}
 */
export const fetchGoldPrice = async () => {
  const response = await api.get('/api/gold-price');
  if (response.data.success) return response.data.data;
  throw new Error(response.data.message || 'Failed to fetch gold price');
};

/**
 * Health check
 * @returns {Promise<Object>}
 */
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  if (response.data.success) return response.data;
  throw new Error(response.data.message || 'Health check failed');
};

export default api; 