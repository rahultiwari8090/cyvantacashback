#!/bin/bash
echo "🔴 Stopping any process on port 8080..."
fuser -k 8080/tcp 2>/dev/null
sleep 2
echo "🟢 Starting backend..."
cd "$(dirname "$0")/backend"
./mvnw spring-boot:run
