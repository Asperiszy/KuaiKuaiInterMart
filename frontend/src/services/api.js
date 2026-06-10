import axios from 'axios'

// All requests go through Vite's proxy to Django on :8000
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// ── Auth token injection ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auto refresh on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('auth/token')) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    api.post('/auth/token/', { email, password }),
  register: (data) => api.post('/users/register/', data),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params) => api.get('/products/', { params }),
  detail: (id) => api.get(`/products/${id}/`),
  categories: () => api.get('/products/categories/'),
  reviews: (productId) => api.get(`/products/${productId}/reviews/`),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews/`, data),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  list: () => api.get('/orders/'),
  detail: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  simulate: (orderId, method) =>
    api.post(`/payments/simulate/${orderId}/`, { method }),
}

// ── Logistics ─────────────────────────────────────────────────────────────────
export const logisticsApi = {
  track: (orderId) => api.get(`/logistics/${orderId}/`),
}

export default api
