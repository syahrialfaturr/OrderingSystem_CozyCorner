import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const menuAPI = {
  getAll: () => api.get('/menu'),
  getByCategory: (category) => api.get(`/menu/category/${category}`),
  getById: (id) => api.get(`/menu/${id}`),
  update: (id, data) => api.put(`/menu/${id}`, data)
}

export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (date, status) => api.get('/orders', { params: { date, status } }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
}

export const stockAPI = {
  getAll: () => api.get('/stock'),
  update: (data) => api.post('/stock/update', data),
  updateSingle: (id, quantity) => api.put(`/stock/${id}`, { quantity })
}

export const revenueAPI = {
  getDaily: (date) => api.get('/revenue/daily', { params: { date } }),
  updateCash: (cash_received, date) => api.put('/revenue/cash', { cash_received, date }),
  verify: (date) => api.post('/revenue/verify', { date }),
  getHistory: (limit) => api.get('/revenue/history', { params: { limit } })
}

export const authAPI = {
  login: (password) => api.post('/auth/login', { password }),
  verify: (token) => api.post('/auth/verify', { token }),
  logout: () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminToken')
  }
}

export default api
