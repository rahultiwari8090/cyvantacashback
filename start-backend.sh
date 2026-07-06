#!/bin/bash
echo "🔴 Stopping ALL old backend processes..."
pkill -9 -f "spring-boot:run" 2>/dev/null
pkill -9 -f "affiliate-app" 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 3

echo "✅ Port 8080 is now free"
echo "🟢 Starting backend..."
cd "$(dirname "$0")/backend"
./mvnw spring-boot:run
