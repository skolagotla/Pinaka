#!/bin/bash
# Test FastAPI v2 endpoints

API_BASE="http://localhost:8000/api/v2"
EMAIL="superadmin@pinaka.com"
PASSWORD="SuperAdmin123!"

echo "🧪 Testing FastAPI v2 Endpoints"
echo "================================"
echo ""

# Login
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test endpoints
echo "2. Testing /auth/me..."
curl -s -X GET "${API_BASE}/auth/me" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 200
echo ""
echo ""

echo "3. Testing /organizations..."
curl -s -X GET "${API_BASE}/organizations" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 200
echo ""
echo ""

echo "4. Testing /properties..."
curl -s -X GET "${API_BASE}/properties" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 200
echo ""
echo ""

echo "5. Testing /tenants..."
curl -s -X GET "${API_BASE}/tenants" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 200
echo ""
echo ""

echo "6. Testing /landlords..."
curl -s -X GET "${API_BASE}/landlords" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 200
echo ""
echo ""

echo "7. Testing /leases..."
curl -s -X GET "${API_BASE}/leases" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 200
echo ""
echo ""

echo "8. Testing /work-orders..."
curl -s -X GET "${API_BASE}/work-orders" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 200
echo ""
echo ""

echo "✅ All endpoint tests completed"
