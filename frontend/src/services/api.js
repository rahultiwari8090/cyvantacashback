/**
 * Spring Boot API Client Service Layer
 * 
 * Configured for Spring Boot backend running on http://localhost:8080/api
 * By default, connects to the real backend with MongoDB Atlas data.
 * 
 * To switch to mock data for development: set localStorage.setItem('api_use_mock', 'true')
 * To connect to real backend: set localStorage.setItem('api_use_mock', 'false')
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Force using real backend by default in development. Set VITE_API_USE_MOCK=true to use mock data.
const USE_MOCK = import.meta.env.VITE_API_USE_MOCK === 'true' ? true : false;

console.log(`[API Service] Running in ${USE_MOCK ? 'MOCK' : `BACKEND (${BASE_URL})`} mode.`);

// --- IN-MEMORY MOCK DATABASE (For fallback / mockup development) ---
let mockUsers = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 9876543210', referralCode: 'RAHUL50', referredBy: 'None', joinDate: '2026-04-12', status: 'active', sharedCommissionRate: null },
  { id: 'u2', name: 'Sneha Patel', email: 'sneha.patel@gmail.com', phone: '+91 8765432109', referralCode: 'SNEHA12', referredBy: 'RAHUL50', joinDate: '2026-04-18', status: 'active', sharedCommissionRate: null },
  { id: 'u3', name: 'Amit Verma', email: 'amit.verma@gmail.com', phone: '+91 7654321098', referralCode: 'AMIT99', referredBy: 'RAHUL50', joinDate: '2026-04-20', status: 'active', sharedCommissionRate: null },
  { id: 'u4', name: 'Pooja Hegde', email: 'pooja.hegde@gmail.com', phone: '+91 6543210987', referralCode: 'POOJA45', referredBy: 'SNEHA12', joinDate: '2026-04-22', status: 'active', sharedCommissionRate: null },
  { id: 'u5', name: 'Rohan Joshi', email: 'rohan.joshi@gmail.com', phone: '+91 5432109876', referralCode: 'ROHAN88', referredBy: 'None', joinDate: '2026-05-01', status: 'blocked', sharedCommissionRate: null },
];

let mockSharedLinks = [
  { id: 'sl1', userId: 'u1', userName: 'Rahul Sharma', productName: 'boAt Rockerz Headphones', store: 'Amazon', productUrl: 'https://amazon.in/dp/example', shortUrl: 'https://cyvanta.cashback/share/sl1', clicksCount: 24, conversionsCount: 2, totalEarnings: 3.00, userSharePercent: 70, buyerSharePercent: 30, status: 'active', date: '2026-05-25' },
  { id: 'sl2', userId: 'u2', userName: 'Sneha Patel', productName: 'Adidas UltraBoost Shoes', store: 'Myntra', productUrl: 'https://myntra.com/shoes/example', shortUrl: 'https://cyvanta.cashback/share/sl2', clicksCount: 15, conversionsCount: 1, totalEarnings: 5.50, userSharePercent: 50, buyerSharePercent: 50, status: 'active', date: '2026-05-28' },
];

let mockSharedCommissions = [
  { id: 'sc1', userId: 'u1', userName: 'Rahul Sharma', linkId: 'sl1', productName: 'boAt Rockerz Headphones', store: 'Amazon', purchaseAmount: 29.99, commissionRate: 5.0, commissionAmount: 1.50, userSharePercent: 70, buyerSharePercent: 30, userCommissionAmount: 1.05, buyerCommissionAmount: 0.45, status: 'approved', date: '2026-05-28' },
  { id: 'sc2', userId: 'u1', userName: 'Rahul Sharma', linkId: 'sl1', productName: 'boAt Rockerz Headphones', store: 'Amazon', purchaseAmount: 29.99, commissionRate: 5.0, commissionAmount: 1.50, userSharePercent: 70, buyerSharePercent: 30, userCommissionAmount: 1.05, buyerCommissionAmount: 0.45, status: 'pending', date: '2026-05-29' },
  { id: 'sc3', userId: 'u2', userName: 'Sneha Patel', linkId: 'sl2', productName: 'Adidas UltraBoost Shoes', store: 'Myntra', purchaseAmount: 110.00, commissionRate: 5.0, commissionAmount: 5.50, userSharePercent: 50, buyerSharePercent: 50, userCommissionAmount: 2.75, buyerCommissionAmount: 2.75, status: 'pending', date: '2026-06-01' },
];

let mockProducts = [
  { id: '1', name: 'boAt Rockerz 450 Bluetooth Headphones', platform: 'Amazon', price: 29.99, cashbackValue: 10.0, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', status: 'active' },
  { id: '2', name: 'Adidas UltraBoost 22 Running Shoes', platform: 'Myntra', price: 110.00, cashbackValue: 12.0, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', status: 'active' },
  { id: '3', name: 'HP Pavilion Touchscreen Laptop', platform: 'Flipkart', price: 549.99, cashbackValue: 8.5, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', status: 'active' },
  { id: '4', name: 'Cetaphil Daily Facial Cleanser', platform: 'Nykaa Beauty', price: 14.99, cashbackValue: 7.0, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300', status: 'inactive' },
];

let mockCategories = [
  { id: 'c1', name: 'Electronics', icon: 'Smartphone', status: 'active', created: '2026-05-10' },
  { id: 'c2', name: 'Fashion', icon: 'Shirt', status: 'active', created: '2026-05-11' },
];

let mockDeals = [
  { id: 'd1', name: 'Amazon Electronics Flash Deal', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', offerText: 'Up to 50% Off', link: 'https://amazon.to/abcde', cashback: '10%', status: 'active' },
];

let mockCashbackList = [
  { id: 'cb1', userName: 'Rahul Sharma', productName: 'boAt Rockerz 450 Bluetooth Headphones', amount: 3.00, status: 'approved', date: '2026-05-28' },
  { id: 'cb2', userName: 'Sneha Patel', productName: 'Adidas UltraBoost 22 Running Shoes', amount: 13.20, status: 'pending', date: '2026-05-30' },
  { id: 'cb3', userName: 'Amit Verma', productName: 'HP Pavilion Touchscreen Laptop', amount: 46.75, status: 'pending', date: '2026-06-01' },
  { id: 'cb4', userName: 'Rahul Sharma', productName: 'Cetaphil Daily Facial Cleanser', amount: 1.05, status: 'rejected', date: '2026-05-25' },
];

let mockTrackedOrders = [
  {
    id: 'TRK99281',
    userId: 'u1',
    userName: 'Rahul Sharma',
    productId: '1',
    productName: 'boAt Rockerz 450 Bluetooth Headphones',
    platform: 'Amazon',
    price: 29.99,
    cashbackAmount: 3.00,
    status: 'completed',
    orderDate: '2026-05-20',
    confirmedDate: '2026-05-21',
    shippedDate: '2026-05-22',
    deliveredDate: '2026-05-23',
    returnExpiryDate: '2026-05-30',
    returnWindowDays: 7,
    cashbackId: 'cb1'
  },
  {
    id: 'TRK87123',
    userId: 'u2',
    userName: 'Sneha Patel',
    productId: '2',
    productName: 'Adidas UltraBoost 22 Running Shoes',
    platform: 'Myntra',
    price: 110.00,
    cashbackAmount: 13.20,
    status: 'return_active',
    orderDate: '2026-05-28',
    confirmedDate: '2026-05-29',
    shippedDate: '2026-05-30',
    deliveredDate: '2026-06-01',
    returnExpiryDate: '2026-06-11',
    returnWindowDays: 10,
    cashbackId: 'cb2'
  },
  {
    id: 'TRK44102',
    userId: 'u3',
    userName: 'Amit Verma',
    productId: '3',
    productName: 'HP Pavilion Touchscreen Laptop',
    platform: 'Flipkart',
    price: 549.99,
    cashbackAmount: 46.75,
    status: 'shipped',
    orderDate: '2026-06-01',
    confirmedDate: '2026-06-02',
    shippedDate: '2026-06-02',
    returnWindowDays: 15,
    cashbackId: 'cb3'
  }
];

let mockWithdrawRequests = [
  { id: 'w1', userName: 'Rahul Sharma', coins: 5000, amount: 50.00, upiId: 'rahul@okaxis', status: 'pending', date: '2026-05-31' },
  { id: 'w2', userName: 'Sneha Patel', coins: 2000, amount: 20.00, upiId: 'sneha@oksbi', status: 'approved', date: '2026-05-28' },
  { id: 'w3', userName: 'Amit Verma', coins: 10000, amount: 100.00, upiId: 'amitv@paytm', status: 'pending', date: '2026-06-01' },
];

let mockClickLogs = [
  { clickId: 'CLK0982312', userName: 'Rahul Sharma', productName: 'boAt Rockerz 450 Bluetooth Headphones', network: 'Amazon', date: '2026-05-28' },
  { clickId: 'CLK04928312', userName: 'Sneha Patel', productName: 'Adidas UltraBoost 22 Running Shoes', network: 'Myntra', date: '2026-05-30' },
  { clickId: 'CLK23910399', userName: 'Amit Verma', productName: 'HP Pavilion Touchscreen Laptop', network: 'Flipkart', date: '2026-06-01' },
  { clickId: 'CLK11938210', userName: 'Rahul Sharma', productName: 'Cetaphil Daily Facial Cleanser', network: 'Nykaa Beauty', date: '2026-05-25' },
  { clickId: 'CLK77382910', userName: 'Pooja Hegde', productName: 'boAt Rockerz 450 Bluetooth Headphones', network: 'Amazon', date: '2026-06-02' },
];

let mockConversions = [
  { id: 'conv1', subId: 'SUB99281', clickId: 'CLK0982312', commission: 3.00, status: 'approved', date: '2026-05-28', userName: 'Rahul Sharma', network: 'Amazon' },
  { id: 'conv2', subId: 'SUB87123', clickId: 'CLK04928312', commission: 13.20, status: 'pending', date: '2026-05-30', userName: 'Sneha Patel', network: 'Myntra' },
  { id: 'conv3', subId: 'SUB44102', clickId: 'CLK23910399', commission: 46.75, status: 'pending', date: '2026-06-01', userName: 'Amit Verma', network: 'Flipkart' },
  { id: 'conv4', subId: 'SUB99282', clickId: 'CLK11938210', commission: 1.05, status: 'rejected', date: '2026-05-25', userName: 'Rahul Sharma', network: 'Nykaa Beauty' },
];

let mockFinance = {
  totalRevenue: 2840.00,
  totalCashbackPaid: 1205.00,
  totalWithdrawPaid: 980.00,
  pendingWithdrawals: 150.00,
  transactions: [
    { id: 'tx1', desc: 'Affiliate Commission (Amazon - conv1)', type: 'credit', amount: 45.00, date: '2026-05-28' },
    { id: 'tx2', desc: 'User Cashback Payout (Sneha Patel)', type: 'debit', amount: 20.00, date: '2026-05-28' },
    { id: 'tx3', desc: 'Affiliate Commission (Flipkart - conv3)', type: 'credit', amount: 112.50, date: '2026-06-01' },
    { id: 'tx4', desc: 'Marketing Sponsor Ads', type: 'credit', amount: 250.00, date: '2026-05-20' },
  ],
};

let mockSettings = {
  cashbackPercent: 8.0,
  holdDays: 30,
  minimumWithdrawal: 10.00,
  sharedCommissionPercent: 5.0,
  sharedCommissionHoldDays: 30,
};

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
  };

  // When using the real backend, enable CORS mode and include credentials (cookies)
  if (!USE_MOCK) {
    config.mode = options.mode || 'cors';
    config.credentials = options.credentials || 'include';
  }

  const response = await fetch(`${BASE_URL}${url}`, config);
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText || `API error: ${response.status}`;
    try {
      const errObj = JSON.parse(errorText);
      if (errObj.error) errorMessage = errObj.error;
      else if (errObj.message) errorMessage = errObj.message;
    } catch (e) {
      // Ignore parse error, use raw text
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// --- API ACTIONS DEFINITIONS ---

// 1. Users APIs
export const apiUsers = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockUsers]);
    return request('/users');
  },
<<<<<<< Updated upstream
  login: (email, password) => {
    if (USE_MOCK) {
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        return Promise.resolve({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          status: user.status,
          joinDate: user.joinDate,
          wallet: { confirmed: 100.50, pending: 25.00, referral: 5.00 },
          isAdmin: false
        });
      }
      return Promise.reject(new Error('User not found'));
    }
    return request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  adminLogin: (email, password) => {
    if (USE_MOCK) {
      // For mock, admin is any user with name containing "Admin"
      const adminUser = mockUsers.find(u => u.email === email && u.name.toLowerCase().includes('admin'));
      if (adminUser) {
        return Promise.resolve({
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'ADMIN',
          isAdmin: true,
          status: adminUser.status
        });
      }
      return Promise.reject(new Error('Admin not found or invalid credentials'));
    }
    return request('/users/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: (name, email, password, phone = '', referredBy = null) => {
    if (USE_MOCK) {
      const newUser = {
        id: 'u' + Date.now(),
        name,
        email,
        phone,
        referralCode: 'REF' + Math.random().toString(36).substring(7).toUpperCase(),
        referredBy: referredBy || 'None',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        wallet: { confirmed: 0, pending: 0, referral: 0 }
      };
      mockUsers.push(newUser);
      return Promise.resolve(newUser);
    }
    return request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, referredBy }),
=======
  login: (userProfile) => {
    if (USE_MOCK) return Promise.resolve(userProfile);
    return request('/users/login', {
      method: 'POST',
      body: JSON.stringify(userProfile),
>>>>>>> Stashed changes
    });
  },
  updateStatus: (id, status) => {
    if (USE_MOCK) {
      mockUsers = mockUsers.map(u => u.id === id ? { ...u, status } : u);
      return Promise.resolve(mockUsers.find(u => u.id === id));
    }
    return request(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  update: (id, userData) => {
    if (USE_MOCK) {
      mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...userData } : u);
      return Promise.resolve(mockUsers.find(u => u.id === id));
    }
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
};

// 2. Products APIs
export const apiProducts = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockProducts]);
    return request('/products');
  },
  create: (product) => {
    if (USE_MOCK) {
      const newProd = { ...product, id: Date.now().toString() };
      mockProducts.push(newProd);
      return Promise.resolve(newProd);
    }
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  createBulk: (productsList) => {
    if (USE_MOCK) {
      const addedProducts = productsList.map((prod, index) => {
        return {
          ...prod,
          id: (Date.now() + index).toString(),
          status: prod.status || 'active'
        };
      });
      mockProducts.push(...addedProducts);
      return Promise.resolve(addedProducts);
    }
    return request('/products/bulk', {
      method: 'POST',
      body: JSON.stringify(productsList),
    }).catch(async (err) => {
      console.warn("Bulk endpoint failed, falling back to sequential creations", err);
      const results = [];
      for (const prod of productsList) {
        const res = await request('/products', {
          method: 'POST',
          body: JSON.stringify(prod),
        });
        results.push(res);
      }
      return results;
    });
  },
  update: (product) => {
    if (USE_MOCK) {
      mockProducts = mockProducts.map(p => p.id === product.id ? product : p);
      return Promise.resolve(product);
    }
    return request(`/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },
  delete: (id) => {
    if (USE_MOCK) {
      mockProducts = mockProducts.filter(p => p.id !== id);
      return Promise.resolve({ success: true });
    }
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  }
};

// 3. Tracked Orders (Product Tracking) APIs
export const apiTracking = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockTrackedOrders]);
    return request('/tracking');
  },
  create: (trackedOrder) => {
    if (USE_MOCK) {
      const trackId = 'TRK' + Math.floor(10000000 + Math.random() * 90000000);
      const cashbackId = 'cb' + Date.now();
      const newTrack = {
        ...trackedOrder,
        id: trackId,
        cashbackId: cashbackId
      };
      
      // Update local tracking mock
      mockTrackedOrders.unshift(newTrack);

      // Dynamically add a matching mock cashback
      const newCashback = {
        id: cashbackId,
        userName: trackedOrder.userName,
        productName: trackedOrder.productName,
        amount: trackedOrder.cashbackAmount,
        status: 'pending',
        date: trackedOrder.orderDate
      };
      mockCashbackList.unshift(newCashback);

      return Promise.resolve(newTrack);
    }
    return request('/tracking', {
      method: 'POST',
      body: JSON.stringify(trackedOrder),
    });
  },
  updateStatus: (id, status, datesUpdate = {}) => {
    if (USE_MOCK) {
      let updatedOrder = null;
      mockTrackedOrders = mockTrackedOrders.map(o => {
        if (o.id === id) {
          updatedOrder = {
            ...o,
            status,
            ...datesUpdate
          };

          // Synchronize with Mock Cashback status
          if (status === 'completed') {
            mockCashbackList = mockCashbackList.map(c => {
              if (c.id === o.cashbackId) {
                mockFinance.totalCashbackPaid += c.amount;
                return { ...c, status: 'approved' };
              }
              return c;
            });
          } else if (status === 'returned') {
            mockCashbackList = mockCashbackList.map(c => {
              if (c.id === o.cashbackId) {
                return { ...c, status: 'rejected' };
              }
              return c;
            });
          }

          return updatedOrder;
        }
        return o;
      });
      return Promise.resolve(updatedOrder);
    }
    return request(`/tracking/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...datesUpdate }),
    });
  }
};

// 4. Cashback APIs
export const apiCashback = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockCashbackList]);
    return request('/cashback');
  },
  approve: (id, amount) => {
    if (USE_MOCK) {
      mockCashbackList = mockCashbackList.map(c => c.id === id ? { ...c, status: 'approved' } : c);
      mockFinance.totalCashbackPaid += amount;
      return Promise.resolve({ success: true });
    }
    return request(`/cashback/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  },
  reject: (id) => {
    if (USE_MOCK) {
      mockCashbackList = mockCashbackList.map(c => c.id === id ? { ...c, status: 'rejected' } : c);
      return Promise.resolve({ success: true });
    }
    return request(`/cashback/${id}/reject`, {
      method: 'PUT',
    });
  }
};

// 5. Withdraw Requests APIs
export const apiWithdrawals = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockWithdrawRequests]);
    return request('/withdrawals');
  },
  create: (req) => {
    if (USE_MOCK) {
      const newReq = { ...req, id: 'w' + Date.now(), status: 'pending' };
      mockWithdrawRequests.unshift(newReq);
      mockFinance.pendingWithdrawals += req.amount;
      return Promise.resolve(newReq);
    }
    return request('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },
  approve: (id, amount) => {
    if (USE_MOCK) {
      mockWithdrawRequests = mockWithdrawRequests.map(w => w.id === id ? { ...w, status: 'approved' } : w);
      mockFinance.totalWithdrawPaid += amount;
      mockFinance.pendingWithdrawals = Math.max(0, mockFinance.pendingWithdrawals - amount);
      mockFinance.transactions.unshift({
        id: `tx-w-${id}`,
        desc: `Approved Withdrawal (UPI)`,
        type: 'debit',
        amount,
        date: new Date().toISOString().split('T')[0],
      });
      return Promise.resolve({ success: true });
    }
    return request(`/withdrawals/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  },
  reject: (id, amount) => {
    if (USE_MOCK) {
      mockWithdrawRequests = mockWithdrawRequests.map(w => w.id === id ? { ...w, status: 'rejected' } : w);
      mockFinance.pendingWithdrawals = Math.max(0, mockFinance.pendingWithdrawals - amount);
      return Promise.resolve({ success: true });
    }
    return request(`/withdrawals/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  }
};

// 6. Click Logs & Conversions APIs
export const apiAnalytics = {
  getClickLogs: () => {
    if (USE_MOCK) return Promise.resolve([...mockClickLogs]);
    return request('/analytics/clicks');
  },
  getConversions: () => {
    if (USE_MOCK) return Promise.resolve([...mockConversions]);
    return request('/analytics/conversions');
  },
  adjustConversion: (id, amount, type) => {
    if (USE_MOCK) {
      mockConversions = mockConversions.map(c => {
        if (c.id === id) {
          const nextStatus = type === 'credit' ? 'approved' : 'rejected';
          return { ...c, commission: amount, status: nextStatus };
        }
        return c;
      });

      if (type === 'credit') {
        mockFinance.totalRevenue += amount;
      } else {
        mockFinance.totalRevenue = Math.max(0, mockFinance.totalRevenue - amount);
      }
      return Promise.resolve({ success: true });
    }
    return request(`/analytics/conversions/${id}/adjust`, {
      method: 'PUT',
      body: JSON.stringify({ amount, type }),
    });
  }
};

// 7. Finance APIs
export const apiFinance = {
  getData: () => {
    if (USE_MOCK) return Promise.resolve({ ...mockFinance });
    return request('/finance');
  }
};

// 8. Global Settings APIs
export const apiSettings = {
  get: () => {
    if (USE_MOCK) return Promise.resolve({ ...mockSettings });
    return request('/settings');
  },
  update: (settings) => {
    if (USE_MOCK) {
      mockSettings = { ...mockSettings, ...settings };
      return Promise.resolve(mockSettings);
    }
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
};

// 9. Shared User Link APIs
export const apiSharedLinks = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockSharedLinks]);
    return request('/shared-links');
  },
  getByUser: (userId) => {
    if (USE_MOCK) return Promise.resolve(mockSharedLinks.filter(l => l.userId === userId));
    return request(`/shared-links/user/${userId}`);
  },
  create: (linkData) => {
    if (USE_MOCK) {
      const id = 'sl' + Date.now();
      const newLink = {
        id,
        userId: linkData.userId,
        userName: linkData.userName,
        productName: linkData.productName,
        store: linkData.store,
        productUrl: linkData.productUrl,
        shortUrl: `https://cyvanta.cashback/share/${id}`,
        clicksCount: 0,
        conversionsCount: 0,
        totalEarnings: 0.00,
        userSharePercent: linkData.userSharePercent !== undefined ? linkData.userSharePercent : 100,
        buyerSharePercent: linkData.buyerSharePercent !== undefined ? linkData.buyerSharePercent : 0,
        status: 'active',
        date: new Date().toISOString().split('T')[0]
      };
      mockSharedLinks.unshift(newLink);
      return Promise.resolve(newLink);
    }
    return request('/shared-links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  },
  delete: (id) => {
    if (USE_MOCK) {
      mockSharedLinks = mockSharedLinks.filter(l => l.id !== id);
      return Promise.resolve({ success: true });
    }
    return request(`/shared-links/${id}`, {
      method: 'DELETE',
    });
  },
  incrementClicks: (id) => {
    if (USE_MOCK) {
      const link = mockSharedLinks.find(l => l.id === id);
      if (link) {
        link.clicksCount += 1;
        // 10% chance of auto-generating a conversion in simulation
        if (Math.random() < 0.3) {
          const u = mockUsers.find(usr => usr.id === link.userId || usr.name === link.userName);
          const rate = u && u.sharedCommissionRate ? u.sharedCommissionRate : mockSettings.sharedCommissionPercent;
          const purchaseVal = Math.round(15 + Math.random() * 200);
          const totalComm = parseFloat(((purchaseVal * rate) / 100).toFixed(2));
          
          const userPct = link.userSharePercent !== undefined ? link.userSharePercent : 100;
          const buyerPct = link.buyerSharePercent !== undefined ? link.buyerSharePercent : 0;
          
          const userComm = parseFloat(((totalComm * userPct) / 100).toFixed(2));
          const buyerComm = parseFloat(((totalComm * buyerPct) / 100).toFixed(2));
          
          const commissionId = 'sc' + Date.now();
          const newComm = {
            id: commissionId,
            userId: link.userId,
            userName: link.userName,
            linkId: link.id,
            productName: link.productName,
            store: link.store,
            purchaseAmount: purchaseVal,
            commissionRate: rate,
            commissionAmount: totalComm,
            userSharePercent: userPct,
            buyerSharePercent: buyerPct,
            userCommissionAmount: userComm,
            buyerCommissionAmount: buyerComm,
            status: 'pending',
            date: new Date().toISOString().split('T')[0]
          };
          
          mockSharedCommissions.unshift(newComm);
          link.conversionsCount += 1;

          // Add only user's share to user's pending wallet
          if (u) {
            if (!u.wallet) {
              u.wallet = { confirmed: 0.00, pending: 0.00, referral: 0.00 };
            }
            u.wallet.pending += userComm;
          }
        }
      }
      return Promise.resolve(link);
    }
    return request(`/shared-links/${id}/click`, { method: 'POST' });
  }
};

// 10. Shared Commission Logs APIs
export const apiSharedCommissions = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockSharedCommissions]);
    return request('/shared-commissions');
  },
  getByUser: (userId) => {
    if (USE_MOCK) return Promise.resolve(mockSharedCommissions.filter(c => c.userId === userId));
    return request(`/shared-commissions/user/${userId}`);
  },
  create: (commData) => {
    if (USE_MOCK) {
      const userPct = commData.userSharePercent !== undefined ? commData.userSharePercent : 100;
      const buyerPct = commData.buyerSharePercent !== undefined ? commData.buyerSharePercent : 0;
      const userComm = parseFloat(((commData.commissionAmount * userPct) / 100).toFixed(2));
      const buyerComm = parseFloat(((commData.commissionAmount * buyerPct) / 100).toFixed(2));

      const newComm = {
        ...commData,
        id: 'sc' + Date.now(),
        userSharePercent: userPct,
        buyerSharePercent: buyerPct,
        userCommissionAmount: userComm,
        buyerCommissionAmount: buyerComm,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };
      mockSharedCommissions.unshift(newComm);
      
      // Update link conversion count
      const link = mockSharedLinks.find(l => l.id === commData.linkId);
      if (link) {
        link.conversionsCount += 1;
      }
      
      // Add to user pending wallet (only link creator's share)
      const u = mockUsers.find(usr => usr.id === commData.userId || usr.name === commData.userName);
      if (u) {
        if (!u.wallet) {
          u.wallet = { confirmed: 0.00, pending: 0.00, referral: 0.00 };
        }
        u.wallet.pending += userComm;
      }

      return Promise.resolve(newComm);
    }
    return request('/shared-commissions', {
      method: 'POST',
      body: JSON.stringify(commData),
    });
  },
  updateStatus: (id, status, amount) => {
    if (USE_MOCK) {
      const finalAmount = parseFloat(amount);
      let updatedObj = null;
      
      mockSharedCommissions = mockSharedCommissions.map(c => {
        if (c.id === id) {
          const oldStatus = c.status;
          
          const userPct = c.userSharePercent !== undefined ? c.userSharePercent : 100;
          const buyerPct = c.buyerSharePercent !== undefined ? c.buyerSharePercent : 0;
          const userComm = parseFloat(((finalAmount * userPct) / 100).toFixed(2));
          const buyerComm = parseFloat(((finalAmount * buyerPct) / 100).toFixed(2));

          updatedObj = { 
            ...c, 
            status, 
            commissionAmount: finalAmount,
            userCommissionAmount: userComm,
            buyerCommissionAmount: buyerComm
          };

          // Find user to adjust wallet
          const u = mockUsers.find(user => user.id === c.userId || user.name === c.userName);
          if (u) {
            if (!u.wallet) {
              u.wallet = { confirmed: 0.00, pending: 0.00, referral: 0.00 };
            }
            // If status changes to approved, credit it to confirmed
            if (status === 'approved' && oldStatus !== 'approved') {
              u.wallet.confirmed += userComm;
              if (oldStatus === 'pending') {
                u.wallet.pending = Math.max(0, u.wallet.pending - c.userCommissionAmount);
              }
            } else if (status === 'rejected' && oldStatus === 'pending') {
              u.wallet.pending = Math.max(0, u.wallet.pending - c.userCommissionAmount);
            } else if (status === 'approved' && oldStatus === 'approved') {
              // If it was already approved but amount changed
              const difference = userComm - c.userCommissionAmount;
              u.wallet.confirmed += difference;
            }
          }

          // Also update totalEarnings in the corresponding mockSharedLink
          const l = mockSharedLinks.find(link => link.id === c.linkId);
          if (l) {
            l.totalEarnings = mockSharedCommissions
              .filter(comm => comm.linkId === l.id && comm.status === 'approved')
              .reduce((sum, comm) => sum + (comm.id === id ? userComm : comm.userCommissionAmount), 0);
          }
        }
        return c;
      });

      if (status === 'approved') {
        mockFinance.totalCashbackPaid += finalAmount;
      }

      return Promise.resolve(updatedObj);
    }
    return request(`/shared-commissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, amount }),
    });
  }
};

// 11. Categories APIs
export const apiCategories = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockCategories]);
    return request('/categories');
  },
  create: (category) => {
    if (USE_MOCK) {
      const newCategory = { ...category, id: 'c' + Date.now(), created: new Date().toISOString().split('T')[0] };
      mockCategories.push(newCategory);
      return Promise.resolve(newCategory);
    }
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
  update: (category) => {
    if (USE_MOCK) {
      mockCategories = mockCategories.map(c => c.id === category.id ? category : c);
      return Promise.resolve(category);
    }
    return request(`/categories/${category.id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },
  delete: (id) => {
    if (USE_MOCK) {
      mockCategories = mockCategories.filter(c => c.id !== id);
      return Promise.resolve({ success: true });
    }
    return request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
};

// 12. Deals APIs
export const apiDeals = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockDeals]);
    return request('/deals');
  },
  create: (deal) => {
    if (USE_MOCK) {
      const newDeal = { ...deal, id: 'd' + Date.now() };
      mockDeals.push(newDeal);
      return Promise.resolve(newDeal);
    }
    return request('/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    });
  },
  update: (deal) => {
    if (USE_MOCK) {
      mockDeals = mockDeals.map(d => d.id === deal.id ? deal : d);
      return Promise.resolve(deal);
    }
    return request(`/deals/${deal.id}`, {
      method: 'PUT',
      body: JSON.stringify(deal),
    });
  },
  delete: (id) => {
    if (USE_MOCK) {
      mockDeals = mockDeals.filter(d => d.id !== id);
      return Promise.resolve({ success: true });
    }
    return request(`/deals/${id}`, {
      method: 'DELETE',
    });
  }
};
