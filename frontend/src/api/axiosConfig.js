import axios from 'axios';

// This is the address where our backend API lives (server location)
// Think of it like a phone number to call the server
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create an axios instance (a special tool to send requests to the API)
// Think of it like creating a pre-configured messenger
const axiosInstance = axios.create({
  // baseURL: The main address for all requests
  baseURL: API_BASE_URL,
  
  // headers: Extra information we send with each request
  // 'Content-Type: application/json' tells the server we're sending JSON data
  headers: {
    'Content-Type': 'application/json',
  },
  
  // timeout: Maximum time to wait for a response (10 seconds)
  // If the server doesn't respond in 10 seconds, consider it a failure
  timeout: 10000,
});

// This function handles ALL responses from the API
// It runs automatically after every request to the server
axiosInstance.interceptors.response.use(
  // If request is successful, just return the response as is
  (response) => response,
  
  // If request fails, show an error in the console
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Export this pre-configured messenger so other files can use it
export default axiosInstance;
