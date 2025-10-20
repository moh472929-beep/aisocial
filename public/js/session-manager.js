// Session Management Utility
// Provides consistent session handling across all protected pages

class SessionManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
    }

    // Validate session with backend
    async validateSession() {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        // If no token or user data, session is invalid
        if (!token || !storedUser) {
            console.log('No valid session found');
            return false;
        }
        
        try {
            // Parse stored user data
            this.currentUser = JSON.parse(storedUser);
            
            // Validate token with backend
            const response = await fetch('/.netlify/functions/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    // Update currentUser with fresh data from backend
                    this.currentUser = data.user;
                    localStorage.setItem('user', JSON.stringify(this.currentUser));
                    console.log('Session validated successfully');
                    return true;
                }
            }
            
            // Token is invalid or expired
            console.log('Session validation failed');
            return false;
            
        } catch (error) {
            console.error('Session validation error:', error);
            // On network error, use cached user data if available
            if (this.currentUser) {
                console.log('Using cached user data due to network error');
                return true;
            }
            
            return false;
        }
    }

    // Clear all session data
    clearSession() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this.currentUser = null;
        this.isInitialized = false;
        console.log('Session cleared');
    }

    // Redirect to login page
    redirectToLogin() {
        // Prevent infinite redirects
        if (window.location.pathname.includes('login') || 
            window.location.pathname.includes('index') ||
            window.location.pathname === '/') {
            return;
        }
        
        console.log('Redirecting to login page');
        window.location.href = 'login.html';
    }

    // Initialize session for protected pages
    async initializeSession() {
        console.log('Initializing session...');
        
        const isValidSession = await this.validateSession();
        
        if (isValidSession) {
            this.isInitialized = true;
            console.log('Session initialized successfully');
            return true;
        } else {
            this.clearSession();
            this.redirectToLogin();
            return false;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.isInitialized && this.currentUser !== null;
    }

    // Logout user
    logout() {
        console.log('Logging out user...');
        this.clearSession();
        this.redirectToLogin();
    }

    // Refresh user data from backend
    async refreshUserData() {
        if (!this.isAuthenticated()) {
            return false;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        try {
            const response = await fetch('/.netlify/functions/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    this.currentUser = data.user;
                    localStorage.setItem('user', JSON.stringify(this.currentUser));
                    return true;
                }
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }

        return false;
    }

    // Check if user has specific permission
    hasPermission(permission) {
        if (!this.isAuthenticated()) {
            return false;
        }

        // Add permission checking logic based on your user model
        switch (permission) {
            case 'ai_enabled':
                return this.currentUser.aiEnabled === true;
            case 'premium':
                return this.currentUser.subscription === 'premium' || this.currentUser.subscription === 'paid';
            default:
                return true;
        }
    }
}

// Create global session manager instance
window.sessionManager = new SessionManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}