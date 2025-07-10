import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
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

// Employees API
export const employeesAPI = {
  getAll: () => api.get('/employees'),
  create: (employeeData) => api.post('/employees', employeeData),
  getById: (id) => api.get(`/employees/${id}`),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
  addBalance: (id, balanceData) => api.post(`/employees/${id}/add-balance`, balanceData),
  deductBalance: (id, balanceData) => api.post(`/employees/${id}/deduct-balance`, balanceData),
  getPaymentHistory: (id) => api.get(`/employees/${id}/payment-history`),
};

// Items API
export const itemsAPI = {
  getAll: () => api.get('/items'),
  create: (itemData) => api.post('/items', itemData),
  getById: (id) => api.get(`/items/${id}`),
  update: (id, itemData) => api.put(`/items/${id}`, itemData),
  delete: (id) => api.delete(`/items/${id}`),
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
};

// Dashboard API
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export default api;