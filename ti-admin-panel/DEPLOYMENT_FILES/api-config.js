// API Configuration for Live Admin Panel
// Copy this file to your live admin panel and replace the existing API configuration

const API_CONFIG = {
  baseURL: 'https://thrive-backend-final.eba-fxvg5pyf.us-east-1.elasticbeanstalk.com/api/admin',
  headers: {
    'X-Admin-Secret': 'thrive-admin-super-secret-2024',
    'Content-Type': 'application/json'
  }
};

// Export for use in other files
export default API_CONFIG;

// If using CommonJS, use this instead:
// module.exports = API_CONFIG;
