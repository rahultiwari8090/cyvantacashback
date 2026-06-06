import pymongo
import bcrypt

client = pymongo.MongoClient("mongodb+srv://shailavisrivastava977_db_user:Matra04@cluster0.usvsonz.mongodb.net/affiliate-app?retryWrites=true&w=majority&appName=Cluster0")
db = client['affiliate-app']

users = db.users.find()

count = 0
for user in users:
    pwd = user.get("passwordHash", "")
    # Check if it's already a bcrypt hash (starts with $2b$ or $2a$)
    if not pwd.startswith("$2") and pwd != "":
        # Generate bcrypt hash
        hashed = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.users.update_one({"_id": user["_id"]}, {"$set": {"passwordHash": hashed}})
        print(f"Updated password for {user.get('email')}")
        count += 1
    elif pwd == "":
        hashed = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.users.update_one({"_id": user["_id"]}, {"$set": {"passwordHash": hashed}})
        print(f"Set default password for {user.get('email')}")
        count += 1

print(f"Total updated: {count}")
