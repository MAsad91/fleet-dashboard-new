#!/bin/bash

# Fleet Dashboard API Test Script
# Tests login and all endpoints with testadmin/testadmin123

API_BASE_URL="https://oem.platform-api-test.joulepoint.com/api"
USERNAME="testadmin"
PASSWORD="testadmin123"

echo "🚀 Fleet Dashboard API Test Suite"
echo "=================================="
echo "API Base URL: $API_BASE_URL"
echo "Username: $USERNAME"
echo ""

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    local url="$API_BASE_URL$endpoint"
    local headers="Content-Type: application/json"
    
    if [ ! -z "$token" ]; then
        headers="$headers
Authorization: Bearer $token"
    fi
    
    if [ "$method" = "POST" ] && [ ! -z "$data" ]; then
        curl -s -X POST "$url" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            -w "\nHTTP Status: %{http_code}\n"
    else
        curl -s -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -w "\nHTTP Status: %{http_code}\n"
    fi
}

# Test 1: Login
echo "🔐 Testing Login..."
echo "-------------------"
login_response=$(api_call "POST" "/users/login_with_password/" "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" "")
echo "$login_response"

# Extract token from login response
access_token=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$access_token" ]; then
    echo "❌ Login failed - no access token received"
    echo "Response: $login_response"
    exit 1
fi

echo "✅ Login successful! Token: ${access_token:0:20}..."
echo ""

# Test 2: User Info
echo "👤 Testing User Info..."
echo "----------------------"
user_response=$(api_call "GET" "/users/users/me/" "" "$access_token")
echo "$user_response"
echo ""

# Test 3: Dashboard Summary
echo "📊 Testing Dashboard Summary..."
echo "------------------------------"
dashboard_response=$(api_call "GET" "/fleet/dashboard/summary/?date_range=today" "" "$access_token")
echo "$dashboard_response"
echo ""

# Test 4: Vehicles Stats
echo "🚛 Testing Vehicles Stats..."
echo "---------------------------"
vehicles_response=$(api_call "GET" "/fleet/vehicles/dashboard_stats/?date_range=today" "" "$access_token")
echo "$vehicles_response"
echo ""

# Test 5: Drivers Stats
echo "👥 Testing Drivers Stats..."
echo "--------------------------"
drivers_response=$(api_call "GET" "/fleet/drivers/dashboard_stats/?date_range=today" "" "$access_token")
echo "$drivers_response"
echo ""

# Test 6: Trips Stats
echo "🛣️ Testing Trips Stats..."
echo "------------------------"
trips_response=$(api_call "GET" "/fleet/trips/dashboard_stats/?date_range=today" "" "$access_token")
echo "$trips_response"
echo ""

# Test 7: Alerts Stats
echo "🚨 Testing Alerts Stats..."
echo "-------------------------"
alerts_response=$(api_call "GET" "/fleet/alerts/dashboard_stats/?date_range=today" "" "$access_token")
echo "$alerts_response"
echo ""

# Test 8: Maintenance Stats
echo "🔧 Testing Maintenance Stats..."
echo "------------------------------"
maintenance_response=$(api_call "GET" "/fleet/scheduled-maintenance/dashboard_stats/?date_range=today" "" "$access_token")
echo "$maintenance_response"
echo ""

# Test 9: List Vehicles
echo "🚛 Testing List Vehicles..."
echo "--------------------------"
list_vehicles_response=$(api_call "GET" "/fleet/vehicles/?page=1" "" "$access_token")
echo "$list_vehicles_response"
echo ""

# Test 10: List Drivers
echo "👥 Testing List Drivers..."
echo "-------------------------"
list_drivers_response=$(api_call "GET" "/fleet/drivers/?page=1" "" "$access_token")
echo "$list_drivers_response"
echo ""

# Test 11: List Alerts
echo "🚨 Testing List Alerts..."
echo "------------------------"
list_alerts_response=$(api_call "GET" "/fleet/alerts/?status=active&limit=5" "" "$access_token")
echo "$list_alerts_response"
echo ""

# Test 12: Admin Endpoints (Expected 403)
echo "🔒 Testing Admin Endpoints (Expected 403)..."
echo "--------------------------------------------"
dashcams_response=$(api_call "GET" "/fleet/dashcams/?page=1" "" "$access_token")
echo "$dashcams_response"
echo ""

echo "🎉 API Testing Complete!"
echo "========================"
echo "Check the responses above for any errors or unexpected status codes."

