/**
 * Enhanced Session Manager
 * Provides robust session persistence across language changes and other operations
 */

class EnhancedSessionManager {
    constructor() {
        this.isLocked = false;
        this.sessionData = {
            user: null,
            token: null,
            refreshToken: null
        };
        this.storageKeys = ['user', 'token', 'refreshToken'];
        this.heartbeatInterval = null;
        this.validationInProgress = false;
        
        // Initialize session state
        this.loadSessionFromStorage();
        this.startHeartbeat();
        
        // Listen for storage events (tab synchronization)
        window.addEventListener('storage', this.handleStorageChange.bind(this));
        
        // Listen for beforeunload to save session state
        window.addEventListener('beforeunload', this.saveSessionState.bind(this));
    }

    /**
     * Lock session state during critical operations
     */
    async lockSession() {
        while (this.isLocked) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.isLocked = true;
    }

    /**
     * Unlock session state
     */
    unlockSession() {
        this.isLocked = false;
    }

    /**
     * Load session data from multiple storage sources
     */
    loadSessionFromStorage() {
        try {
            // Primary storage: localStorage
            this.sessionData.user = localStorage.getItem('user');
            this.sessionData.token = localStorage.getItem('token');
            this.sessionData.refreshToken = localStorage.getItem('refreshToken');

            // Backup storage: sessionStorage (fallback)
            if (!this.sessionData.token && sessionStorage.getItem('token')) {
                this.sessionData.token = sessionStorage.getItem('token');
                this.sessionData.user = sessionStorage.getItem('user');
                this.sessionData.refreshToken = sessionStorage.getItem('refreshToken');
                
                // Restore to localStorage
                this.saveToStorage();
            }

            // Validate data integrity
            this.validateSessionData();
        } catch (error) {
            console.error('Error loading session from storage:', error);
            this.clearSession();
        }
    }

    /**
     * Save session data to multiple storage locations
     */
    saveToStorage() {
        try {
            // Save to localStorage (primary)
            if (this.sessionData.user) localStorage.setItem('user', this.sessionData.user);
            if (this.sessionData.token) localStorage.setItem('token', this.sessionData.token);
            if (this.sessionData.refreshToken) localStorage.setItem('refreshToken', this.sessionData.refreshToken);

            // Save to sessionStorage (backup)
            if (this.sessionData.user) sessionStorage.setItem('user', this.sessionData.user);
            if (this.sessionData.token) sessionStorage.setItem('token', this.sessionData.token);
            if (this.sessionData.refreshToken) sessionStorage.setItem('refreshToken', this.sessionData.refreshToken);

            // Save timestamp for validation
            const timestamp = Date.now().toString();
            localStorage.setItem('sessionTimestamp', timestamp);
            sessionStorage.setItem('sessionTimestamp', timestamp);
        } catch (error) {
            console.error('Error saving session to storage:', error);
        }
    }

    /**
     * Validate session data integrity
     */
    validateSessionData() {
        try {
            // Check if user data is valid JSON
            if (this.sessionData.user) {
                JSON.parse(this.sessionData.user);
            }
            
            // Check token format (basic validation)
            if (this.sessionData.token && this.sessionData.token.length < 10) {
                throw new Error('Invalid token format');
            }
            
            return true;
        } catch (error) {
            console.error('Session data validation failed:', error);
            this.clearSession();
            return false;
        }
    }

    /**
     * Preserve session state during critical operations (like language changes)
     */
    async preserveSessionDuring(operation) {
        await this.lockSession();
        
        try {
            // Create deep backup of current session
            const backup = {
                user: this.sessionData.user,
                token: this.sessionData.token,
                refreshToken: this.sessionData.refreshToken,
                timestamp: Date.now()
            };

            // Execute the operation
            const result = await operation();

            // Verify session integrity after operation
            this.loadSessionFromStorage();
            
            // If session was lost, restore from backup
            if (!this.sessionData.token && backup.token) {
                console.warn('Session lost during operation, restoring from backup');
                this.sessionData = {
                    user: backup.user,
                    token: backup.token,
                    refreshToken: backup.refreshToken
                };
                this.saveToStorage();
            }

            return result;
        } catch (error) {
            console.error('Error during preserved operation:', error);
            throw error;
        } finally {
            this.unlockSession();
        }
    }

    /**
     * Enhanced session validation with retry logic
     */
    async validateSession(retries = 3) {
        if (this.validationInProgress) {
            return false;
        }

        this.validationInProgress = true;

        try {
            if (!this.sessionData.token) {
                return false;
            }

            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    const response = await fetch(CONFIG.getApiEndpoint('/api/auth/profile'), {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${this.sessionData.token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        
                        // Update session with fresh data
                        this.sessionData.user = JSON.stringify({
                            id: userData.id,
                            username: userData.username,
                            email: userData.email,
                            subscription_type: userData.subscription_type
                        });
                        
                        this.saveToStorage();
                        return true;
                    } else if (response.status === 401) {
                        // Token expired, try to refresh
                        if (this.sessionData.refreshToken && attempt === 1) {
                            const refreshed = await this.refreshToken();
                            if (refreshed) continue;
                        }
                        
                        this.clearSession();
                        return false;
                    }
                } catch (error) {
                    console.warn(`Session validation attempt ${attempt} failed:`, error);
                    
                    if (attempt === retries) {
                        // Use cached user data if available
                        if (this.sessionData.user) {
                            console.info('Using cached user data due to network issues');
                            return true;
                        }
                        return false;
                    }
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }

            return false;
        } finally {
            this.validationInProgress = false;
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        if (!this.sessionData.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(CONFIG.getApiEndpoint('/api/auth/refresh'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.sessionData.refreshToken
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.sessionData.token = data.token;
                if (data.refreshToken) {
                    this.sessionData.refreshToken = data.refreshToken;
                }
                this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        return false;
    }

    /**
     * Start session heartbeat to maintain session validity
     */
    startHeartbeat() {
        // Clear existing heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Start new heartbeat every 5 minutes
        this.heartbeatInterval = setInterval(async () => {
            if (this.sessionData.token && !this.isLocked) {
                await this.validateSession(1); // Single attempt for heartbeat
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Handle storage changes from other tabs
     */
    handleStorageChange(event) {
        if (this.storageKeys.includes(event.key)) {
            console.info('Session data changed in another tab, synchronizing...');
            this.loadSessionFromStorage();
        }
    }

    /**
     * Save session state before page unload
     */
    saveSessionState() {
        if (this.sessionData.token) {
            this.saveToStorage();
        }
    }

    /**
     * Clear all session data
     */
    clearSession() {
        this.sessionData = {
            user: null,
            token: null,
            refreshToken: null
        };

        // Clear from all storage locations
        this.storageKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        localStorage.removeItem('sessionTimestamp');
        sessionStorage.removeItem('sessionTimestamp');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.sessionData.token;
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        if (this.sessionData.user) {
            try {
                return JSON.parse(this.sessionData.user);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Get current token
     */
    getToken() {
        return this.sessionData.token;
    }

    /**
     * Logout user
     */
    async logout() {
        await this.lockSession();
        
        try {
            // Notify server about logout
            if (this.sessionData.token) {
                try {
                    await fetch(CONFIG.getApiEndpoint('/api/auth/logout'), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.sessionData.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.warn('Server logout notification failed:', error);
                }
            }

            this.clearSession();
            
            // Stop heartbeat
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }

            // Redirect to login
            window.location.href = 'login.html';
        } finally {
            this.unlockSession();
        }
    }

    /**
     * Restore session state from backup or storage
     */
    restoreSessionState(backupData = null) {
        try {
            if (backupData) {
                // Restore from provided backup
                this.sessionData = {
                    user: backupData.user,
                    token: backupData.token,
                    refreshToken: backupData.refreshToken
                };
                this.saveToStorage();
                console.info('Session restored from backup data');
                return true;
            } else {
                // Restore from storage
                this.loadSessionFromStorage();
                console.info('Session restored from storage');
                return this.isAuthenticated();
            }
        } catch (error) {
            console.error('Failed to restore session state:', error);
            this.handleSessionError(error);
            return false;
        }
    }

    /**
     * Handle session-related errors
     */
    handleSessionError(error, context = 'unknown') {
        console.error(`Session error in ${context}:`, error);
        
        // Log error details for debugging
        const errorInfo = {
            message: error.message || 'Unknown error',
            context: context,
            timestamp: new Date().toISOString(),
            sessionState: {
                hasToken: !!this.sessionData.token,
                hasUser: !!this.sessionData.user,
                isLocked: this.isLocked
            }
        };
        
        console.warn('Session error details:', errorInfo);
        
        // Handle specific error types
        if (error.message && error.message.includes('401')) {
            // Unauthorized - clear session
            this.clearSession();
        } else if (error.message && error.message.includes('network')) {
            // Network error - keep session but mark as offline
            console.info('Network error detected, maintaining session for offline use');
        } else if (error.message && error.message.includes('storage')) {
            // Storage error - try alternative storage
            console.warn('Storage error, attempting recovery');
            try {
                this.loadSessionFromStorage();
            } catch (recoveryError) {
                console.error('Session recovery failed:', recoveryError);
                this.clearSession();
            }
        }
        
        // Emit custom event for error handling
        window.dispatchEvent(new CustomEvent('sessionError', {
            detail: errorInfo
        }));
    }

    /**
     * Check if session is currently locked
     */
    isSessionLocked() {
        return this.isLocked;
    }

    /**
     * Destroy the session manager
     */
    destroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        window.removeEventListener('storage', this.handleStorageChange.bind(this));
        window.removeEventListener('beforeunload', this.saveSessionState.bind(this));
    }
}

// Create global instance
window.enhancedSessionManager = new EnhancedSessionManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSessionManager;
}