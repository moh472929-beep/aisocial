// Configuration for API endpoints
// This file determines whether to use local or production API endpoints

const CONFIG = {
    // Automatically detect environment based on hostname
    IS_PRODUCTION: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    
    // Local development settings
    LOCAL_API_BASE: 'http://localhost:10000',
    
    // Production settings (Render)
    PRODUCTION_API_BASE: 'https://aisocial-aahn.onrender.com',
    
    // Request timeout settings
    REQUEST_TIMEOUT: 30000, // 30 seconds
    
    // Retry settings
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // Get the appropriate API base URL
    getApiBaseUrl() {
        return this.IS_PRODUCTION ? this.PRODUCTION_API_BASE : this.LOCAL_API_BASE;
    },
    
    // Get full API endpoint
    getApiEndpoint(path) {
        const baseUrl = this.getApiBaseUrl();
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    },
    
    // Enhanced fetch with retry logic and timeout
    async fetchWithRetry(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
        
        const fetchOptions = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        let lastError;
        
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(url, fetchOptions);
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                lastError = error;
                console.warn(`Fetch attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
                }
            }
        }
        
        clearTimeout(timeoutId);
        throw lastError;
    }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;

// Log current configuration
console.log('🔧 CONFIG initialized:', {
    isProduction: CONFIG.IS_PRODUCTION,
    apiBaseUrl: CONFIG.getApiBaseUrl(),
    hostname: window.location.hostname
});