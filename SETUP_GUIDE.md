# Frontend-Backend Connection Setup Guide

## Overview
This guide will help you connect your Cyvanta Affiliate App frontend to the backend with MongoDB Atlas database integration.

## Prerequisites
- MongoDB Atlas account (free tier available at mongodb.com)
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5173` (Vite)
- Node.js & npm installed
- Python 3 installed (for database initialization)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create a MongoDB Atlas Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account (or log in if you have one)
3. Create a new project
4. Create a cluster (Free tier M0 is sufficient)
5. Create a database user with username and password
6. Add your IP address to the Network Access whitelist (or use 0.0.0.0/0 for testing)

### 1.2 Get Your Connection String
1. In Atlas, go to **Cluster → Connect → Connect your application**
2. Copy the connection string (MongoDB URI)
3. Replace `<username>` and `<password>` with your database credentials
4. Replace `<cluster-name>` with your actual cluster name
5. The format should be:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/affiliate_db?retryWrites=true&w=majority
   ```

---

## Step 2: Backend Configuration

### 2.1 Set Environment Variable
Set the `MONGO_URI` environment variable with your MongoDB Atlas connection string:

**On Linux/Mac:**
```bash
export MONGO_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/affiliate_db?retryWrites=true&w=majority"
```

**On Windows (PowerShell):**
```powershell
$env:MONGO_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/affiliate_db?retryWrites=true&w=majority"
```

### 2.2 Verify Backend Configuration
Check that `application.yml` has the correct MongoDB URI configuration:
```yaml
spring:
  data:
    mongodb:
      uri: ${MONGO_URI:mongodb://localhost:27017/affiliate_db}
```

---

## Step 3: Database Initialization

### 3.1 Install Python Dependencies
```bash
pip install pymongo
```

### 3.2 Run the Initialization Script
```bash
# Set your MongoDB URI first (see Step 2.1)
python3 init-db.py
```

This script will:
- Create admin users (admin@cyvanta.com, finance@cyvanta.com)
- Create test users (rahul.sharma@gmail.com, sneha.patel@gmail.com, etc.)
- Create sample products
- Create wallets for users
- Set up database indexes

**Test Credentials After Initialization:**
- Admin: `admin@cyvanta.com` / `admin123`
- User: `rahul.sharma@gmail.com` / `user123`

---

## Step 4: Start the Application

### 4.1 Start Backend (Terminal 1)
```bash
cd /home/shailavi-srivastava/Desktop/affiliate-app
# Build and run (Maven)
./mvnw spring-boot:run

# Or build first, then run
./mvnw clean package
java -jar target/affiliate-app-0.0.1-SNAPSHOT.jar
```

The backend should start on `http://localhost:8080`

### 4.2 Start Frontend (Terminal 2)
```bash
cd /home/shailavi-srivastava/Desktop/affiliate-app/frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

---

## Step 5: Test the Connection

### 5.1 Check Backend API Status
Visit: `http://localhost:8080/api/users`

You should see a JSON array of all users from the database.

### 5.2 Test Admin Login
1. Open frontend: `http://localhost:5173`
2. Click on "Admin Login" or navigate to admin panel
3. Enter credentials:
   - Email: `admin@cyvanta.com`
   - Password: `admin123`
4. You should be redirected to the admin dashboard with data from the database

### 5.3 Test User Login
1. Click on "Sign In" / "Login"
2. Enter credentials:
   - Email: `rahul.sharma@gmail.com`
   - Password: `user123`
3. You should see user dashboard with wallet data from the database

### 5.4 Test Product Display
1. Navigate to the main page / store listings
2. You should see products from the MongoDB database (not mock data)
3. Check browser DevTools Console for `[API Service] Running in BACKEND (MongoDB Atlas) mode.`

---

## Step 6: API Endpoints Overview

### User Endpoints
```
POST   /api/users/login              - User login
POST   /api/users/register           - User registration
POST   /api/users/admin/login        - Admin login
GET    /api/users                    - Get all users (admin only)
PUT    /api/users/{id}/status        - Update user status
```

### Product Endpoints
```
GET    /api/products                 - Get all products
POST   /api/products                 - Create product (admin)
PUT    /api/products/{id}            - Update product
DELETE /api/products/{id}            - Delete product
```

### Other Endpoints
```
GET    /api/cashback                 - Get all cashbacks
GET    /api/tracking                 - Get all tracked orders
GET    /api/withdrawals              - Get withdrawal requests
GET    /api/finance                  - Get finance data
GET    /api/settings                 - Get global settings
```

---

## Troubleshooting

### Issue: Backend can't connect to MongoDB
**Solution:**
1. Verify MongoDB URI in environment variable: `echo $MONGO_URI`
2. Check that your IP is whitelisted in MongoDB Atlas Network Access
3. Verify username and password in the connection string
4. Try with `mongodb://localhost:27017/affiliate_db` for local testing

### Issue: Frontend shows "Cannot reach backend"
**Solution:**
1. Ensure backend is running on port 8080: `curl http://localhost:8080/api/users`
2. Check browser console for CORS errors
3. Verify API base URL is `http://localhost:8080/api` in frontend

### Issue: Admin login fails with correct credentials
**Solution:**
1. Check that the database was initialized with admin users
2. Verify the user role is set to "ADMIN" in the database
3. Check backend logs for authentication errors

### Issue: Data not showing in admin panel
**Solution:**
1. Open DevTools → Console to check for API errors
2. Verify database initialization completed successfully
3. Check that `USE_MOCK` is set to `false` in frontend API service
4. Run `init-db.py` again to repopulate the database

---

## Switching Between Mock and Backend

### To Use Mock Data (for offline development):
```javascript
// In browser console:
localStorage.setItem('api_use_mock', 'true');
location.reload();
```

### To Use Backend (connect to MongoDB):
```javascript
// In browser console:
localStorage.setItem('api_use_mock', 'false');
location.reload();
```

Check console log to verify: `[API Service] Running in BACKEND (MongoDB Atlas) mode.`

---

## Next Steps

1. **Security**: In production, implement password hashing (BCrypt) instead of storing plain passwords
2. **Authentication**: Add JWT tokens for session management
3. **CORS**: Configure proper CORS settings for different environments
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Validation**: Add comprehensive input validation on backend
6. **Error Handling**: Implement global error handling middleware

---

## Support
If you encounter issues, check:
1. Backend logs: `target/logs/` or console output
2. Frontend console: Browser DevTools → Console
3. MongoDB Atlas logs: Cluster → Logs
4. This guide's Troubleshooting section

**Connection successfully established!** 🎉
