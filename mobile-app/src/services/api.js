import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔧 IMPORTANT: Update this with your computer's IP address
// To find your IP: Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
const YOUR_COMPUTER_IP = '192.168.1.100'; // ⚠️ CHANGE THIS TO YOUR ACTUAL IP

// Backend URLs to try in order
const API_URLS = [
  `http://${YOUR_COMPUTER_IP}:5000/api`,  // Your computer's IP
  'http://localhost:5000/api',            // Localhost
  'http://127.0.0.1:5000/api',           // Loopback
  'http://10.0.2.2:5000/api',            // Android emulator
  'http://192.168.1.100:5000/api',       // Common local IP
  'http://192.168.0.100:5000/api',       // Alternative local IP
];

let workingUrl = null;

// Test which URL works
const findWorkingUrl = async () => {
  console.log('🔍 Testing backend URLs...');
  
  for (const url of API_URLS) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(`${url.replace('/api', '')}/`, { 
        timeout: 3000,
        headers: { 'Accept': 'application/json' }
      });
      console.log(`✅ Success: ${url}`);
      workingUrl = url;
      return url;
    } catch (error) {
      console.log(`❌ Failed: ${url} - ${error.message}`);
    }
  }
  
  console.log('❌ No working URL found');
  return API_URLS[0]; // Fallback to first URL
};

// Initialize with first URL, will be updated when working URL is found
let API_BASE_URL = API_URLS[0];

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Update API base URL when working URL is found
export const updateApiBaseUrl = (url) => {
  API_BASE_URL = url;
  api.defaults.baseURL = url;
  console.log(`📡 API URL updated to: ${url}`);
};

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('❌ API Error:', error.message);
    console.log('📡 API URL:', error.config?.baseURL);
    console.log('🔗 Request URL:', error.config?.url);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timeout');
    }
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    // Try to find working URL first
    if (!workingUrl) {
      const foundUrl = await findWorkingUrl();
      if (foundUrl !== API_BASE_URL) {
        updateApiBaseUrl(foundUrl);
      }
    }
    
    console.log('🔐 Attempting login with URL:', api.defaults.baseURL);
    console.log('📧 Login credentials:', { email: credentials.email });
    
    try {
      return await api.post('/auth/login', credentials);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },
  verify: () => api.get('/auth/verify'),
};

// Cars API
export const carsAPI = {
  getAll: () => api.get('/cars'),
  create: (carData) => api.post('/cars', carData),
  getById: (id) => api.get(`/cars/${id}`),
  update: (id, carData) => api.put(`/cars/${id}`, carData),
  delete: (id) => api.delete(`/cars/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  create: (customerData) => api.post('/customers', customerData),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Invoices API
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  create: (invoiceData) => api.post('/invoices', invoiceData),
  getById: (id) => api.get(`/invoices/${id}`),
  update: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  delete: (id) => api.delete(`/invoices/${id}`),
};

// Payments API
export const paymentsAPI = {
  receive: (paymentData) => api.post('/payments/receive', paymentData),
  paymentOut: (paymentData) => api.post('/payments/payment-out', paymentData),
  getAll: () => api.get('/payments'),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export default api;