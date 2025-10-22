// Configuration for API endpoints
// This file determines whether to use local or production API endpoints

const CONFIG = {
    // Set this to true for production (Render deployment)
    // Set this to false for local development
    IS_PRODUCTION: true,
    
    // Local development settings
    LOCAL_API_BASE: 'http://localhost:10000',
    
    // Production settings (Render)
    // Replace 'your-app-name' with your actual Render app name
    PRODUCTION_API_BASE: 'https://aisocial-aahn.onrender.com',
    
    // Get the appropriate API base URL
    getApiBaseUrl() {
        return this.IS_PRODUCTION ? this.PRODUCTION_API_BASE : this.LOCAL_API_BASE;
    },
    
    // Get full API endpoint
    getApiEndpoint(path) {
        return `${this.getApiBaseUrl()}${path}`;
    }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;