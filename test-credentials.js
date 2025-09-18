const axios = require('axios');

async function testCredentials() {
  const baseURL = 'https://oem.platform-api-test.joulepoint.com/api';
  
  const credentials = [
    { username: 'testadmin', password: 'testadmin123' },
    { username: 'oemadmin', password: 'oemadmin123' }
  ];

  for (const cred of credentials) {
    try {
      console.log(`\n🔐 Testing credentials: ${cred.username}`);
      
      const response = await axios.post(`${baseURL}/users/login_with_password/`, {
        username: cred.username,
        password: cred.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Login successful!');
      console.log('Response status:', response.status);
      console.log('User data:', JSON.stringify(response.data, null, 2));
      
      // Test getCurrentUser if we have a token
      if (response.data.access_token) {
        try {
          const userResponse = await axios.get(`${baseURL}/users/users/me/`, {
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`
            },
            timeout: 10000
          });
          console.log('✅ getCurrentUser successful!');
          console.log('Current user:', JSON.stringify(userResponse.data, null, 2));
        } catch (userError) {
          console.log('❌ getCurrentUser failed:', userError.response?.data || userError.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('Error:', error.response?.data || error.message);
    }
  }
}

testCredentials().catch(console.error);
