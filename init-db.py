#!/usr/bin/env python3
"""
MongoDB Database Initialization Script
Populates the affiliate_app database with initial test data including admin users
"""

from datetime import datetime, timedelta
from pymongo import MongoClient
import os
import sys

# MongoDB Connection - Update with your Atlas connection string
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/affiliate_db')

def init_database():
    """Initialize the database with test data"""
    try:
        print(f"[INFO] Connecting to MongoDB: {MONGO_URI}")
        client = MongoClient(MONGO_URI)
        db = client.affiliate_db
        
        # Clear existing collections
        print("[INFO] Clearing existing data...")
        db.users.delete_many({})
        db.products.delete_many({})
        db.tracked_orders.delete_many({})
        db.cashbacks.delete_many({})
        db.wallets.delete_many({})
        
        # Create admin users
        print("[INFO] Creating admin users...")
        admin_users = [
            {
                "_id": "admin001",
                "name": "Cyvanta Admin",
                "email": "admin@cyvanta.com",
                "passwordHash": "admin123",  # In production, this should be hashed
                "phone": "+91 9876543210",
                "referralCode": "ADMIN001",
                "referredBy": None,
                "role": "ADMIN",
                "status": "active",
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            },
            {
                "_id": "admin002",
                "name": "Finance Admin",
                "email": "finance@cyvanta.com",
                "passwordHash": "admin123",
                "phone": "+91 8765432109",
                "referralCode": "ADMIN002",
                "referredBy": None,
                "role": "ADMIN",
                "status": "active",
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            }
        ]
        
        db.users.insert_many(admin_users)
        print(f"[✓] Created {len(admin_users)} admin users")
        
        # Create regular users
        print("[INFO] Creating regular users...")
        regular_users = [
            {
                "_id": "u1",
                "name": "Rahul Sharma",
                "email": "rahul.sharma@gmail.com",
                "passwordHash": "user123",
                "phone": "+91 9876543210",
                "referralCode": "RAHUL50",
                "referredBy": None,
                "role": "USER",
                "status": "active",
                "sharedCommissionRate": None,
                "createdAt": datetime.now() - timedelta(days=50),
                "updatedAt": datetime.now()
            },
            {
                "_id": "u2",
                "name": "Sneha Patel",
                "email": "sneha.patel@gmail.com",
                "passwordHash": "user123",
                "phone": "+91 8765432109",
                "referralCode": "SNEHA12",
                "referredBy": "RAHUL50",
                "role": "USER",
                "status": "active",
                "sharedCommissionRate": None,
                "createdAt": datetime.now() - timedelta(days=45),
                "updatedAt": datetime.now()
            },
            {
                "_id": "u3",
                "name": "Amit Verma",
                "email": "amit.verma@gmail.com",
                "passwordHash": "user123",
                "phone": "+91 7654321098",
                "referralCode": "AMIT99",
                "referredBy": "RAHUL50",
                "role": "USER",
                "status": "active",
                "sharedCommissionRate": None,
                "createdAt": datetime.now() - timedelta(days=40),
                "updatedAt": datetime.now()
            },
            {
                "_id": "u4",
                "name": "Pooja Hegde",
                "email": "pooja.hegde@gmail.com",
                "passwordHash": "user123",
                "phone": "+91 6543210987",
                "referralCode": "POOJA45",
                "referredBy": "SNEHA12",
                "role": "USER",
                "status": "active",
                "sharedCommissionRate": None,
                "createdAt": datetime.now() - timedelta(days=38),
                "updatedAt": datetime.now()
            },
            {
                "_id": "u5",
                "name": "Rohan Joshi",
                "email": "rohan.joshi@gmail.com",
                "passwordHash": "user123",
                "phone": "+91 5432109876",
                "referralCode": "ROHAN88",
                "referredBy": None,
                "role": "USER",
                "status": "blocked",
                "sharedCommissionRate": None,
                "createdAt": datetime.now() - timedelta(days=30),
                "updatedAt": datetime.now()
            }
        ]
        
        db.users.insert_many(regular_users)
        print(f"[✓] Created {len(regular_users)} regular users")
        
        # Create products
        print("[INFO] Creating products...")
        products = [
            {
                "name": "boAt Rockerz 450 Bluetooth Headphones",
                "platform": "Amazon",
                "price": 29.99,
                "cashbackValue": 10.0,
                "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                "status": "active",
                "createdAt": datetime.now()
            },
            {
                "name": "Adidas UltraBoost 22 Running Shoes",
                "platform": "Myntra",
                "price": 110.00,
                "cashbackValue": 12.0,
                "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                "status": "active",
                "createdAt": datetime.now()
            },
            {
                "name": "HP Pavilion Touchscreen Laptop",
                "platform": "Flipkart",
                "price": 549.99,
                "cashbackValue": 8.5,
                "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300",
                "status": "active",
                "createdAt": datetime.now()
            },
            {
                "name": "Cetaphil Daily Facial Cleanser",
                "platform": "Nykaa Beauty",
                "price": 14.99,
                "cashbackValue": 7.0,
                "image": "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300",
                "status": "active",
                "createdAt": datetime.now()
            }
        ]
        
        result = db.products.insert_many(products)
        print(f"[✓] Created {len(products)} products")
        
        # Create wallets for users
        print("[INFO] Creating wallets...")
        wallets = [
            {
                "userId": "u1",
                "approvedBalance": 250.50,
                "pendingBalance": 120.75,
                "createdAt": datetime.now()
            },
            {
                "userId": "u2",
                "approvedBalance": 150.00,
                "pendingBalance": 45.50,
                "createdAt": datetime.now()
            },
            {
                "userId": "u3",
                "approvedBalance": 300.00,
                "pendingBalance": 200.00,
                "createdAt": datetime.now()
            },
            {
                "userId": "u4",
                "approvedBalance": 50.00,
                "pendingBalance": 25.00,
                "createdAt": datetime.now()
            },
            {
                "userId": "u5",
                "approvedBalance": 0.0,
                "pendingBalance": 0.0,
                "createdAt": datetime.now()
            }
        ]
        
        db.wallets.insert_many(wallets)
        print(f"[✓] Created {len(wallets)} wallets")
        
        # Create indexes
        print("[INFO] Creating database indexes...")
        db.users.create_index("email", unique=True)
        db.users.create_index("referralCode", unique=True)
        db.products.create_index("name")
        print("[✓] Indexes created")
        
        print("\n" + "="*50)
        print("✓ Database initialization completed successfully!")
        print("="*50)
        print("\nTest Admin Users:")
        print("  1. admin@cyvanta.com / admin123 (Main Admin)")
        print("  2. finance@cyvanta.com / admin123 (Finance Admin)")
        print("\nTest Users:")
        for user in regular_users:
            print(f"  • {user['email']} / user123 ({user['status']})")
        print("\n" + "="*50)
        
        client.close()
        return True
        
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {str(e)}")
        return False

if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)
