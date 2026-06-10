const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

console.log(`[API Service] Running in BACKEND (${BASE_URL}) mode.`);

// --- HELPER WRAPPER TO MAKE FETCH REQUESTS ---
async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    mode: options.mode || 'cors',
    credentials: options.credentials || 'include'
  };

  const response = await fetch(`${BASE_URL}${url}`, config);
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText || `API error: ${response.status}`;
    try {
      const errObj = JSON.parse(errorText);
      if (errObj.error) errorMessage = errObj.error;
      else if (errObj.message) errorMessage = errObj.message;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// --- API ACTIONS DEFINITIONS ---

export const apiStores = {
  getAll: () => request('/stores'),
  create: (store) => request('/stores', { method: 'POST', body: JSON.stringify(store) }),
  update: (id, store) => request(`/stores/${id}`, { method: 'PUT', body: JSON.stringify(store) }),
  delete: (id) => request(`/stores/${id}`, { method: 'DELETE' })
};

export const apiUpload = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upload failed: ${errText}`);
    }
    return await response.json();
  }
};

export const apiBanners = {
  getAll: () => request('/banners'),
  getActive: () => request('/banners/active'),
  create: (banner) => request('/banners', { method: 'POST', body: JSON.stringify(banner) }),
  update: (id, banner) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(banner) }),
  delete: (id) => request(`/banners/${id}`, { method: 'DELETE' })
};

export const apiDeals = {
  getAll: () => request('/deals'),
  create: (deal) => request('/deals', { method: 'POST', body: JSON.stringify(deal) }),
  update: (id, deal) => request(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(deal) }),
  delete: (id) => request(`/deals/${id}`, { method: 'DELETE' })
};

export const apiUsers = {
  getAll: () => request('/users'),
  login: (email, password) => request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  adminLogin: (email, password) => request('/users/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, phone = '', referredBy = null) => request('/users/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone, referredBy }) }),
  updateStatus: (id, status) => request(`/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  update: (id, userData) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) })
};

export const apiProducts = {
  getAll: () => request('/products'),
  create: (product) => request('/products', { method: 'POST', body: JSON.stringify(product) }),
  createBulk: (productsList) => request('/products/bulk', { method: 'POST', body: JSON.stringify(productsList) }),
  update: (product) => request(`/products/${product.id}`, { method: 'PUT', body: JSON.stringify(product) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' })
};

export const apiTracking = {
  getAll: () => request('/tracking'),
  create: (trackedOrder) => request('/tracking', { method: 'POST', body: JSON.stringify(trackedOrder) }),
  updateStatus: (id, status, datesUpdate = {}) => request(`/tracking/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, ...datesUpdate }) })
};

export const apiCashback = {
  getAll: () => request('/cashback'),
  approve: (id, amount) => request(`/cashback/${id}/approve`, { method: 'PUT', body: JSON.stringify({ amount }) }),
  reject: (id) => request(`/cashback/${id}/reject`, { method: 'PUT' })
};

export const apiWithdrawals = {
  getAll: () => request('/withdrawals'),
  create: (req) => request('/withdrawals', { method: 'POST', body: JSON.stringify(req) }),
  approve: (id, amount) => request(`/withdrawals/${id}/approve`, { method: 'PUT', body: JSON.stringify({ amount }) }),
  reject: (id, amount) => request(`/withdrawals/${id}/reject`, { method: 'PUT', body: JSON.stringify({ amount }) })
};

export const apiAnalytics = {
  getClickLogs: () => request('/analytics/clicks'),
  getConversions: () => request('/analytics/conversions'),
  adjustConversion: (id, amount, type) => request(`/analytics/conversions/${id}/adjust`, { method: 'PUT', body: JSON.stringify({ amount, type }) })
};

export const apiFinance = {
  getData: () => request('/finance')
};

export const apiSettings = {
  get: () => request('/settings'),
  update: (settings) => request('/settings', { method: 'PUT', body: JSON.stringify(settings) })
};

export const apiSharedLinks = {
  getAll: () => request('/shared-links'),
  getByUser: (userId) => request(`/shared-links/user/${userId}`),
  create: (linkData) => request('/shared-links', { method: 'POST', body: JSON.stringify(linkData) }),
  delete: (id) => request(`/shared-links/${id}`, { method: 'DELETE' }),
  incrementClicks: (id) => request(`/shared-links/${id}/click`, { method: 'POST' })
};

export const apiSharedCommissions = {
  getAll: () => request('/shared-commissions'),
  getByUser: (userId) => request(`/shared-commissions/user/${userId}`),
  create: (commData) => request('/shared-commissions', { method: 'POST', body: JSON.stringify(commData) }),
  updateStatus: (id, status, amount) => request(`/shared-commissions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, amount }) })
};

export const apiCategories = {
  getAll: () => request('/categories'),
  create: (category) => request('/categories', { method: 'POST', body: JSON.stringify(category) }),
  update: (category) => request(`/categories/${category.id}`, { method: 'PUT', body: JSON.stringify(category) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
};

