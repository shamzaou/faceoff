import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testApiEndpoints() {
  console.log('Testing API endpoints...');
  
  try {
    console.log('\nTesting GET /api/events');
    const eventsResponse = await axios.get(`${BASE_URL}/events`);
    console.log(`Status: ${eventsResponse.status}`);
    console.log(`Found ${eventsResponse.data.length} events`);
    
    console.log('\nTesting GET /api/events/upcoming');
    const upcomingResponse = await axios.get(`${BASE_URL}/events/upcoming`);
    console.log(`Status: ${upcomingResponse.status}`);
    console.log(`Found ${upcomingResponse.data.length} upcoming events`);
    
    console.log('\nTesting GET /api/events/past');
    const pastResponse = await axios.get(`${BASE_URL}/events/past`);
    console.log(`Status: ${pastResponse.status}`);
    console.log(`Found ${pastResponse.data.length} past events`);
    
    console.log('\nAll API tests passed successfully!');
  } catch (error) {
    console.error('Error testing API:');
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure the server is running on port 3000.');
    } else if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testApiEndpoints(); 