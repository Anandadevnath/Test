// Test file to check API connectivity
// This can be deleted after testing

const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test with a simple fetch first
    const response = await fetch('https://librarymanagement2.vercel.app/api/books', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data);
    } else {
      console.error('API Error:', response.statusText);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};

// Uncomment to test
// testApiConnection();

export default testApiConnection;
