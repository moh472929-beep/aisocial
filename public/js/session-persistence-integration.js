/**
 * Session Persistence Integration
 * Replaces old session management with enhanced version across all pages
 */

class SessionPersistenceIntegration {
    constructor() {
        this.config = {
            enableEnhancedSession: true,
            enableEnhancedLanguage: true,
            debugMode: false,
            fallbackToOldSystem: true
        };
        
        this.isInitialized = false;
        this.enhancedSessionManager = null;
        this.enhancedLanguageSwitcher = null;
    }

    // Debug logging
    debugLog(message, ...args) {
        if (this.config.debugMode) {
            console.log('[Session Integration]', message, ...args);
        }
    }

    // Initialize enhanced systems
    initializeEnhancedSystems() {
        this.debugLog('Initializing enhanced systems...');

        try {
            // Wait for enhanced session manager to be available
            if (window.enhancedSessionManager) {
                this.debugLog('Enhanced Session Manager available');
                this.enhancedSessionManager = window.enhancedSessionManager;
                
                // Replace old SessionManager references
                this.replaceOldSessionManager();
                
                // Initialize enhanced language switcher if enabled
                if (this.config.enableEnhancedLanguage && window.enhancedLanguageSwitcher) {
                    this.debugLog('Enhanced Language Switcher available');
                    this.enhancedLanguageSwitcher = window.enhancedLanguageSwitcher;
                    this.replaceOldLanguageSwitcher();
                }
                
                // Set up page-specific integrations
                this.setupPageSpecificIntegrations();
                
                this.isInitialized = true;
                this.debugLog('Enhanced systems initialized successfully');
            } else {
                throw new Error('Enhanced Session Manager not available');
            }
        } catch (error) {
            console.error('Failed to initialize enhanced systems:', error);
            
            if (this.config.fallbackToOldSystem) {
                console.warn('Falling back to old session management system');
                this.initializeFallbackSystems();
            }
        }
    }

    // Set up language switching with session preservation
    setupLanguageSwitching() {
        this.debugLog('Setting up language switching with session preservation');
        
        if (this.enhancedLanguageSwitcher && this.enhancedSessionManager) {
            // Override language change to preserve session
            const originalChangeLanguage = this.enhancedLanguageSwitcher.changeLanguage;
            
            this.enhancedLanguageSwitcher.changeLanguage = async (newLanguage) => {
                return await this.enhancedSessionManager.preserveSessionDuring(async () => {
                    return await originalChangeLanguage.call(this.enhancedLanguageSwitcher, newLanguage);
                });
            };
            
            this.debugLog('Language switching with session preservation set up');
        }
    }

    // Set up session persistence across page operations
    setupSessionPersistence() {
        this.debugLog('Setting up session persistence');
        
        if (this.enhancedSessionManager) {
            // Set up automatic session validation
            this.enhancedSessionManager.validateSession();
            
            // Set up cross-tab synchronization
            window.addEventListener('storage', (event) => {
                if (['user', 'token', 'refreshToken'].includes(event.key)) {
                    this.debugLog('Session data changed in another tab, synchronizing...');
                    this.enhancedSessionManager.loadSessionFromStorage();
                }
            });
            
            this.debugLog('Session persistence set up');
        }
    }

    // Handle language switch with session preservation
    async handleLanguageSwitch(newLanguage) {
        this.debugLog('Handling language switch with session preservation:', newLanguage);
        
        try {
            if (this.enhancedSessionManager && this.enhancedLanguageSwitcher) {
                await this.enhancedSessionManager.preserveSessionDuring(async () => {
                    await this.enhancedLanguageSwitcher.switchLanguage(newLanguage);
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Language switch with session preservation failed:', error);
            return false;
        }
    }

    // Monitor session health
    monitorSessionHealth() {
        this.debugLog('Starting session health monitoring');
        
        if (this.enhancedSessionManager) {
            // Check session health every 30 seconds
            setInterval(() => {
                if (this.enhancedSessionManager.isAuthenticated()) {
                    this.enhancedSessionManager.validateSession(1).catch(error => {
                        console.warn('Session health check failed:', error);
                    });
                }
            }, 30000);
            
            this.debugLog('Session health monitoring started');
        }
    }

    // Replace old SessionManager with enhanced version
    replaceOldSessionManager() {
        const enhancedManager = this.enhancedSessionManager;
        
        // Create compatibility layer for old SessionManager API
        window.SessionManager = {
            validateSession: () => enhancedManager.validateSession(),
            clearSession: () => enhancedManager.clearSession(),
            getCurrentUser: () => enhancedManager.getCurrentUser(),
            getToken: () => enhancedManager.getToken(),
            isAuthenticated: () => enhancedManager.isAuthenticated(),
            logout: () => enhancedManager.logout(),
            
            // Additional methods for backward compatibility
            init: () => Promise.resolve(true),
            refreshUserData: () => enhancedManager.validateSession(),
            hasPermission: (permission) => {
                const user = enhancedManager.getCurrentUser();
                return user && user.subscription_type !== 'free';
            }
        };

        // Replace global sessionManager instance if it exists
        if (window.sessionManager) {
            window.sessionManager = window.SessionManager;
        }

        this.debugLog('Old SessionManager replaced with enhanced version');
    }

    // Replace old language switcher functionality
    replaceOldLanguageSwitcher() {
        // Disable old language switcher initialization
        const oldInitFunction = window.initializeLanguageSystem;
        if (oldInitFunction) {
            window.initializeLanguageSystem = function() {
                this.debugLog('Old language system initialization blocked');
                // Do nothing - enhanced version will handle it
            };
        }

        // Override old language change functions
        const oldUpdateFunction = window.updateAllLanguageElements;
        if (oldUpdateFunction) {
            window.updateAllLanguageElements = async function(language) {
                this.debugLog('Redirecting language update to enhanced system');
                if (window.enhancedLanguageSwitcher) {
                    await window.enhancedLanguageSwitcher.changeLanguage(language);
                } else {
                    // Fallback to old system
                    return oldUpdateFunction.call(this, language);
                }
            }.bind(this);
        }

        this.debugLog('Old language switcher replaced with enhanced version');
    }

    // Set up page-specific integrations
    setupPageSpecificIntegrations() {
        const currentPage = this.getCurrentPageType();
        this.debugLog('Setting up integrations for page:', currentPage);

        switch (currentPage) {
            case 'login':
                this.setupLoginPageIntegration();
                break;
            case 'dashboard':
                this.setupDashboardIntegration();
                break;
            case 'ai-dashboard':
                this.setupAIDashboardIntegration();
                break;
            case 'analytics':
                this.setupAnalyticsIntegration();
                break;
            case 'autoresponse':
                this.setupAutoResponseIntegration();
                break;
            case 'trending':
                this.setupTrendingTopicsIntegration();
                break;
            default:
                this.setupCommonIntegrations();
        }
    }

    // Get current page type
    getCurrentPageType() {
        const path = window.location.pathname.toLowerCase();
        
        if (path.includes('login')) return 'login';
        if (path.includes('register')) return 'register';
        if (path.includes('dashboard') && !path.includes('ai') && !path.includes('analytics') && !path.includes('autoresponse')) return 'dashboard';
        if (path.includes('ai-dashboard')) return 'ai-dashboard';
        if (path.includes('analytics')) return 'analytics';
        if (path.includes('autoresponse')) return 'autoresponse';
        if (path.includes('trending')) return 'trending';
        
        return 'common';
    }

    // Page-specific integration functions
    setupLoginPageIntegration() {
        this.debugLog('Setting up login page integration');
        
        // Override login form submission to use enhanced session manager
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            const originalSubmit = loginForm.onsubmit;
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                
                try {
                    // Use enhanced session manager for login
                    const result = await this.performEnhancedLogin(
                        document.getElementById('username').value,
                        document.getElementById('password').value
                    );
                    
                    if (result.success) {
                        // Check user subscription type for proper redirection
                        const userData = localStorage.getItem('user');
                        if (userData) {
                            try {
                                const user = JSON.parse(userData);
                                const userSubscription = user?.subscription || 'free';
                                console.log('Session Integration: User subscription type:', userSubscription);
                                
                                if (userSubscription === 'premium' || userSubscription === 'paid') {
                                    console.log('Session Integration: Premium user, redirecting to AI dashboard...');
                                    window.location.href = 'ai-dashboard.html';
                                } else {
                                    console.log('Session Integration: Free user, redirecting to regular dashboard...');
                                    window.location.href = 'dashboard.html';
                                }
                            } catch (e) {
                                console.log('Session Integration: Error parsing user data, redirecting to dashboard...');
                                window.location.href = 'dashboard.html';
                            }
                        } else {
                            console.log('Session Integration: No user data found, redirecting to dashboard...');
                            window.location.href = 'dashboard.html';
                        }
                    } else {
                        this.showLoginError(result.message);
                    }
                } catch (error) {
                    console.error('Enhanced login failed:', error);
                    
                    // Fallback to original login if available
                    if (originalSubmit && this.config.fallbackToOldSystem) {
                        return originalSubmit.call(this, e);
                    }
                    
                    this.showLoginError('Login failed. Please try again.');
                }
            };
        }
    }

    setupDashboardIntegration() {
        this.debugLog('Setting up dashboard integration');
        
        // Ensure session validation on dashboard load
        if (this.enhancedSessionManager) {
            this.enhancedSessionManager.validateSession().then(isValid => {
                if (!isValid) {
                    window.location.href = 'login.html';
                }
            });
        }
        
        // Set up logout links
        const logoutLinks = document.querySelectorAll('[href*="logout"], .logout-link, #logout-link');
        logoutLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.enhancedSessionManager.logout();
            });
        });
    }

    setupAIDashboardIntegration() {
        this.debugLog('Setting up AI dashboard integration');
        this.setupDashboardIntegration(); // Common dashboard functionality
    }

    setupAnalyticsIntegration() {
        this.debugLog('Setting up analytics integration');
        this.setupDashboardIntegration(); // Common dashboard functionality
    }

    setupAutoResponseIntegration() {
        this.debugLog('Setting up auto-response integration');
        this.setupDashboardIntegration(); // Common dashboard functionality
    }

    setupTrendingTopicsIntegration() {
        this.debugLog('Setting up trending topics integration');
        this.setupDashboardIntegration(); // Common dashboard functionality
    }

    setupCommonIntegrations() {
        this.debugLog('Setting up common integrations');
        
        // Set up common logout functionality
        const logoutLinks = document.querySelectorAll('[href*="logout"], .logout-link');
        logoutLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                if (this.enhancedSessionManager) {
                    await this.enhancedSessionManager.logout();
                }
            });
        });
    }

    // Enhanced login function
    async performEnhancedLogin(username, password) {
        try {
            const response = await fetch(CONFIG.getApiEndpoint('/api/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store session data using enhanced session manager
                this.enhancedSessionManager.sessionData = {
                    user: JSON.stringify(data.user),
                    token: data.token,
                    refreshToken: data.refreshToken
                };
                
                this.enhancedSessionManager.saveToStorage();
                
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Show login error
    showLoginError(message) {
        const errorElement = document.querySelector('.error-message') || 
                           document.querySelector('.alert-danger') ||
                           document.getElementById('error-message');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            alert(message); // Fallback
        }
    }

    // Initialize fallback systems
    initializeFallbackSystems() {
        this.debugLog('Initializing fallback systems');
        
        // Re-enable old systems if enhanced versions fail
        if (window.initializeLanguageSystem) {
            window.initializeLanguageSystem();
        }
        
        // Initialize old session manager if available
        if (window.SessionManager && window.SessionManager.init) {
            window.SessionManager.init();
        }
    }

    // Wait for required scripts to load
    waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                const hasEnhancedSession = !!window.enhancedSessionManager;
                const hasEnhancedLanguage = !this.config.enableEnhancedLanguage || !!window.enhancedLanguageSwitcher;
                
                if (hasEnhancedSession && hasEnhancedLanguage) {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            
            checkDependencies();
        });
    }

    // Initialize the integration
    async initialize() {
        await this.waitForDependencies();
        this.initializeEnhancedSystems();
        this.setupLanguageSwitching();
        this.setupSessionPersistence();
        this.monitorSessionHealth();
    }
}

// Create global instance
const sessionPersistenceIntegration = new SessionPersistenceIntegration();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        sessionPersistenceIntegration.initialize();
    });
} else {
    sessionPersistenceIntegration.initialize();
}

// Export for debugging and external access
window.sessionPersistenceIntegration = sessionPersistenceIntegration;
window.SessionPersistenceIntegration = SessionPersistenceIntegration;