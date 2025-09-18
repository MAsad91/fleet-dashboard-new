// Simple API Test Script for Fleet Dashboard
// Run this in browser console after opening the dashboard

const API_BASE_URL = 'https://oem.platform-api-test.joulepoint.com/api';

async function testAPIEndpoint(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        console.log(`🔍 Testing: ${method} ${endpoint}`);
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ SUCCESS: ${endpoint}`, data);
            return { success: true, data, status: response.status };
        } else {
            console.log(`❌ ERROR: ${endpoint} - Status: ${response.status}`, data);
            return { success: false, error: data, status: response.status };
        }
    } catch (error) {
        console.log(`💥 EXCEPTION: ${endpoint}`, error);
        return { success: false, error: error.message };
    }
}

async function runAPITests() {
    console.log('🚀 Starting Fleet Dashboard API Tests...');
    console.log('='.repeat(50));
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
    };

    // Test 1: Login
    console.log('\n🔐 Testing Authentication...');
    const loginResult = await testAPIEndpoint('/users/login_with_password/', 'POST', {
        username: 'testadmin',
        password: 'testadmin123'
    });
    
    results.total++;
    if (loginResult.success) {
        results.passed++;
        console.log('✅ Login successful! Token obtained.');
        // Store token for subsequent requests
        if (loginResult.data.access_token) {
            localStorage.setItem('access_token', loginResult.data.access_token);
            console.log('🔑 Token stored in localStorage');
        }
    } else {
        results.failed++;
        results.errors.push('Login failed');
        console.log('❌ Login failed - cannot continue with other tests');
        return results;
    }

    // Test 2: Dashboard APIs
    console.log('\n📊 Testing Dashboard APIs...');
    const dashboardTests = [
        '/fleet/dashboard/summary/?date_range=today',
        '/fleet/vehicles/dashboard_stats/?date_range=today',
        '/fleet/drivers/dashboard_stats/?date_range=today',
        '/fleet/trips/dashboard_stats/?date_range=today',
        '/fleet/alerts/dashboard_stats/?date_range=today',
        '/fleet/scheduled-maintenance/dashboard_stats/?date_range=today'
    ];

    for (const endpoint of dashboardTests) {
        results.total++;
        const result = await testAPIEndpoint(endpoint);
        if (result.success) {
            results.passed++;
        } else {
            results.failed++;
            results.errors.push(`${endpoint}: ${result.status}`);
        }
    }

    // Test 3: Fleet Management APIs
    console.log('\n🚛 Testing Fleet Management APIs...');
    const fleetTests = [
        '/fleet/vehicles/?page=1',
        '/fleet/drivers/?page=1',
        '/fleet/trips/?page=1',
        '/fleet/alerts/?status=active&limit=5',
        '/fleet/scheduled-maintenance/?page=1',
        '/fleet/obd-devices/?page=1'
    ];

    for (const endpoint of fleetTests) {
        results.total++;
        const result = await testAPIEndpoint(endpoint);
        if (result.success) {
            results.passed++;
        } else {
            results.failed++;
            results.errors.push(`${endpoint}: ${result.status}`);
        }
    }

    // Test 4: User APIs
    console.log('\n👤 Testing User APIs...');
    const userTests = [
        '/users/users/me/',
        '/users/user_profile/',
        '/users/my-permissions/'
    ];

    for (const endpoint of userTests) {
        results.total++;
        const result = await testAPIEndpoint(endpoint);
        if (result.success) {
            results.passed++;
        } else {
            results.failed++;
            results.errors.push(`${endpoint}: ${result.status}`);
        }
    }

    // Test 5: Admin APIs (Expected 403)
    console.log('\n🔒 Testing Admin APIs (Expected 403)...');
    const adminTests = [
        '/fleet/dashcams/?page=1',
        '/fleet/dashcams/dashboard_stats/?date_range=today',
        '/fleet/analytics/',
        '/users/permissions/'
    ];

    for (const endpoint of adminTests) {
        results.total++;
        const result = await testAPIEndpoint(endpoint);
        if (result.status === 403) {
            results.passed++;
            console.log(`✅ Expected 403 for ${endpoint}`);
        } else if (result.success) {
            results.passed++;
            console.log(`✅ Admin access granted for ${endpoint}`);
        } else {
            results.failed++;
            results.errors.push(`${endpoint}: Unexpected status ${result.status}`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
    }

    return results;
}

// Auto-run the tests
console.log('🧪 Fleet Dashboard API Test Suite');
console.log('Run runAPITests() to start the tests, or they will auto-run in 2 seconds...');

setTimeout(() => {
    runAPITests();
}, 2000);

