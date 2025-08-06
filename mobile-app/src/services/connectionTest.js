import axios from 'axios';

// Test different backend URLs
const testUrls = [
  'http://localhost:5000/api',
  'http://127.0.0.1:5000/api',
  'http://10.0.2.2:5000/api', // Android emulator
  'http://192.168.1.100:5000/api', // Replace with your local IP
];

export const testBackendConnection = async () => {
  console.log('🔍 Testing backend connections...');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(`${url}/test`, { timeout: 5000 });
      console.log(`✅ Success: ${url} - Status: ${response.status}`);
      return url;
    } catch (error) {
      console.log(`❌ Failed: ${url} - ${error.message}`);
    }
  }
  
  console.log('❌ All backend URLs failed');
  return null;
};

// Test with dummy login
export const testLogin = async (baseUrl) => {
  try {
    const response = await axios.post(`${baseUrl}/auth/login`, {
      email: 'admin@haype.com',
      password: 'password'
    }, { timeout: 10000 });
    
    console.log('✅ Login test successful:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Login test failed:', error.response?.data || error.message);
    return false;
  }
};