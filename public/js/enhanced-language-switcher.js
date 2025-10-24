/**
 * Enhanced Language Switcher
 * Integrates with Enhanced Session Manager for robust session persistence
 */

class EnhancedLanguageSwitcher {
    constructor() {
        this.currentLanguage = 'ar'; // Default language
        this.isInitialized = false;
        this.sessionManager = window.enhancedSessionManager;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Wait for session manager to be ready
            if (!this.sessionManager) {
                await this.waitForSessionManager();
            }

            // Set up language switcher UI
            this.setupLanguageSwitcher();
            
            this.isInitialized = true;
            console.info('Enhanced Language Switcher initialized');
        } catch (error) {
            console.error('Failed to initialize Enhanced Language Switcher:', error);
        }
    }

    async waitForSessionManager(maxWait = 5000) {
        const startTime = Date.now();
        
        while (!window.enhancedSessionManager && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.sessionManager = window.enhancedSessionManager;
        
        if (!this.sessionManager) {
            throw new Error('Enhanced Session Manager not available');
        }
    }

    loadLanguagePreference() {
        try {
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage && this.isValidLanguage(savedLanguage)) {
                this.currentLanguage = savedLanguage;
            }
        } catch (error) {
            console.warn('Failed to load language preference:', error);
        }
    }

    isValidLanguage(lang) {
        const supportedLanguages = ['ar', 'en', 'fr', 'de', 'es', 'ru'];
        return supportedLanguages.includes(lang);
    }

    setupLanguageSwitcher() {
        const languageSelector = document.querySelector('.language-selector');
        if (!languageSelector) return;

        const selectedLanguage = languageSelector.querySelector('.selected-language');
        const languageOptions = languageSelector.querySelector('.language-options');

        if (selectedLanguage) {
            selectedLanguage.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                languageOptions?.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!languageSelector.contains(event.target)) {
                languageOptions?.classList.remove('show');
            }
        });

        // Handle language option clicks
        const options = languageOptions?.querySelectorAll('.language-option');
        options?.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const selectedLang = option.getAttribute('data-lang');
                if (selectedLang && this.isValidLanguage(selectedLang)) {
                    await this.changeLanguage(selectedLang);
                }
                
                languageOptions.classList.remove('show');
            });
        });
    }

    async changeLanguage(newLanguage) {
        if (newLanguage === this.currentLanguage) return;

        try {
            // Show loading indicator
            this.showLoadingIndicator();

            // Use session manager to preserve session during language change
            await this.sessionManager.preserveSessionDuring(async () => {
                // Apply the new language
                await this.applyLanguage(newLanguage, true);
                
                // Save language preference
                this.saveLanguagePreference(newLanguage);
                
                // Update current language
                this.currentLanguage = newLanguage;
            });

            console.info(`Language changed to: ${newLanguage}`);
        } catch (error) {
            console.error('Failed to change language:', error);
            this.showErrorMessage('Failed to change language. Please try again.');
        } finally {
            this.hideLoadingIndicator();
        }
    }

    async applyLanguage(language, animate = false) {
        try {
            // Set page direction
            this.setPageDirection(language);
            
            // Update language display
            this.updateLanguageDisplay(language);
            
            // Apply smooth transitions if requested
            if (animate) {
                document.body.style.transition = 'opacity 0.3s ease-in-out';
                document.body.style.opacity = '0.7';
            }

            // Update all translatable elements
            await this.updateAllLanguageElements(language);

            // Restore full opacity
            if (animate) {
                setTimeout(() => {
                    document.body.style.opacity = '1';
                    setTimeout(() => {
                        document.body.style.transition = '';
                    }, 300);
                }, 100);
            }
        } catch (error) {
            console.error('Error applying language:', error);
            throw error;
        }
    }

    setPageDirection(language) {
        const isRTL = language === 'ar';
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
    }

    updateLanguageDisplay(language) {
        const languageNames = {
            'ar': 'العربية',
            'en': 'English',
            'fr': 'Français',
            'de': 'Deutsch',
            'es': 'Español',
            'ru': 'Русский'
        };

        const selectedLanguageElement = document.querySelector('.selected-language span');
        if (selectedLanguageElement) {
            selectedLanguageElement.textContent = languageNames[language] || languageNames['ar'];
        }
    }

    async updateAllLanguageElements(language) {
        // Update different page types based on current page
        const currentPage = this.getCurrentPageType();
        
        switch (currentPage) {
            case 'login':
                this.updateLoginContent(language);
                break;
            case 'register':
                this.updateRegisterContent(language);
                break;
            case 'dashboard':
                this.updateDashboardContent(language);
                break;
            case 'ai-dashboard':
                this.updateAIDashboardContent(language);
                break;
            case 'analytics':
                this.updateAnalyticsContent(language);
                break;
            case 'autoresponse':
                this.updateAutoResponseContent(language);
                break;
            case 'trending':
                this.updateTrendingTopicsContent(language);
                break;
            default:
                this.updateCommonElements(language);
        }
    }

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

    updateCommonElements(language) {
        const translations = this.getCommonTranslations(language);
        
        // Update navigation elements
        this.updateElementsBySelector('.nav-link', translations.navigation || []);
        this.updateElementsBySelector('.footer-links a', translations.footer || []);
        
        // Update common buttons and labels
        this.updateElementBySelector('.btn-primary', translations.primaryButton);
        this.updateElementBySelector('.loading-text', translations.loading);
    }

    updateLoginContent(language) {
        const translations = this.getLoginTranslations(language);
        
        // Update form labels
        this.updateElementBySelector('label[for="username"]', translations.username);
        this.updateElementBySelector('label[for="password"]', translations.password);
        
        // Update input placeholders
        this.updateInputPlaceholder('#username', translations.username);
        this.updateInputPlaceholder('#password', translations.password);
        
        // Update buttons and text
        this.updateElementBySelector('#login-text', translations.loginButton);
        this.updateElementBySelector('#loading', `<i class="fas fa-spinner"></i> ${translations.loading}`);
        
        // Update links
        const links = document.querySelectorAll('.links a');
        const linkTexts = [translations.home, translations.createAccount, translations.forgotPassword];
        links.forEach((link, index) => {
            if (linkTexts[index]) {
                link.textContent = linkTexts[index];
            }
        });
    }

    updateDashboardContent(language) {
        const translations = this.getDashboardTranslations(language);
        
        // Update sidebar menu items
        const menuItems = document.querySelectorAll('.menu-item span');
        if (menuItems.length > 0 && translations.menuItems) {
            menuItems.forEach((item, index) => {
                if (index < translations.menuItems.length) {
                    item.textContent = translations.menuItems[index];
                }
            });
        }
        
        // Update dashboard cards
        const cardTitles = document.querySelectorAll('.card-title');
        if (cardTitles.length > 0 && translations.cardTitles) {
            cardTitles.forEach((title, index) => {
                if (index < translations.cardTitles.length) {
                    title.textContent = translations.cardTitles[index];
                }
            });
        }
        
        // Update section titles
        const sectionTitles = document.querySelectorAll('h2');
        if (sectionTitles.length > 0 && translations.sectionTitles) {
            sectionTitles.forEach((title, index) => {
                if (index < translations.sectionTitles.length) {
                    title.textContent = translations.sectionTitles[index];
                }
            });
        }
    }

    // Placeholder methods for other content types
    updateRegisterContent(language) {
        // Implementation for register page
        this.updateCommonElements(language);
    }

    updateAIDashboardContent(language) {
        // Implementation for AI dashboard
        this.updateCommonElements(language);
    }

    updateAnalyticsContent(language) {
        // Implementation for analytics page
        this.updateCommonElements(language);
    }

    updateAutoResponseContent(language) {
        // Implementation for auto-response page
        this.updateCommonElements(language);
    }

    updateTrendingTopicsContent(language) {
        // Implementation for trending topics page
        this.updateCommonElements(language);
    }

    // Helper methods
    updateElementBySelector(selector, text) {
        const element = document.querySelector(selector);
        if (element && text) {
            element.textContent = text;
        }
    }

    updateElementsBySelector(selector, texts) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            if (texts[index]) {
                element.textContent = texts[index];
            }
        });
    }

    updateInputPlaceholder(selector, placeholder) {
        const input = document.querySelector(selector);
        if (input && placeholder) {
            input.placeholder = placeholder;
        }
    }

    saveLanguagePreference(language) {
        try {
            localStorage.setItem('selectedLanguage', language);
        } catch (error) {
            console.warn('Failed to save language preference:', error);
        }
    }

    showLoadingIndicator() {
        // Create or show loading indicator
        let loader = document.querySelector('.language-loading');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'language-loading';
            loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            loader.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    }

    hideLoadingIndicator() {
        const loader = document.querySelector('.language-loading');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showErrorMessage(message) {
        // Show error message to user
        console.error(message);
        // You can implement a toast notification here
    }

    // Translation methods (simplified - you can expand these)
    getCommonTranslations(language) {
        const translations = {
            'en': {
                navigation: ['Home', 'Dashboard', 'Register'],
                footer: ['Home', 'Dashboard', 'Subscription', 'Payment'],
                primaryButton: 'Submit',
                loading: 'Loading...'
            },
            'ar': {
                navigation: ['الرئيسية', 'لوحة التحكم', 'تسجيل'],
                footer: ['الرئيسية', 'لوحة التحكم', 'الاشتراك', 'الدفع'],
                primaryButton: 'إرسال',
                loading: 'جاري التحميل...'
            }
            // Add other languages...
        };
        
        return translations[language] || translations['ar'];
    }

    getLoginTranslations(language) {
        const translations = {
            'en': {
                username: 'Username',
                password: 'Password',
                loginButton: 'Login',
                loading: 'Logging in...',
                home: 'Home',
                createAccount: 'Create Account',
                forgotPassword: 'Forgot Password?'
            },
            'ar': {
                username: 'اسم المستخدم',
                password: 'كلمة المرور',
                loginButton: 'تسجيل الدخول',
                loading: 'جاري تسجيل الدخول...',
                home: 'الرئيسية',
                createAccount: 'إنشاء حساب',
                forgotPassword: 'نسيت كلمة المرور؟'
            }
            // Add other languages...
        };
        
        return translations[language] || translations['ar'];
    }

    getDashboardTranslations(language) {
        const translations = {
            'en': {
                menuItems: ['Dashboard', 'Schedule', 'AI Tools', 'Analytics', 'Auto-Response', 'Settings', 'Logout'],
                cardTitles: ['Total Posts', 'Engagement', 'AI Suggestions', 'Scheduled Posts'],
                sectionTitles: ['Upcoming Posts', 'AI Post Generator', 'AI Assistant', 'AI Page Management Automation']
            },
            'ar': {
                menuItems: ['لوحة التحكم', 'جدولة', 'أدوات الذكاء الاصطناعي', 'تحليلات', 'الرد التلقائي', 'إعدادات', 'تسجيل الخروج'],
                cardTitles: ['إجمالي المنشورات', 'معدل التفاعل', 'اقتراحات الذكاء الاصطناعي', 'المنشورات المجدولة'],
                sectionTitles: ['المنشورات القادمة', 'مولد منشورات الذكاء الاصطناعي', 'المساعد الذكي', 'أتمتة إدارة الصفحة بالذكاء الاصطناعي']
            }
            // Add other languages...
        };
        
        return translations[language] || translations['ar'];
    }
}

    /**
     * Switch language with session preservation
     */
    async switchLanguage(newLanguage) {
        return await this.changeLanguage(newLanguage);
    }

    /**
     * Update UI elements based on current language
     */
    updateUI(language = null) {
        const targetLanguage = language || this.currentLanguage;
        this.updateAllLanguageElements(targetLanguage);
        this.updateLanguageDisplay(targetLanguage);
        this.setPageDirection(targetLanguage);
    }

    /**
     * Handle errors during language switching
     */
    handleError(error, context = 'language switching') {
        console.error(`Error during ${context}:`, error);
        
        // Show user-friendly error message
        this.showErrorMessage(`Failed during ${context}. Please try again.`);
        
        // Emit error event for external handling
        window.dispatchEvent(new CustomEvent('languageSwitchError', {
            detail: { error, context }
        }));
        
        // Try to recover by reverting to previous language
        if (context === 'language switching' && this.currentLanguage) {
            console.info('Attempting to recover by reverting to previous language');
            setTimeout(() => {
                this.updateUI(this.currentLanguage);
            }, 1000);
        }
    }

    /**
     * Update text direction based on language
     */
    updateTextDirection(language) {
        this.setPageDirection(language);
        
        // Update specific elements that need direction changes
        const directionalElements = document.querySelectorAll('.text-content, .form-group, .card-body');
        const isRTL = language === 'ar';
        
        directionalElements.forEach(element => {
            element.style.direction = isRTL ? 'rtl' : 'ltr';
            element.style.textAlign = isRTL ? 'right' : 'left';
        });
    }

    /**
     * Preserve session during language operations
     */
    async preserveSession() {
        if (this.sessionManager && this.sessionManager.preserveSessionDuring) {
            return await this.sessionManager.preserveSessionDuring(async () => {
                // Session is preserved during this operation
                return true;
            });
        }
        return true;
    }

    // Initialize the enhanced language switcher
window.enhancedLanguageSwitcher = new EnhancedLanguageSwitcher();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedLanguageSwitcher;
}