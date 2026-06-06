import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
try {
  await fs.mkdir(DATA_DIR, { recursive: true });
} catch (err) {
  // Ignored if already exists
}

// Memory cache
const db = {};

// Initial mock data
const seeds = {
  users: [
    { id: 'u1', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 9876543210', referralCode: 'RAHUL50', referredBy: 'None', joinDate: '2026-04-12', status: 'active', sharedCommissionRate: null, wallet: { confirmed: 50.00, pending: 1.05, referral: 0.00 } },
    { id: 'u2', name: 'Sneha Patel', email: 'sneha.patel@gmail.com', phone: '+91 8765432109', referralCode: 'SNEHA12', referredBy: 'RAHUL50', joinDate: '2026-04-18', status: 'active', sharedCommissionRate: null, wallet: { confirmed: 20.00, pending: 2.75, referral: 0.00 } },
    { id: 'u3', name: 'Amit Verma', email: 'amit.verma@gmail.com', phone: '+91 7654321098', referralCode: 'AMIT99', referredBy: 'RAHUL50', joinDate: '2026-04-20', status: 'active', sharedCommissionRate: null, wallet: { confirmed: 0.00, pending: 0.00, referral: 0.00 } },
    { id: 'u4', name: 'Pooja Hegde', email: 'pooja.hegde@gmail.com', phone: '+91 6543210987', referralCode: 'POOJA45', referredBy: 'SNEHA12', joinDate: '2026-04-22', status: 'active', sharedCommissionRate: null, wallet: { confirmed: 0.00, pending: 0.00, referral: 0.00 } },
    { id: 'u5', name: 'Rohan Joshi', email: 'rohan.joshi@gmail.com', phone: '+91 5432109876', referralCode: 'ROHAN88', referredBy: 'None', joinDate: '2026-05-01', status: 'blocked', sharedCommissionRate: null, wallet: { confirmed: 0.00, pending: 0.00, referral: 0.00 } }
  ],
  sharedLinks: [
    { id: 'sl1', userId: 'u1', userName: 'Rahul Sharma', productName: 'boAt Rockerz Headphones', store: 'Amazon', productUrl: 'https://amazon.in/dp/example', shortUrl: 'https://cyvanta.cashback/share/sl1', clicksCount: 24, conversionsCount: 2, totalEarnings: 3.00, userSharePercent: 70, buyerSharePercent: 30, status: 'active', date: '2026-05-25' },
    { id: 'sl2', userId: 'u2', userName: 'Sneha Patel', productName: 'Adidas UltraBoost Shoes', store: 'Myntra', productUrl: 'https://myntra.com/shoes/example', shortUrl: 'https://cyvanta.cashback/share/sl2', clicksCount: 15, conversionsCount: 1, totalEarnings: 5.50, userSharePercent: 50, buyerSharePercent: 50, status: 'active', date: '2026-05-28' }
  ],
  sharedCommissions: [
    { id: 'sc1', userId: 'u1', userName: 'Rahul Sharma', linkId: 'sl1', productName: 'boAt Rockerz Headphones', store: 'Amazon', purchaseAmount: 29.99, commissionRate: 5.0, commissionAmount: 1.50, userSharePercent: 70, buyerSharePercent: 30, userCommissionAmount: 1.05, buyerCommissionAmount: 0.45, status: 'approved', date: '2026-05-28' },
    { id: 'sc2', userId: 'u1', userName: 'Rahul Sharma', linkId: 'sl1', productName: 'boAt Rockerz Headphones', store: 'Amazon', purchaseAmount: 29.99, commissionRate: 5.0, commissionAmount: 1.50, userSharePercent: 70, buyerSharePercent: 30, userCommissionAmount: 1.05, buyerCommissionAmount: 0.45, status: 'pending', date: '2026-05-29' },
    { id: 'sc3', userId: 'u2', userName: 'Sneha Patel', linkId: 'sl2', productName: 'Adidas UltraBoost Shoes', store: 'Myntra', purchaseAmount: 110.00, commissionRate: 5.0, commissionAmount: 5.50, userSharePercent: 50, buyerSharePercent: 50, userCommissionAmount: 2.75, buyerCommissionAmount: 2.75, status: 'pending', date: '2026-06-01' }
  ],
  products: [
    { id: '1', name: 'boAt Rockerz 450 Bluetooth Headphones', platform: 'Amazon', price: 29.99, cashbackValue: 10.0, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', status: 'active' },
    { id: '2', name: 'Adidas UltraBoost 22 Running Shoes', platform: 'Myntra', price: 110.00, cashbackValue: 12.0, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', status: 'active' },
    { id: '3', name: 'HP Pavilion Touchscreen Laptop', platform: 'Flipkart', price: 549.99, cashbackValue: 8.5, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', status: 'active' },
    { id: '4', name: 'Cetaphil Daily Facial Cleanser', platform: 'Nykaa Beauty', price: 14.99, cashbackValue: 7.0, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300', status: 'inactive' }
  ],
  cashback: [
    { id: 'cb1', userName: 'Rahul Sharma', productName: 'boAt Rockerz 450 Bluetooth Headphones', amount: 3.00, status: 'approved', date: '2026-05-28' },
    { id: 'cb2', userName: 'Sneha Patel', productName: 'Adidas UltraBoost 22 Running Shoes', amount: 13.20, status: 'pending', date: '2026-05-30' },
    { id: 'cb3', userName: 'Amit Verma', productName: 'HP Pavilion Touchscreen Laptop', amount: 46.75, status: 'pending', date: '2026-06-01' },
    { id: 'cb4', userName: 'Rahul Sharma', productName: 'Cetaphil Daily Facial Cleanser', amount: 1.05, status: 'rejected', date: '2026-05-25' }
  ],
  tracking: [
    { id: 'TRK99281', userId: 'u1', userName: 'Rahul Sharma', productId: '1', productName: 'boAt Rockerz 450 Bluetooth Headphones', platform: 'Amazon', price: 29.99, cashbackAmount: 3.00, status: 'completed', orderDate: '2026-05-20', confirmedDate: '2026-05-21', shippedDate: '2026-05-22', deliveredDate: '2026-05-23', returnExpiryDate: '2026-05-30', returnWindowDays: 7, cashbackId: 'cb1' },
    { id: 'TRK87123', userId: 'u2', userName: 'Sneha Patel', productId: '2', productName: 'Adidas UltraBoost 22 Running Shoes', platform: 'Myntra', price: 110.00, cashbackAmount: 13.20, status: 'return_active', orderDate: '2026-05-28', confirmedDate: '2026-05-29', shippedDate: '2026-05-30', deliveredDate: '2026-06-01', returnExpiryDate: '2026-06-11', returnWindowDays: 10, cashbackId: 'cb2' },
    { id: 'TRK44102', userId: 'u3', userName: 'Amit Verma', productId: '3', productName: 'HP Pavilion Touchscreen Laptop', platform: 'Flipkart', price: 549.99, cashbackAmount: 46.75, status: 'shipped', orderDate: '2026-06-01', confirmedDate: '2026-06-02', shippedDate: '2026-06-02', returnWindowDays: 15, cashbackId: 'cb3' }
  ],
  withdrawals: [
    { id: 'w1', userName: 'Rahul Sharma', coins: 5000, amount: 50.00, upiId: 'rahul@okaxis', status: 'pending', date: '2026-05-31' },
    { id: 'w2', userName: 'Sneha Patel', coins: 2000, amount: 20.00, upiId: 'sneha@oksbi', status: 'approved', date: '2026-05-28' },
    { id: 'w3', userName: 'Amit Verma', coins: 10000, amount: 100.00, upiId: 'amitv@paytm', status: 'pending', date: '2026-06-01' }
  ],
  clicks: [
    { clickId: 'CLK0982312', userName: 'Rahul Sharma', productName: 'boAt Rockerz 450 Bluetooth Headphones', network: 'Amazon', date: '2026-05-28' },
    { clickId: 'CLK04928312', userName: 'Sneha Patel', productName: 'Adidas UltraBoost 22 Running Shoes', network: 'Myntra', date: '2026-05-30' },
    { clickId: 'CLK23910399', userName: 'Amit Verma', productName: 'HP Pavilion Touchscreen Laptop', network: 'Flipkart', date: '2026-06-01' },
    { clickId: 'CLK11938210', userName: 'Rahul Sharma', productName: 'Cetaphil Daily Facial Cleanser', network: 'Nykaa Beauty', date: '2026-05-25' },
    { clickId: 'CLK77382910', userName: 'Pooja Hegde', productName: 'boAt Rockerz 450 Bluetooth Headphones', network: 'Amazon', date: '2026-06-02' }
  ],
  conversions: [
    { id: 'conv1', subId: 'SUB99281', clickId: 'CLK0982312', commission: 3.00, status: 'approved', date: '2026-05-28', userName: 'Rahul Sharma', network: 'Amazon' },
    { id: 'conv2', subId: 'SUB87123', clickId: 'CLK04928312', commission: 13.20, status: 'pending', date: '2026-05-30', userName: 'Sneha Patel', network: 'Myntra' },
    { id: 'conv3', subId: 'SUB44102', clickId: 'CLK23910399', commission: 46.75, status: 'pending', date: '2026-06-01', userName: 'Amit Verma', network: 'Flipkart' },
    { id: 'conv4', subId: 'SUB99282', clickId: 'CLK11938210', commission: 1.05, status: 'rejected', date: '2026-05-25', userName: 'Rahul Sharma', network: 'Nykaa Beauty' }
  ],
  finance: {
    totalRevenue: 2840.00,
    totalCashbackPaid: 1205.00,
    totalWithdrawPaid: 980.00,
    pendingWithdrawals: 150.00,
    transactions: [
      { id: 'tx1', desc: 'Affiliate Commission (Amazon - conv1)', type: 'credit', amount: 45.00, date: '2026-05-28' },
      { id: 'tx2', desc: 'User Cashback Payout (Sneha Patel)', type: 'debit', amount: 20.00, date: '2026-05-28' },
      { id: 'tx3', desc: 'Affiliate Commission (Flipkart - conv3)', type: 'credit', amount: 112.50, date: '2026-06-01' },
      { id: 'tx4', desc: 'Marketing Sponsor Ads', type: 'credit', amount: 250.00, date: '2026-05-20' }
    ]
  },
  settings: {
    cashbackPercent: 8.0,
    holdDays: 30,
    minimumWithdrawal: 10.00,
    sharedCommissionPercent: 5.0,
    sharedCommissionHoldDays: 30
  }
};

const load = async (key) => {
  if (db[key]) return db[key];
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    db[key] = JSON.parse(data);
  } catch (err) {
    db[key] = seeds[key];
    await fs.writeFile(filePath, JSON.stringify(db[key], null, 2), 'utf8');
  }
  return db[key];
};

const save = async (key) => {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  await fs.writeFile(filePath, JSON.stringify(db[key], null, 2), 'utf8');
};

export default {
  getCollection: async (key) => {
    return await load(key);
  },
  saveCollection: async (key) => {
    await save(key);
  }
};
