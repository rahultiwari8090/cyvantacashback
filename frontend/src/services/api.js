/**
 * Spring Boot API Client Service Layer
 * 
 * Configured for Spring Boot backend running on http://localhost:8080/api
 * Features a local mock toggle so the frontend works out-of-the-box in development.
 * 
 * To switch to Spring Boot backend, set localStorage.setItem('api_use_mock', 'false')
 * or modify the USE_MOCK variable below to false.
 */

const BASE_URL = 'http://localhost:8080/api';

// By default, use mock data. Set to false to connect to your real Spring Boot server.
const USE_MOCK = localStorage.getItem('api_use_mock') !== 'false';

console.log(`[API Service] Running in ${USE_MOCK ? 'MOCK' : 'SPRING BOOT LIVE'} mode.`);

// --- IN-MEMORY MOCK DATABASE (For fallback / mockup development) ---
let mockUsers = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 9876543210', referralCode: 'RAHUL50', referredBy: 'None', joinDate: '2026-04-12', status: 'active' },
  { id: 'u2', name: 'Sneha Patel', email: 'sneha.patel@gmail.com', phone: '+91 8765432109', referralCode: 'SNEHA12', referredBy: 'RAHUL50', joinDate: '2026-04-18', status: 'active' },
  { id: 'u3', name: 'Amit Verma', email: 'amit.verma@gmail.com', phone: '+91 7654321098', referralCode: 'AMIT99', referredBy: 'RAHUL50', joinDate: '2026-04-20', status: 'active' },
  { id: 'u4', name: 'Pooja Hegde', email: 'pooja.hegde@gmail.com', phone: '+91 6543210987', referralCode: 'POOJA45', referredBy: 'SNEHA12', joinDate: '2026-04-22', status: 'active' },
  { id: 'u5', name: 'Rohan Joshi', email: 'rohan.joshi@gmail.com', phone: '+91 5432109876', referralCode: 'ROHAN88', referredBy: 'None', joinDate: '2026-05-01', status: 'blocked' },
];

let mockProducts = [
  { id: '1', name: 'boAt Rockerz 450 Bluetooth Headphones', platform: 'Amazon', price: 29.99, cashbackValue: 10.0, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', status: 'active' },
  { id: '2', name: 'Adidas UltraBoost 22 Running Shoes', platform: 'Myntra', price: 110.00, cashbackValue: 12.0, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', status: 'active' },
  { id: '3', name: 'HP Pavilion Touchscreen Laptop', platform: 'Flipkart', price: 549.99, cashbackValue: 8.5, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', status: 'active' },
  { id: '4', name: 'Cetaphil Daily Facial Cleanser', platform: 'Nykaa Beauty', price: 14.99, cashbackValue: 7.0, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300', status: 'inactive' },
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

  const response = await fetch(`${BASE_URL}${url}`, config);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API error: ${response.status}`);
  }
  return response.json();
}

// --- API ACTIONS DEFINITIONS ---

// 1. Users APIs
export const apiUsers = {
  getAll: () => {
    if (USE_MOCK) return Promise.resolve([...mockUsers]);
    return request('/users');
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
