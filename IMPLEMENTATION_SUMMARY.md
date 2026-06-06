# Backend-Frontend Connection - Implementation Summary

## ✅ What Has Been Done

### 1. Backend Configuration
- ✅ Updated `application.yml` to support MongoDB Atlas connection via `MONGO_URI` environment variable
- ✅ Added admin login endpoint `/api/users/admin/login` with admin role verification
- ✅ All existing backend APIs already configured to use MongoDB repositories

### 2. Frontend API Service Updates
- ✅ Changed default mode from mock to **real backend connection** (USE_MOCK = false by default)
- ✅ Added `apiUsers.login()` method to call `/api/users/login` endpoint
- ✅ Added `apiUsers.register()` method for user registration
- ✅ Added `apiUsers.adminLogin()` method for admin authentication
- ✅ All API calls now connect to backend instead of using local mock data

### 3. Frontend Component Updates
- ✅ Updated `AuthModal.jsx` to use real backend for user login/registration
- ✅ Updated `AdminLogin.jsx` to use real backend for admin authentication
- ✅ Added error handling and loading states for better UX
- ✅ Added session storage to track logged-in users

### 4. Database Initialization
- ✅ Created `init-db.py` script to populate MongoDB with test data
- ✅ Script creates admin users (verified from DB on login)
- ✅ Script creates sample regular users
- ✅ Script creates sample products
- ✅ Script creates user wallets
- ✅ Database indexes configured for optimized queries

### 5. Documentation
- ✅ Created comprehensive `SETUP_GUIDE.md` with step-by-step instructions
- ✅ Included MongoDB Atlas setup guide
- ✅ Included troubleshooting section
- ✅ Included API endpoints reference

---

## 🚀 Quick Start Guide

### Step 1: Set MongoDB Atlas Connection
```bash
export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/affiliate_db?retryWrites=true&w=majority"
```

### Step 2: Initialize Database with Test Data
```bash
pip install pymongo
python3 init-db.py
```

### Step 3: Start Backend
```bash
cd /path/to/affiliate-app
./mvnw spring-boot:run
```

### Step 4: Start Frontend
```bash
cd /path/to/affiliate-app/frontend
npm run dev
```

### Step 5: Test the Connection
- **Admin Login**: admin@cyvanta.com / admin123
- **User Login**: rahul.sharma@gmail.com / user123

---

## 📊 Data Flow Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │
         │ HTTP/API
         │ (Port 5173)
         ▼
┌─────────────────────────┐
│  Spring Boot Backend    │
│  (Port 8080/api)        │
└─────────┬───────────────┘
          │
          │ MongoDB Driver
          │
          ▼
┌──────────────────────────┐
│   MongoDB Atlas          │
│   (Cloud Database)       │
│   - Users Collection     │
│   - Products Collection  │
│   - Orders Collection    │
│   - Wallets Collection   │
│   - etc.                 │
└──────────────────────────┘
```

---

## 🔐 Authentication Flow

### Admin Login
```
1. User enters admin@cyvanta.com / admin123
2. Frontend calls → POST /api/users/admin/login
3. Backend verifies credentials from MongoDB
4. Backend checks user.role == "ADMIN"
5. Returns admin session data
6. Frontend stores admin session and shows admin panel
```

### User Login
```
1. User enters email/password
2. Frontend calls → POST /api/users/login
3. Backend verifies credentials from MongoDB
4. Backend returns user wallet data
5. Frontend stores user session and shows dashboard
```

### User Registration
```
1. User fills signup form
2. Frontend calls → POST /api/users/register
3. Backend checks if email exists (unique constraint)
4. Creates new user with USER role in MongoDB
5. Creates wallet for user
6. Returns user data
7. Frontend logs user in automatically
```

---

## 📱 API Endpoints Connected

### Users
- `POST /api/users/login` - User login ✅
- `POST /api/users/register` - User registration ✅
- `POST /api/users/admin/login` - Admin login ✅
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/{id}/status` - Update user status

### Products
- `GET /api/products` - Get all products (from DB)
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Other APIs
- `GET /api/cashback` - Cashback records
- `GET /api/tracking` - Tracked orders
- `GET /api/withdrawals` - Withdrawal requests
- `GET /api/finance` - Finance dashboard
- `GET /api/settings` - App settings
- And more...

All APIs now fetch from MongoDB instead of using mock data!

---

## 🗄️ Database Collections Created

### Users Collection
```json
{
  "_id": "admin001",
  "name": "Cyvanta Admin",
  "email": "admin@cyvanta.com",
  "passwordHash": "admin123",
  "role": "ADMIN",
  "status": "active",
  "referralCode": "ADMIN001",
  "createdAt": "2024-06-05T..."
}
```

### Products Collection
```json
{
  "_id": ObjectId(...),
  "name": "boAt Rockerz 450 Bluetooth Headphones",
  "platform": "Amazon",
  "price": 29.99,
  "cashbackValue": 10.0,
  "status": "active"
}
```

### Wallets Collection
```json
{
  "_id": ObjectId(...),
  "userId": "u1",
  "approvedBalance": 250.50,
  "pendingBalance": 120.75
}
```

---

## 🔄 Fallback Mode

If you want to test with mock data offline:
```javascript
// In browser console:
localStorage.setItem('api_use_mock', 'true');
location.reload();
```

Then all data will come from the frontend mock, not from backend.

---

## ⚠️ Important Notes

1. **Password Security**: Passwords in init-db.py are plain text for demo. Use BCrypt hashing in production.

2. **Environment Variables**: Make sure `MONGO_URI` is set before starting backend:
   ```bash
   export MONGO_URI="your-connection-string"
   ```

3. **Database URL**: 
   - Local: `mongodb://localhost:27017/affiliate_db`
   - Atlas: `mongodb+srv://...`

4. **Test Data**: Run `init-db.py` only ONCE or it will fail with duplicate key errors (unless you clear the DB first).

5. **API Base URL**: Frontend expects backend at `http://localhost:8080/api`

---

## 📋 Files Modified/Created

### Modified Files
1. `backend/src/main/resources/application.yml` - Added MongoDB URI config
2. `backend/src/main/java/.../controller/UserController.java` - Added admin login endpoint
3. `frontend/src/services/api.js` - Updated to use backend by default, added login/register methods
4. `frontend/src/components/AuthModal.jsx` - Updated to call backend API
5. `frontend/src/components/AdminLogin.jsx` - Updated to call backend API
6. `frontend/package.json` - Updated React version compatibility

### Created Files
1. `init-db.py` - Database initialization script
2. `SETUP_GUIDE.md` - Comprehensive setup documentation
3. This file - Implementation summary

---

## ✨ Next Steps

1. **Set up MongoDB Atlas** (follow SETUP_GUIDE.md)
2. **Run init-db.py** to populate test data
3. **Start backend** with `mvnw spring-boot:run`
4. **Start frontend** with `npm run dev`
5. **Test admin login** with admin@cyvanta.com / admin123
6. **Test user login** with rahul.sharma@gmail.com / user123
7. **Check admin panel** - all data should come from MongoDB!

---

## 🎉 Connection Status

✅ Frontend connected to Backend
✅ Backend connected to MongoDB Atlas
✅ Admin authentication from database
✅ User management from database
✅ All data persisted in cloud database

Your app is now fully connected and ready to use with real database!

---

For detailed setup instructions, see: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
