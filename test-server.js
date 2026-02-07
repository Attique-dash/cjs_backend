const http = require('http');

function testServer() {
  console.log('🔍 Testing server connection...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ Server responding!`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      
      // Test API health endpoint
      testApiHealth();
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Server not responding:', error.message);
    console.log('💡 Make sure server is running with: npm run dev');
  });
  
  req.on('timeout', () => {
    console.log('❌ Request timeout');
    req.destroy();
  });
  
  req.end();
}

function testApiHealth() {
  console.log('\n🔍 Testing API health endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ API Health responding!`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      
      console.log('\n🎉 Server is ready for Postman testing!');
      console.log('📋 Use the endpoints-list.md file for all API endpoints');
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ API Health not responding:', error.message);
  });
  
  req.on('timeout', () => {
    console.log('❌ API Health request timeout');
    req.destroy();
  });
  
  req.end();
}

testServer();
