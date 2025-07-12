// Configuration for different environments
const CONFIG = {
  // Development environment (local)
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    FRONTEND_URL: 'http://localhost:3000'
  },
  
  // Production environment (GitHub Pages + Backend)
  production: {
    API_BASE_URL: 'https://your-backend-url.com/api', // Replace with your backend URL
    FRONTEND_URL: 'https://yourusername.github.io/rewear' // Replace with your GitHub Pages URL
  }
};

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const currentConfig = isDevelopment ? CONFIG.development : CONFIG.production;

// Export configuration
window.APP_CONFIG = currentConfig; 