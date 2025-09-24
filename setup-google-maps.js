const fs = require('fs');
const path = require('path');

// Google Maps API Key
const apiKey = 'AIzaSyA7-xn4sjsIh8EJAG0nPjWFOO_QSj20iew';

// Environment file content
const envContent = `# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKey}

# Other environment variables
NEXT_PUBLIC_DEMO_USER_MAIL=testadmin
NEXT_PUBLIC_DEMO_USER_PASS=testadmin123
`;

// Write to .env.local
const envPath = path.join(__dirname, '.env.local');
fs.writeFileSync(envPath, envContent);

console.log('✅ Google Maps API key has been added to .env.local');
console.log('✅ Environment file created successfully');
console.log('✅ You can now run: npm run dev');
