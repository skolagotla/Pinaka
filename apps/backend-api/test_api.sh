#!/bin/bash
# Test script for FastAPI v2 endpoints

BASE_URL="http://localhost:8000/api/v2"
echo "Testing FastAPI v2 API endpoints..."
echo ""

# Test 1: Health check
echo "1. Testing root endpoint..."
curl -s http://localhost:8000/ | python3 -m json.tool || echo "✗ Root endpoint failed"
echo ""

# Test 2: Login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@pinaka.com","password":"SuperAdmin123!"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "✗ Login failed - no token received"
  exit 1
fi

echo "✓ Login successful"
echo ""

# Test 3: Get current user
echo "3. Testing /auth/me..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me" | python3 -m json.tool 2>/dev/null || echo "✗ Failed"
echo ""

# Test 4: List organizations
echo "4. Testing /organizations..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/organizations" | python3 -m json.tool 2>/dev/null || echo "✗ Failed"
echo ""

# Test 5: List properties
echo "5. Testing /properties..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/properties" | python3 -m json.tool 2>/dev/null || echo "✗ Failed"
echo ""

# Test 6: List work orders
echo "6. Testing /work-orders..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/work-orders" | python3 -m json.tool 2>/dev/null || echo "✗ Failed"
echo ""

echo "✅ All API tests completed!"

