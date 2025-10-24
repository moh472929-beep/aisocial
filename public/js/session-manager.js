// Session Management Utility
// Provides consistent session handling across all protected pages

class SessionManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // Validate session with backend
    async validateSession() {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('SessionManager: Starting validation...', {
            hasToken: !!token,
            hasStoredUser: !!storedUser,
            tokenLength: token ? token.length : 0,
            environment: CONFIG.IS_PRODUCTION ? 'production' : 'development',
            apiBaseUrl: CONFIG.getApiBaseUrl()
        });
        
        // Require only the token; user will be refreshed from backend
        if (!token) {
            console.log('SessionManager: No token found in localStorage');
            return false;
        }

        // If we have cached user data, use it temporarily while validating
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                console.log('SessionManager: Using cached user data during validation');
            } catch (e) {
                console.warn('SessionManager: Failed to parse cached user data:', e);
            }
        }
        
        try {
            // Always validate with backend and refresh user data
            const apiEndpoint = CONFIG.getApiEndpoint('/api/auth/profile');
            console.log('SessionManager: Calling API endpoint:', apiEndpoint);
            
            // Use enhanced fetch with retry logic and timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await CONFIG.fetchWithRetry(apiEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                cache: 'no-cache',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log('SessionManager: API response status:', response.status);
            
            if (response.ok) {
                let data;
                try {
                    const responseText = await response.text();
                    data = responseText ? JSON.parse(responseText) : {};
                } catch (parseError) {
                    console.error('SessionManager: Failed to parse response:', parseError);
                    // If we have cached user, continue with it
                    if (this.currentUser) {
                        console.log('SessionManager: Using cached user due to parse error');
                        return true;
                    }
                    return false;
                }
                
                console.log('SessionManager: API response data:', {
                    success: data.success,
                    hasUser: !!data.user,
                    userEmail: data.user?.email
                });
                
                if (data.success && data.user) {
                    // Sanitize and persist minimal user fields to avoid stale/huge objects
                    const userSafe = {
                        userId: data.user.userId || data.user._id || data.user.id,
                        email: data.user.email,
                        fullName: data.user.fullName || data.user.name,
                        subscription: data.user.subscription,
                        postsRemaining: data.user.postsRemaining || 0
                    };
                    this.currentUser = { ...data.user, ...userSafe };
                    localStorage.setItem('user', JSON.stringify(this.currentUser));
                    console.log('SessionManager: Session validated and user refreshed successfully');
                    return true;
                } else {
                    console.log('SessionManager: API response invalid - missing success or user');
                    // If response is invalid but we have cached user, use it
                    if (this.currentUser) {
                        console.log('SessionManager: Using cached user due to invalid API response');
                        return true;
                    }
                }
            } else if (response.status === 401 || response.status === 403) {
                // Only clear session on explicit authentication errors
                console.log('SessionManager: Authentication failed, token is invalid');
                return false;
            } else {
                console.log('SessionManager: API response not OK, status:', response.status);
                // For other errors (500, network issues), use cached user if available
                if (this.currentUser) {
                    console.log('SessionManager: Using cached user due to server error');
                    return true;
                }
            }
            
            // Token invalid or expired only if we got explicit auth error
            console.log('SessionManager: Session validation failed');
            return false;
            
        } catch (error) {
            console.error('SessionManager: Session validation error:', error);
            
            // On network error or timeout, use cached user if available
            if (this.currentUser || storedUser) {
                if (!this.currentUser && storedUser) {
                    try {
                        this.currentUser = JSON.parse(storedUser);
                    } catch (e) {
                        console.warn('SessionManager: Cached user parse failed:', e);
                        return false;
                    }
                }
                console.log('SessionManager: Using cached user due to network error');
                return true;
            }
            
            // If no cached data and network error, fail validation
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
            // Use environment-appropriate endpoint
            const apiEndpoint = CONFIG.getApiEndpoint('/api/auth/profile');
            
            const response = await fetch(apiEndpoint, {
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