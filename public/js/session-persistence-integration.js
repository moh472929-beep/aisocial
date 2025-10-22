/**
 * Session Persistence Integration
 * Replaces old session management with enhanced version across all pages
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        enableEnhancedSession: true,
        enableEnhancedLanguage: true,
        debugMode: false,
        fallbackToOldSystem: true
    };

    // Debug logging
    function debugLog(message, ...args) {
        if (CONFIG.debugMode) {
            console.log('[Session Integration]', message, ...args);
        }
    }

    // Initialize enhanced systems
    function initializeEnhancedSystems() {
        debugLog('Initializing enhanced systems...');

        try {
            // Wait for enhanced session manager to be available
            if (window.enhancedSessionManager) {
                debugLog('Enhanced Session Manager available');
                
                // Replace old SessionManager references
                replaceOldSessionManager();
                
                // Initialize enhanced language switcher if enabled
                if (CONFIG.enableEnhancedLanguage && window.enhancedLanguageSwitcher) {
                    debugLog('Enhanced Language Switcher available');
                    replaceOldLanguageSwitcher();
                }
                
                // Set up page-specific integrations
                setupPageSpecificIntegrations();
                
                debugLog('Enhanced systems initialized successfully');
            } else {
                throw new Error('Enhanced Session Manager not available');
            }
        } catch (error) {
            console.error('Failed to initialize enhanced systems:', error);
            
            if (CONFIG.fallbackToOldSystem) {
                console.warn('Falling back to old session management system');
                initializeFallbackSystems();
            }
        }
    }

    // Replace old SessionManager with enhanced version
    function replaceOldSessionManager() {
        const enhancedManager = window.enhancedSessionManager;
        
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

        debugLog('Old SessionManager replaced with enhanced version');
    }

    // Replace old language switcher functionality
    function replaceOldLanguageSwitcher() {
        // Disable old language switcher initialization
        const oldInitFunction = window.initializeLanguageSystem;
        if (oldInitFunction) {
            window.initializeLanguageSystem = function() {
                debugLog('Old language system initialization blocked');
                // Do nothing - enhanced version will handle it
            };
        }

        // Override old language change functions
        const oldUpdateFunction = window.updateAllLanguageElements;
        if (oldUpdateFunction) {
            window.updateAllLanguageElements = async function(language) {
                debugLog('Redirecting language update to enhanced system');
                if (window.enhancedLanguageSwitcher) {
                    await window.enhancedLanguageSwitcher.changeLanguage(language);
                } else {
                    // Fallback to old system
                    return oldUpdateFunction.call(this, language);
                }
            };
        }

        debugLog('Old language switcher replaced with enhanced version');
    }

    // Set up page-specific integrations
    function setupPageSpecificIntegrations() {
        const currentPage = getCurrentPageType();
        debugLog('Setting up integrations for page:', currentPage);

        switch (currentPage) {
            case 'login':
                setupLoginPageIntegration();
                break;
            case 'dashboard':
                setupDashboardIntegration();
                break;
            case 'ai-dashboard':
                setupAIDashboardIntegration();
                break;
            case 'analytics':
                setupAnalyticsIntegration();
                break;
            case 'autoresponse':
                setupAutoResponseIntegration();
                break;
            case 'trending':
                setupTrendingTopicsIntegration();
                break;
            default:
                setupCommonIntegrations();
        }
    }

    // Get current page type
    function getCurrentPageType() {
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
    function setupLoginPageIntegration() {
        debugLog('Setting up login page integration');
        
        // Override login form submission to use enhanced session manager
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            const originalSubmit = loginForm.onsubmit;
            loginForm.onsubmit = async function(e) {
                e.preventDefault();
                
                try {
                    // Use enhanced session manager for login
                    const result = await performEnhancedLogin(
                        document.getElementById('username').value,
                        document.getElementById('password').value
                    );
                    
                    if (result.success) {
                        window.location.href = 'dashboard.html';
                    } else {
                        showLoginError(result.message);
                    }
                } catch (error) {
                    console.error('Enhanced login failed:', error);
                    
                    // Fallback to original login if available
                    if (originalSubmit && CONFIG.fallbackToOldSystem) {
                        return originalSubmit.call(this, e);
                    }
                    
                    showLoginError('Login failed. Please try again.');
                }
            };
        }
    }

    function setupDashboardIntegration() {
        debugLog('Setting up dashboard integration');
        
        // Ensure session validation on dashboard load
        if (window.enhancedSessionManager) {
            window.enhancedSessionManager.validateSession().then(isValid => {
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
                await window.enhancedSessionManager.logout();
            });
        });
    }

    function setupAIDashboardIntegration() {
        debugLog('Setting up AI dashboard integration');
        setupDashboardIntegration(); // Common dashboard functionality
    }

    function setupAnalyticsIntegration() {
        debugLog('Setting up analytics integration');
        setupDashboardIntegration(); // Common dashboard functionality
    }

    function setupAutoResponseIntegration() {
        debugLog('Setting up auto-response integration');
        setupDashboardIntegration(); // Common dashboard functionality
    }

    function setupTrendingTopicsIntegration() {
        debugLog('Setting up trending topics integration');
        setupDashboardIntegration(); // Common dashboard functionality
    }

    function setupCommonIntegrations() {
        debugLog('Setting up common integrations');
        
        // Set up common logout functionality
        const logoutLinks = document.querySelectorAll('[href*="logout"], .logout-link');
        logoutLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                if (window.enhancedSessionManager) {
                    await window.enhancedSessionManager.logout();
                }
            });
        });
    }

    // Enhanced login function
    async function performEnhancedLogin(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store session data using enhanced session manager
                window.enhancedSessionManager.sessionData = {
                    user: JSON.stringify(data.user),
                    token: data.token,
                    refreshToken: data.refreshToken
                };
                
                window.enhancedSessionManager.saveToStorage();
                
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
    function showLoginError(message) {
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
    function initializeFallbackSystems() {
        debugLog('Initializing fallback systems');
        
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
    function waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                const hasEnhancedSession = !!window.enhancedSessionManager;
                const hasEnhancedLanguage = !CONFIG.enableEnhancedLanguage || !!window.enhancedLanguageSwitcher;
                
                if (hasEnhancedSession && hasEnhancedLanguage) {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            
            checkDependencies();
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await waitForDependencies();
            initializeEnhancedSystems();
        });
    } else {
        waitForDependencies().then(initializeEnhancedSystems);
    }

    // Export for debugging
    window.sessionIntegration = {
        config: CONFIG,
        reinitialize: initializeEnhancedSystems,
        debugMode: (enabled) => { CONFIG.debugMode = enabled; }
    };

})();