// Language Switcher Functionality
document.addEventListener('DOMContentLoaded', function() {
    // CRITICAL: Check if we're on a protected page and wait for session validation
    const isProtectedPage = window.location.pathname.includes('dashboard') || 
                           window.location.pathname.includes('ai-dashboard') ||
                           window.location.pathname.includes('analytics') ||
                           window.location.pathname.includes('autoresponse');
    
    if (isProtectedPage) {
        // For protected pages, delay language initialization to allow session validation first
        console.log('Language Switcher: Detected protected page, waiting for session validation...');
        setTimeout(() => {
            initializeLanguageSystem();
        }, 50); // Reduced delay to minimize language switching issues
    } else {
        // For public pages, initialize immediately
        initializeLanguageSystem();
    }
});

function initializeLanguageSystem() {
    // Prevent duplicate initialization
    if (window.languageSystemInitialized) {
        console.log('Language Switcher: Already initialized, skipping...');
        return;
    }
    
    console.log('Language Switcher: Initializing language system...');
    window.languageSystemInitialized = true;
    
    // Load saved language preference immediately
    const savedLang = localStorage.getItem('preferredLanguage') || 'ar';
    
    // Apply saved language to page direction
    if (savedLang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
    } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = savedLang;
    }
    
    const languageSelector = document.querySelector('.language-selector');
    const selectedLanguage = document.querySelector('.selected-language');
    const languageDropdown = document.querySelector('.language-dropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    
    if (!languageSelector || !selectedLanguage || !languageDropdown) {
        console.warn('Language switcher elements not found');
        return;
    }
    
    // Load saved language preference
    loadSavedLanguage();
    
    // Toggle dropdown
    selectedLanguage.addEventListener('click', function(e) {
        e.stopPropagation();
        const currentDisplay = window.getComputedStyle(languageDropdown).display;
        languageDropdown.style.display = (currentDisplay === 'none') ? 'block' : 'none';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (languageSelector && !languageSelector.contains(event.target)) {
            languageDropdown.style.display = 'none';
        }
    });
    
    // Language selection
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const lang = this.getAttribute('data-lang');
            
            // Update all language elements with smooth transition
            updateAllLanguageElements(lang);
            
            // Close dropdown
            languageDropdown.style.display = 'none';
        });
    });
    
    // Load saved language preference
    function loadSavedLanguage() {
        const savedLang = localStorage.getItem('preferredLanguage') || 'ar';
        updateAllLanguageElements(savedLang);
    }
    
    // Update all language elements with smooth transitions
    function updateAllLanguageElements(lang) {
        console.log('Language Switcher: Updating language elements to:', lang);
        
        // CRITICAL: Preserve authentication data during language change
        const authData = {
            user: localStorage.getItem('user'),
            token: localStorage.getItem('token'),
            refreshToken: localStorage.getItem('refreshToken')
        };
        
        // Add transition effect to all text elements
        const allTextElements = document.querySelectorAll('h1, h2, h3, h4, p, span, div, a, label, button, li, option, select, textarea');
        allTextElements.forEach(element => {
            element.style.transition = 'all 0.3s ease';
        });
        
        // Update selected language display
        updateLanguageDisplay(lang);
        
        // Save language preference
        saveLanguagePreference(lang);
        
        // Update page direction based on language
        updatePageDirection(lang);
        
        // Update all elements with data-translate attribute
        updateTranslatableElements(lang);
        
        // Update page text content using global function if available
        if (typeof updateMainContent === 'function') {
            updateMainContent(lang);
        } else if (typeof window.updateMainContent === 'function') {
            window.updateMainContent(lang);
        }
        
        // Update login page specific content
        updateLoginPageContent(lang);
        
        // Update dashboard specific content
        updateDashboardContent(lang);
        
        // Update auto-response dashboard specific content
        updateAutoResponseDashboardContent(lang);
        
        // CRITICAL: Restore authentication data after language operations
        if (authData.user) localStorage.setItem('user', authData.user);
        if (authData.token) localStorage.setItem('token', authData.token);
        if (authData.refreshToken) localStorage.setItem('refreshToken', authData.refreshToken);
        
        console.log('Language Switcher: Language updated successfully, auth data preserved');
        
        // Remove transition effect after a short delay
        setTimeout(() => {
            allTextElements.forEach(element => {
                element.style.transition = '';
            });
        }, 300);
    }
    
    // Update all elements with data-translate attribute
    function updateTranslatableElements(lang) {
        const translations = {
            en: {
                // Index page translations
                pageTitle: "Facebook AI Manager - AI-Powered Facebook Page Manager",
                // Trending Topics Dashboard Translations
                trendingTopicsTitle: "Trending Topics in Your Area - Facebook AI Manager",
                trendingTopicsMenuItem: "Trending Topics",
                refreshTopics: "Refresh Topics",
                fetchNewTopics: "Fetch New Topics",
                yourLocation: "Your Location:",
                subscriptionType: "Subscription Type:",
                lastUpdated: "Last Updated:",
                totalTopics: "Total Topics",
                generatedContent: "Generated Content",
                publishedTopics: "Published Topics",
                pendingReview: "Pending Review",
                loadingTopics: "Loading topics...",
                trendingTopicsList: "Trending Topics List",
                generateAllContent: "Generate Content for All",
                topicTitle: "Topic Title",
                topicKeyword: "Keyword",
                status: "Status",
                actions: "Actions",
                noTopicsData: "No topics data",
                upgradeToAccess: "Upgrade to access",
                generatedContentPreview: "Generated Content Preview",
                logoText: "Facebook AI Manager",
                home: "Home",
                dashboard: "Dashboard",
                login: "Login",
                register: "Register",
                subscription: "Subscription",
                payment: "Payment",
                logout: "Logout",
                username: "Username or Email",
                password: "Password",
                loginButton: "Login",
                loading: "Logging in...",
                forgotPassword: "Forgot Password?",
                createAccount: "Create Account",
                heroTitle: "AI-Powered Facebook Page Manager",
                heroSubtitle: "Advanced AI Platform for Facebook Page Management",
                registerButton: "Create Account",
                dashboardButton: "Dashboard",
                feature1Title: "Smart Automation",
                feature1Desc: "Automatically create and organize content using advanced AI",
                feature2Title: "Creative Tools",
                feature2Desc: "Create engaging posts and visual content with AI assistance",
                feature3Title: "Advanced Analytics",
                feature3Desc: "Track performance and optimize social media strategy",
                feature4Title: "Facebook Integration",
                feature4Desc: "Complete management of Facebook pages with full automation",
                aiFeatureTitle: "AI-Powered Post Creation",
                aiFeatureSubtitle: "Create engaging Facebook posts automatically using advanced AI technology",
                aiFeature1: "Create posts in multiple categories",
                aiFeature2: "Customize tone and style",
                aiFeature3: "Upload your own images",
                aiFeature4: "AI-generated images (premium)",
                aiFeature5: "Interactive AI assistant",
                aiFeature6: "Automatic Facebook page scheduling",
                aiFeature7: "Complete page management automation",
                aiFeature8: "Integration with Facebook Ads Manager (premium)",
                aiFeature9: "Embedded website promotion links",
                aiFeature10: "Free plan: 2 posts daily",
                aiFeature11: "Premium: Unlimited posts and advanced features",
                tryNowButton: "Try it now - Free!",
                pricingTitle: "Pricing Plans",
                freePlan: "Free",
                freeFeature1: "2 posts daily",
                freeFeature2: "Basic AI tools",
                freeFeature3: "Manage one page",
                freeFeature4: "Community support",
                freeFeature5: "Basic templates",
                startFreeButton: "Start Free",
                premiumPlan: "Premium",
                premiumFeature1: "Unlimited posts",
                premiumFeature2: "All AI tools",
                premiumFeature3: "Manage multiple pages",
                premiumFeature4: "Advanced analytics",
                premiumFeature5: "Priority support",
                premiumFeature6: "Custom templates",
                premiumFeature7: "Advanced scheduling",
                premiumFeature8: "AI image generation",
                businessPlan: "Business",
                businessFeature1: "Everything in Premium plan",
                businessFeature2: "Manage multiple teams",
                businessFeature3: "Very advanced analytics",
                businessFeature4: "Dedicated 24/7 support",
                businessFeature5: "Integration with other tools",
                businessFeature6: "Detailed reports",
                businessFeature7: "Ad campaign management",
                copyright: "&copy; 2025 Facebook AI Manager. All rights reserved.",
                arabic: "العربية",
                english: "English",
                french: "Français",
                german: "Deutsch",
                spanish: "Español",
                comparisonTitle: "Feature Comparison",
                feature: "Feature",
                dailyPosts: "Daily Posts",
                unlimited: "Unlimited",
                facebookPages: "Facebook Pages",
                aiTools: "AI Tools",
                aiImageGeneration: "AI Image Generation",
                advancedAnalytics: "Advanced Analytics",
                support: "Support",
                communitySupport: "Community",
                prioritySupport: "Priority",
                dedicatedSupport: "Dedicated 24/7",
                teamManagement: "Team Management",
                faqTitle: "Frequently Asked Questions",
                faq1Question: "Can I change my plan at any time?",
                faq1Answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will apply at the start of the next billing cycle.",
                faq2Question: "Is there a free trial period?",
                faq2Answer: "Yes, we offer a 14-day free trial for the Premium plan. You can cancel your subscription at any time during this period.",
                faq3Question: "What payment methods are available?",
                faq3Answer: "We accept all major credit cards, PayPal, and bank transfers. All transactions are secure and encrypted.",
                faq4Question: "Can I cancel my subscription at any time?",
                faq4Answer: "Yes, you can cancel your subscription at any time from the dashboard. No additional fees will be charged to you.",
                faq5Question: "Is my data protected and secure?",
                faq5Answer: "Yes, we use the latest encryption technology to protect your data. All data is protected according to global security standards.",
                selectedLanguage: "English",
                
                // Login page translations
                loginPageTitle: "Login - Facebook AI Manager",
                usernameLabel: "Username or Email",
                usernamePlaceholder: "Enter username or email",
                passwordLabel: "Password",
                passwordPlaceholder: "Enter password",
                loadingText: "Logging in...",
                homeLink: "Home",
                createAccountLink: "Create Account",
                forgotPasswordLink: "Forgot Password?",
                
                // Register page translations
                registerPageTitle: "Create Account - Facebook AI Manager",
                fullNameLabel: "Full Name",
                fullNamePlaceholder: "Enter your full name",
                confirmPasswordLabel: "Confirm Password",
                confirmPasswordPlaceholder: "Confirm password",
                registerButton: "Create Account",
                
                // Subscription page translations
                subscriptionPageTitle: "Subscription Plans - Facebook AI Manager",
                subscriptionTitle: "Subscription Plans",
                subscriptionSubtitle: "Choose the plan that fits your needs",
                
                // Payment page translations
                paymentPageTitle: "Payment - Facebook AI Manager",
                paymentTitle: "Complete Payment",
                paymentSubtitle: "Complete the payment process to activate your premium subscription",
                orderSummary: "Order Summary",
                selectedPlan: "Selected Plan:",
                duration: "Duration:",
                oneMonth: "One month",
                price: "Price:",
                tax: "Tax:",
                total: "Total:",
                creditCard: "Credit Card",
                paypal: "PayPal",
                bankTransfer: "Bank Transfer",
                cardNumberLabel: "Card Number",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDateLabel: "Expiry Date",
                expiryDatePlaceholder: "MM/YY",
                cvvLabel: "Security Code (CVV)",
                cvvPlaceholder: "123",
                cardholderNameLabel: "Cardholder Name",
                cardholderNamePlaceholder: "Name as it appears on card",
                billingEmailLabel: "Billing Email",
                billingEmailPlaceholder: "your@email.com",
                completePaymentButton: "Complete Payment - $29.00",
                processingPayment: "Processing payment...",
                securePayment: "Secure and Encrypted Payment",
                sslProtection: "SSL Protection",
                moneyBackGuarantee: "Money Back Guarantee",
                
                // Dashboard page translations
                dashboardPageTitle: "Dashboard - Facebook AI Manager",
                loadingUserInfo: "Loading...",
                dashboardMenuItem: "Dashboard",
                scheduleMenuItem: "Schedule",
                aiToolsMenuItem: "AI Tools",
                analyticsMenuItem: "Analytics",
                autoResponseMenuItem: "Auto-Response",
                settingsMenuItem: "Settings",
                logoutMenuItem: "Logout",
                dashboardTitle: "Dashboard",
                totalPosts: "Total Posts",
                engagementRate: "Engagement Rate",
                aiSuggestions: "AI Suggestions",
                scheduledPosts: "Scheduled Posts",
                aiPostGeneratorTitle: "AI Post Generator",
                postCategoryLabel: "Post Category",
                motivationalCategory: "Motivational",
                businessCategory: "Business",
                lifestyleCategory: "Lifestyle",
                educationalCategory: "Educational",
                entertainmentCategory: "Entertainment",
                postToneLabel: "Tone",
                professionalTone: "Professional",
                friendlyTone: "Friendly",
                casualTone: "Casual",
                inspirationalTone: "Inspirational",
                customPromptLabel: "Custom Description (Optional)",
                customPromptPlaceholder: "Write a custom description for the post...",
                generatePostButton: "Generate Post",
                generatedPostTitle: "Generated Post:",
                publishToFacebookButton: "Publish to Facebook",
                saveAsDraftButton: "Save as Draft",
                recentPostsTitle: "Recent Posts",
                noPostsMessage: "No posts yet. Start by creating a new post!",
                aiChatTitle: "AI Assistant",
                aiPermissionsLabel: "AI Permissions:",
                aiWelcomeMessage: "Hello! I'm your AI assistant. How can I help you today?",
                aiChatPlaceholder: "Type your message here...",
                aiChatSendButton: "Send",
                statusDraft: "Draft",
                statusPublished: "Published",
                dashboardMenuItem: "Dashboard",
                aiToolsMenuItem: "AI Tools",
                facebookPagesMenuItem: "Facebook Pages",
                analyticsMenuItem: "Analytics",
                autoResponseMenuItem: "Auto-Response",
                settingsMenuItem: "Settings",
                logoutMenuItem: "Logout",
                selectedLanguage: "English",
                aiDashboardTitle: "Personal AI Assistant - Facebook AI Manager",
                aiChatTitle: "Personal AI Assistant",
                aiPermissionsLabel: "AI Permissions:",
                aiWelcomeMessage: "Hello! I'm your personal AI assistant. How can I help you today?",
                aiChatPlaceholder: "Type your message here...",
                dashboardTitle: "Personal AI Assistant",
                totalPosts: "Total Posts",
                engagementRate: "Engagement Rate",
                connectedPages: "Connected Pages",
                scheduledPosts: "Scheduled Posts",
                aiPostGeneratorTitle: "AI Post Generator",
                postCategoryLabel: "Post Category",
                motivationalCategory: "Motivational",
                businessCategory: "Business",
                lifestyleCategory: "Lifestyle",
                educationalCategory: "Educational",
                entertainmentCategory: "Entertainment",
                postToneLabel: "Tone",
                professionalTone: "Professional",
                friendlyTone: "Friendly",
                casualTone: "Casual",
                inspirationalTone: "Inspirational",
                customPromptLabel: "Custom Description (Optional)",
                customPromptPlaceholder: "Write a custom description for the post...",
                generatePostButton: "Generate Post",
                generatedPostTitle: "Generated Post:",
                publishToFacebookButton: "Publish to Facebook",
                saveAsDraftButton: "Save as Draft",
                scheduleButton: "Schedule",
                connectFacebookButton: "Connect New Page",
                updateAnalyticsButton: "Update Analytics",
                facebookPagesTitle: "Connected Facebook Pages",
                recentPostsTitle: "Recent Posts",
                noConnectedPages: "No pages connected yet. Click 'Connect New Page' to add your page.",
                noPostsMessage: "No posts yet. Start by creating a new post!",
                // Analytics dashboard translations
                analyticsDashboardTitle: "AI Analytics - Facebook AI Manager",
                analyticsTitle: "AI Analytics",
                timePeriodLabel: "Time Period:",
                dailyOption: "Daily",
                weeklyOption: "Weekly",
                monthlyOption: "Monthly",
                refreshButton: "Refresh",
                followerGrowth: "Follower Growth",
                topPosts: "Top Posts",
                loadingAnalytics: "Loading analytics...",
                performanceCharts: "Performance Charts",
                topPerformingPosts: "Top Performing Posts",
                postContent: "Post Content",
                likes: "Likes",
                shares: "Shares",
                comments: "Comments",
                totalEngagement: "Total Engagement",
                noPostsData: "No posts data",
                bestPostingTimes: "Best Posting Times",
                noTimeData: "No time data",
                engagementScore: "Engagement Score",
                // Auto-response dashboard translations
                autoResponseDashboardTitle: "Auto-Response - Facebook AI Manager",
                autoResponseTitle: "Auto-Response",
                autoResponseSettings: "Auto-Response Settings",
                enableAutoResponse: "Enable Auto-Response:",
                saveSettings: "Save Settings",
                manageRules: "Manage Rules",
                keywords: "Keywords (comma separated):",
                responseText: "Response Text:",
                addRule: "Add Rule",
                noRules: "No rules defined",
                recentAutoReplies: "Recent Auto-Replies",
                comment: "Comment",
                keywordTriggered: "Keyword Triggered",
                aiResponse: "AI Response",
                timestamp: "Timestamp",
                noResponses: "No auto-responses",
                loadingData: "Loading data...",
                // Test page translations
                testPageTitle: "Language Switching Test",
                basicElementsTest: "Basic Elements Test",
                basicElementsDesc: "This section tests basic elements like headings, paragraphs, and buttons",
                testButton: "Test Button",
                testLink: "Test Link",
                formElementsTest: "Form Elements Test",
                testInputLabel: "Input Field Label",
                testInputPlaceholder: "Placeholder text",
                testSelectLabel: "Dropdown Label",
                option1: "First Option",
                option2: "Second Option",
                listElementsTest: "List Elements Test",
                listItem1: "First List Item",
                listItem2: "Second List Item",
                resultsSection: "Test Results",
                runTestButton: "Run Test"
            },
            ar: {
                // Index page translations
                pageTitle: "مدير صفحات الفيس بوك بالذكاء الاصطناعي - Facebook AI Manager",
                // Trending Topics Dashboard Translations
                trendingTopicsTitle: "المواضيع الشائعة في منطقتك - Facebook AI Manager",
                trendingTopicsMenuItem: "المواضيع الشائعة",
                refreshTopics: "تحديث المواضيع",
                fetchNewTopics: "جلب مواضيع جديدة",
                yourLocation: "موقعك:",
                subscriptionType: "نوع الاشتراك:",
                lastUpdated: "آخر تحديث:",
                totalTopics: "إجمالي المواضيع",
                generatedContent: "محتوى مُنشأ",
                publishedTopics: "مواضيع منشورة",
                pendingReview: "بانتظار المراجعة",
                loadingTopics: "جاري تحميل المواضيع...",
                trendingTopicsList: "قائمة المواضيع الشائعة",
                generateAllContent: "إنشاء محتوى للكل",
                topicTitle: "عنوان الموضوع",
                topicKeyword: "الكلمة المفتاحية",
                status: "الحالة",
                actions: "الإجراءات",
                noTopicsData: "لا توجد بيانات مواضيع",
                upgradeToAccess: "قم بالترقية للوصول",
                generatedContentPreview: "معاينة المحتوى المُنشأ",
                logoText: "Facebook AI Manager",
                home: "الرئيسية",
                dashboard: "لوحة التحكم",
                login: "تسجيل الدخول",
                register: "إنشاء حساب",
                subscription: "الاشتراك",
                payment: "الدفع",
                logout: "تسجيل الخروج",
                username: "اسم المستخدم أو البريد الإلكتروني",
                password: "كلمة المرور",
                loginButton: "تسجيل الدخول",
                loading: "جاري تسجيل الدخول...",
                forgotPassword: "نسيت كلمة المرور؟",
                createAccount: "إنشاء حساب",
                heroTitle: "مدير صفحات الفيس بوك بالذكاء الاصطناعي",
                heroSubtitle: "منصة إدارة صفحات الفيس بوك المتطورة بالذكاء الاصطناعي",
                registerButton: "إنشاء حساب",
                dashboardButton: "لوحة التحكم",
                feature1Title: "أتمتة ذكية",
                feature1Desc: "إنشاء وتنظيم المحتوى تلقائياً باستخدام الذكاء الاصطناعي المتقدم",
                feature2Title: "أدوات إبداعية",
                feature2Desc: "إنشاء منشورات جذابة ومحتوى مرئي بمساعدة الذكاء الاصطناعي",
                feature3Title: "تحليلات متقدمة",
                feature3Desc: "تتبع الأداء وتحسين استراتيجية وسائل التواصل الاجتماعي",
                feature4Title: "تكامل الفيس بوك",
                feature4Desc: "إدارة متكاملة لصفحات الفيس بوك مع أتمتة كاملة",
                aiFeatureTitle: "إنشاء منشورات مدعومة بالذكاء الاصطناعي",
                aiFeatureSubtitle: "أنشئ منشورات فيسبوك جذابة تلقائياً باستخدام تقنية الذكاء الاصطناعي المتقدمة",
                aiFeature1: "إنشاء منشورات في فئات متعددة",
                aiFeature2: "تخصيص النبرة والأسلوب",
                aiFeature3: "رفع الصور الخاصة بك",
                aiFeature4: "إنشاء صور بالذكاء الاصطناعي (مميز)",
                aiFeature5: "مساعد ذكي تفاعلي",
                aiFeature6: "جدولة تلقائية لصفحة الفيس بوك",
                aiFeature7: "أتمتة كاملة لإدارة الصفحة",
                aiFeature8: "تكامل مع مدير إعلانات الفيس بوك (مميز)",
                aiFeature9: "روابط ترويجية للموقع مدمجة",
                aiFeature10: "خطة مجانية: منشورين يومياً",
                aiFeature11: "مميز: منشورات غير محدودة وميزات متقدمة",
                tryNowButton: "جربها الآن - مجاناً!",
                pricingTitle: "خطط الأسعار",
                freePlan: "مجاني",
                freeFeature1: "منشورين يومياً",
                freeFeature2: "أدوات أساسية للذكاء الاصطناعي",
                freeFeature3: "إدارة صفحة واحدة",
                freeFeature4: "دعم مجتمعي",
                freeFeature5: "قوالب أساسية",
                startFreeButton: "ابدأ مجاناً",
                premiumPlan: "مميز",
                premiumFeature1: "منشورات غير محدودة",
                premiumFeature2: "جميع أدوات الذكاء الاصطناعي",
                premiumFeature3: "إدارة صفحات متعددة",
                premiumFeature4: "تحليلات متقدمة",
                premiumFeature5: "دعم أولوية",
                premiumFeature6: "قوالب مخصصة",
                premiumFeature7: "جدولة متقدمة",
                premiumFeature8: "إنشاء صور بالذكاء الاصطناعي",
                businessPlan: "أعمال",
                businessFeature1: "كل شيء في الخطة المميزة",
                businessFeature2: "إدارة فرق متعددة",
                businessFeature3: "تحليلات متقدمة جداً",
                businessFeature4: "دعم مخصص 24/7",
                businessFeature5: "تكامل مع أدوات أخرى",
                businessFeature6: "تقارير مفصلة",
                businessFeature7: "إدارة الحملات الإعلانية",
                copyright: "&copy; 2025 Facebook AI Manager. جميع الحقوق محفوظة.",
                arabic: "العربية",
                english: "English",
                french: "Français",
                german: "Deutsch",
                spanish: "Español",
                comparisonTitle: "مقارنة المميزات",
                feature: "المميزة",
                dailyPosts: "عدد المنشورات اليومية",
                unlimited: "غير محدود",
                facebookPages: "صفحات الفيس بوك",
                aiTools: "أدوات الذكاء الاصطناعي",
                aiImageGeneration: "إنشاء صور بالذكاء الاصطناعي",
                advancedAnalytics: "التحليلات المتقدمة",
                support: "الدعم الفني",
                communitySupport: "مجتمعي",
                prioritySupport: "أولوية",
                dedicatedSupport: "مخصص 24/7",
                teamManagement: "إدارة الفرق",
                faqTitle: "الأسئلة الشائعة",
                faq1Question: "هل يمكنني تغيير خطتي في أي وقت؟",
                faq1Answer: "نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. التغييرات ستطبق في بداية دورة الفوترة التالية.",
                faq2Question: "هل هناك فترة تجريبية مجانية؟",
                faq2Answer: "نعم، نقدم فترة تجريبية مجانية لمدة 14 يوم للخطة المميزة. يمكنك إلغاء الاشتراك في أي وقت خلال هذه الفترة.",
                faq3Question: "ما هي طرق الدفع المتاحة؟",
                faq3Answer: "نقبل جميع البطاقات الائتمانية الرئيسية، PayPal، والتحويل البنكي. جميع المعاملات آمنة ومشفرة.",
                faq4Question: "هل يمكنني إلغاء الاشتراك في أي وقت؟",
                faq4Answer: "نعم، يمكنك إلغاء الاشتراك في أي وقت من لوحة التحكم. لن يتم خصم أي رسوم إضافية منك.",
                faq5Question: "هل البيانات محمية وآمنة؟",
                faq5Answer: "نعم، نستخدم أحدث تقنيات التشفير لحماية بياناتك. جميع البيانات محمية وفقاً لمعايير الأمان العالمية.",
                selectedLanguage: "العربية",
                
                // Login page translations
                loginPageTitle: "تسجيل الدخول - Facebook AI Manager",
                usernameLabel: "اسم المستخدم أو البريد الإلكتروني",
                usernamePlaceholder: "أدخل اسم المستخدم أو البريد الإلكتروني",
                passwordLabel: "كلمة المرور",
                passwordPlaceholder: "أدخل كلمة المرور",
                loadingText: "جاري تسجيل الدخول...",
                homeLink: "الرئيسية",
                createAccountLink: "إنشاء حساب",
                forgotPasswordLink: "نسيت كلمة المرور؟",
                
                // Register page translations
                registerPageTitle: "إنشاء حساب - Facebook AI Manager",
                fullNameLabel: "الاسم الكامل",
                fullNamePlaceholder: "أدخل اسمك الكامل",
                confirmPasswordLabel: "تأكيد كلمة المرور",
                confirmPasswordPlaceholder: "أكد كلمة المرور",
                registerButton: "إنشاء حساب",
                
                // Subscription page translations
                subscriptionPageTitle: "خطط الاشتراك - Facebook AI Manager",
                subscriptionTitle: "خطط الاشتراك",
                subscriptionSubtitle: "اختر الخطة التي تناسب احتياجاتك",
                
                // Payment page translations
                paymentPageTitle: "الدفع - Facebook AI Manager",
                paymentTitle: "إتمام الدفع",
                paymentSubtitle: "أكمل عملية الدفع لتفعيل اشتراكك المميز",
                orderSummary: "ملخص الطلب",
                selectedPlan: "الخطة المختارة:",
                duration: "المدة:",
                oneMonth: "شهر واحد",
                price: "السعر:",
                tax: "الضريبة:",
                total: "المجموع:",
                creditCard: "بطاقة ائتمان",
                paypal: "PayPal",
                bankTransfer: "تحويل بنكي",
                cardNumberLabel: "رقم البطاقة",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDateLabel: "تاريخ الانتهاء",
                expiryDatePlaceholder: "MM/YY",
                cvvLabel: "رمز الأمان (CVV)",
                cvvPlaceholder: "123",
                cardholderNameLabel: "اسم حامل البطاقة",
                cardholderNamePlaceholder: "الاسم كما هو مكتوب على البطاقة",
                billingEmailLabel: "البريد الإلكتروني للفوترة",
                billingEmailPlaceholder: "your@email.com",
                completePaymentButton: "إتمام الدفع - $29.00",
                processingPayment: "جاري معالجة الدفع...",
                securePayment: "دفع آمن ومشفر",
                sslProtection: "حماية SSL",
                moneyBackGuarantee: "ضمان استرداد الأموال",
                
                // Dashboard page translations
                dashboardPageTitle: "لوحة التحكم - Facebook AI Manager",
                loadingUserInfo: "جاري التحميل...",
                dashboardMenuItem: "لوحة التحكم",
                scheduleMenuItem: "جدولة",
                aiToolsMenuItem: "أدوات الذكاء الاصطناعي",
                analyticsMenuItem: "تحليلات",
                autoResponseMenuItem: "الرد التلقائي",
                settingsMenuItem: "إعدادات",
                logoutMenuItem: "تسجيل الخروج",
                dashboardTitle: "لوحة التحكم",
                totalPosts: "إجمالي المنشورات",
                engagementRate: "معدل التفاعل",
                aiSuggestions: "اقتراحات الذكاء الاصطناعي",
                scheduledPosts: "المنشورات المجدولة",
                aiPostGeneratorTitle: "مولد منشورات الذكاء الاصطناعي",
                postCategoryLabel: "فئة المنشور",
                motivationalCategory: "تحفيزي",
                businessCategory: "أعمال",
                lifestyleCategory: "نمط حياة",
                educationalCategory: "تعليمي",
                entertainmentCategory: "ترفيهي",
                postToneLabel: "النبرة",
                professionalTone: "مهنية",
                friendlyTone: "ودية",
                casualTone: "عادية",
                inspirationalTone: "ملهمة",
                customPromptLabel: "وصف مخصص (اختياري)",
                customPromptPlaceholder: "اكتب وصفاً مخصصاً للمنشور...",
                generatePostButton: "إنشاء منشور",
                generatedPostTitle: "المنشور المُنشأ:",
                publishToFacebookButton: "نشر على الفيس بوك",
                saveAsDraftButton: "حفظ كمسودة",
                recentPostsTitle: "المنشورات الأخيرة",
                noPostsMessage: "لا توجد منشورات بعد. ابدأ بإنشاء منشور جديد!",
                aiChatTitle: "مساعد AI",
                aiPermissionsLabel: "صلاحيات AI:",
                aiWelcomeMessage: "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
                aiChatPlaceholder: "اكتب رسالتك هنا...",
                aiChatSendButton: "إرسال",
                statusDraft: "مسودة",
                statusPublished: "منشور",
                dashboardMenuItem: "لوحة التحكم",
                aiToolsMenuItem: "أدوات الذكاء الاصطناعي",
                facebookPagesMenuItem: "صفحات الفيسبوك",
                analyticsMenuItem: "التحليلات",
                autoResponseMenuItem: "الرد التلقائي",
                settingsMenuItem: "الإعدادات",
                logoutMenuItem: "تسجيل الخروج",
                selectedLanguage: "العربية",
                aiDashboardTitle: "المساعد الذكي الشخصي - Facebook AI Manager",
                aiChatTitle: "المساعد الذكي الشخصي",
                aiPermissionsLabel: "صلاحيات AI:",
                aiWelcomeMessage: "مرحباً! أنا مساعدك الذكي الشخصي. كيف يمكنني مساعدتك اليوم؟",
                aiChatPlaceholder: "اكتب رسالتك هنا...",
                dashboardTitle: "المساعد الذكي الشخصي",
                totalPosts: "إجمالي المنشورات",
                engagementRate: "معدل التفاعل",
                connectedPages: "الصفحات المتصلة",
                scheduledPosts: "المنشورات المجدولة",
                aiPostGeneratorTitle: "مولد منشورات الذكاء الاصطناعي",
                postCategoryLabel: "فئة المنشور",
                motivationalCategory: "تحفيزي",
                businessCategory: "أعمال",
                lifestyleCategory: "نمط حياة",
                educationalCategory: "تعليمي",
                entertainmentCategory: "ترفيهي",
                postToneLabel: "النبرة",
                professionalTone: "مهنية",
                friendlyTone: "ودية",
                casualTone: "عادية",
                inspirationalTone: "ملهمة",
                customPromptLabel: "وصف مخصص (اختياري)",
                customPromptPlaceholder: "اكتب وصفاً مخصصاً للمنشور...",
                generatePostButton: "إنشاء منشور",
                generatedPostTitle: "المنشور المُنشأ:",
                publishToFacebookButton: "نشر على الفيس بوك",
                saveAsDraftButton: "حفظ كمسودة",
                scheduleButton: "جدولة",
                connectFacebookButton: "ربط صفحة جديدة",
                updateAnalyticsButton: "تحديث التحليلات",
                facebookPagesTitle: "صفحات الفيسبوك المتصلة",
                recentPostsTitle: "المنشورات الأخيرة",
                noConnectedPages: "لا توجد صفحات متصلة بعد. انقر على \"ربط صفحة جديدة\" لإضافة صفحتك.",
                noPostsMessage: "لا توجد منشورات بعد. ابدأ بإنشاء منشور جديد!",
                // Analytics dashboard translations
                analyticsDashboardTitle: "تحليلات الذكاء الاصطناعي - Facebook AI Manager",
                analyticsTitle: "تحليلات الذكاء الاصطناعي",
                timePeriodLabel: "الفترة الزمنية:",
                dailyOption: "يومي",
                weeklyOption: "أسبوعي",
                monthlyOption: "شهري",
                refreshButton: "تحديث",
                followerGrowth: "نمو المتابعين",
                topPosts: "أفضل المنشورات",
                loadingAnalytics: "جاري تحميل التحليلات...",
                performanceCharts: "مخططات الأداء",
                topPerformingPosts: "أفضل المنشورات من حيث التفاعل",
                postContent: "محتوى المنشور",
                likes: "الإعجابات",
                shares: "المشاركات",
                comments: "التعليقات",
                totalEngagement: "إجمالي التفاعل",
                noPostsData: "لا توجد بيانات منشورات",
                bestPostingTimes: "أفضل أوقات النشر",
                noTimeData: "لا توجد بيانات أوقات",
                engagementScore: "درجة التفاعل",
                // Auto-response dashboard translations
                autoResponseDashboardTitle: "الرد التلقائي - Facebook AI Manager",
                autoResponseTitle: "الرد التلقائي",
                autoResponseSettings: "إعدادات الرد التلقائي",
                enableAutoResponse: "تفعيل الرد التلقائي:",
                saveSettings: "حفظ الإعدادات",
                manageRules: "إدارة القواعد",
                keywords: "الكلمات المفتاحية (مفصولة بفواصل):",
                responseText: "نص الرد:",
                addRule: "إضافة قاعدة",
                noRules: "لا توجد قواعد محددة",
                recentAutoReplies: "الردود التلقائية الأخيرة",
                comment: "التعليق",
                keywordTriggered: "الكلمة المفتاحية",
                aiResponse: "رد الذكاء الاصطناعي",
                timestamp: "الوقت",
                noResponses: "لا توجد ردود تلقائية",
                loadingData: "جاري تحميل البيانات...",
                // Test page translations
                testPageTitle: "اختبار تبديل اللغة",
                basicElementsTest: "اختبار العناصر الأساسية",
                basicElementsDesc: "هذا القسم يختبر العناصر الأساسية مثل العناوين والفقرات والأزرار",
                testButton: "زر الاختبار",
                testLink: "رابط الاختبار",
                formElementsTest: "اختبار عناصر النموذج",
                testInputLabel: "تسمية حقل الإدخال",
                testInputPlaceholder: "نص العنصر النائب",
                testSelectLabel: "تسمية القائمة المنسدلة",
                option1: "الخيار الأول",
                option2: "الخيار الثاني",
                listElementsTest: "اختبار عناصر القائمة",
                listItem1: "عنصر قائمة أول",
                listItem2: "عنصر قائمة ثاني",
                resultsSection: "نتائج الاختبار",
                runTestButton: "تشغيل الاختبار"
            },
            fr: {
                // Index page translations
                pageTitle: "Gestionnaire de pages Facebook IA - Facebook AI Manager",
                // Trending Topics Dashboard Translations
                trendingTopicsTitle: "Sujets tendance dans votre région - Facebook AI Manager",
                trendingTopicsMenuItem: "Sujets tendance",
                refreshTopics: "Actualiser les sujets",
                fetchNewTopics: "Récupérer de nouveaux sujets",
                yourLocation: "Votre emplacement:",
                subscriptionType: "Type d'abonnement:",
                lastUpdated: "Dernière mise à jour:",
                totalTopics: "Total des sujets",
                generatedContent: "Contenu généré",
                publishedTopics: "Sujets publiés",
                pendingReview: "En attente de révision",
                loadingTopics: "Chargement des sujets...",
                trendingTopicsList: "Liste des sujets tendance",
                generateAllContent: "Générer le contenu pour tous",
                topicTitle: "Titre du sujet",
                topicKeyword: "Mot-clé",
                status: "Statut",
                actions: "Actions",
                noTopicsData: "Aucune donnée de sujets",
                upgradeToAccess: "Mettre à niveau pour accéder",
                generatedContentPreview: "Aperçu du contenu généré",
                logoText: "Facebook AI Manager",
                home: "Accueil",
                dashboard: "Tableau de bord",
                login: "Connexion",
                register: "S'inscrire",
                subscription: "Abonnement",
                payment: "Paiement",
                logout: "Déconnexion",
                username: "Nom d'utilisateur ou Email",
                password: "Mot de passe",
                loginButton: "Connexion",
                loading: "Connexion en cours...",
                forgotPassword: "Mot de passe oublié?",
                createAccount: "Créer un compte",
                heroTitle: "Gestionnaire de pages Facebook avec IA",
                heroSubtitle: "Plateforme avancée d'IA pour la gestion des pages Facebook",
                registerButton: "Créer un compte",
                dashboardButton: "Tableau de bord",
                feature1Title: "Automatisation intelligente",
                feature1Desc: "Créez et organisez automatiquement du contenu avec l'IA avancée",
                feature2Title: "Outils créatifs",
                feature2Desc: "Créez des publications engageantes et du contenu visuel avec l'aide de l'IA",
                feature3Title: "Analyses avancées",
                feature3Desc: "Suivez les performances et optimisez votre stratégie sur les réseaux sociaux",
                feature4Title: "Intégration Facebook",
                feature4Desc: "Gestion complète des pages Facebook avec automatisation totale",
                aiFeatureTitle: "Création de publications avec IA",
                aiFeatureSubtitle: "Créez automatiquement des publications Facebook engageantes avec la technologie IA avancée",
                aiFeature1: "Créer des publications dans plusieurs catégories",
                aiFeature2: "Personnaliser le ton et le style",
                aiFeature3: "Télécharger vos propres images",
                aiFeature4: "Images générées par IA (premium)",
                aiFeature5: "Assistant IA interactif",
                aiFeature6: "Planification automatique des pages Facebook",
                aiFeature7: "Automatisation complète de la gestion des pages",
                aiFeature8: "Intégration avec le gestionnaire d'annonces Facebook (premium)",
                aiFeature9: "Liens de promotion de site Web intégrés",
                aiFeature10: "Plan gratuit : 2 publications par jour",
                aiFeature11: "Premium : Publications illimitées et fonctionnalités avancées",
                tryNowButton: "Essayer maintenant - Gratuit !",
                pricingTitle: "Plans de tarification",
                freePlan: "Gratuit",
                freeFeature1: "2 publications par jour",
                freeFeature2: "Outils IA de base",
                freeFeature3: "Gérer une page",
                freeFeature4: "Support communautaire",
                freeFeature5: "Modèles de base",
                startFreeButton: "Commencer gratuitement",
                premiumPlan: "Premium",
                premiumFeature1: "Publications illimitées",
                premiumFeature2: "Tous les outils IA",
                premiumFeature3: "Gérer plusieurs pages",
                premiumFeature4: "Analyses avancées",
                premiumFeature5: "Support prioritaire",
                premiumFeature6: "Modèles personnalisés",
                premiumFeature7: "Planification avancée",
                premiumFeature8: "Génération d'images par IA",
                businessPlan: "Entreprise",
                businessFeature1: "Tout ce qui est dans le plan Premium",
                businessFeature2: "Gérer plusieurs équipes",
                businessFeature3: "Analyses très avancées",
                businessFeature4: "Support dédié 24/7",
                businessFeature5: "Intégration avec d'autres outils",
                businessFeature6: "Rapports détaillés",
                businessFeature7: "Gestion des campagnes publicitaires",
                copyright: "&copy; 2025 Facebook AI Manager. Tous droits réservés.",
                arabic: "العربية",
                english: "English",
                french: "Français",
                german: "Deutsch",
                spanish: "Español",
                comparisonTitle: "Comparaison des fonctionnalités",
                feature: "Fonctionnalité",
                dailyPosts: "Publications quotidiennes",
                unlimited: "Illimité",
                facebookPages: "Pages Facebook",
                aiTools: "Outils IA",
                aiImageGeneration: "Génération d'images par IA",
                advancedAnalytics: "Analyses avancées",
                support: "Support",
                communitySupport: "Communauté",
                prioritySupport: "Prioritaire",
                dedicatedSupport: "Dédié 24/7",
                teamManagement: "Gestion d'équipe",
                faqTitle: "Questions fréquemment posées",
                faq1Question: "Puis-je changer mon plan à tout moment ?",
                faq1Answer: "Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les modifications s'appliqueront au début du prochain cycle de facturation.",
                faq2Question: "Y a-t-il une période d'essai gratuit ?",
                faq2Answer: "Oui, nous offrons un essai gratuit de 14 jours pour le plan Premium. Vous pouvez annuler votre abonnement à tout moment pendant cette période.",
                faq3Question: "Quels modes de paiement sont disponibles ?",
                faq3Answer: "Nous acceptons toutes les principales cartes de crédit, PayPal et les virements bancaires. Toutes les transactions sont sécurisées et cryptées.",
                faq4Question: "Puis-je annuler mon abonnement à tout moment ?",
                faq4Answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis le tableau de bord. Aucun frais supplémentaire ne vous sera facturé.",
                faq5Question: "Mes données sont-elles protégées et sécurisées ?",
                faq5Answer: "Oui, nous utilisons la dernière technologie de cryptage pour protéger vos données. Toutes les données sont protégées selon les normes de sécurité mondiales.",
                selectedLanguage: "Français",
                
                // Login page translations
                loginPageTitle: "Connexion - Facebook AI Manager",
                usernameLabel: "Nom d'utilisateur ou Email",
                usernamePlaceholder: "Entrez le nom d'utilisateur ou l'email",
                passwordLabel: "Mot de passe",
                passwordPlaceholder: "Entrez le mot de passe",
                loadingText: "Connexion en cours...",
                homeLink: "Accueil",
                createAccountLink: "Créer un compte",
                forgotPasswordLink: "Mot de passe oublié?",
                
                // Register page translations
                registerPageTitle: "Créer un compte - Facebook AI Manager",
                fullNameLabel: "Nom complet",
                fullNamePlaceholder: "Entrez votre nom complet",
                confirmPasswordLabel: "Confirmer le mot de passe",
                confirmPasswordPlaceholder: "Confirmez le mot de passe",
                registerButton: "Créer un compte",
                
                // Subscription page translations
                subscriptionPageTitle: "Plans d'abonnement - Facebook AI Manager",
                subscriptionTitle: "Plans d'abonnement",
                subscriptionSubtitle: "Choisissez le plan qui correspond à vos besoins",
                
                // Payment page translations
                paymentPageTitle: "Paiement - Facebook AI Manager",
                paymentTitle: "Terminer le paiement",
                paymentSubtitle: "Terminez le processus de paiement pour activer votre abonnement premium",
                orderSummary: "Résumé de la commande",
                selectedPlan: "Plan sélectionné:",
                duration: "Durée:",
                oneMonth: "Un mois",
                price: "Prix:",
                tax: "Taxe:",
                total: "Total:",
                creditCard: "Carte de crédit",
                paypal: "PayPal",
                bankTransfer: "Virement bancaire",
                cardNumberLabel: "Numéro de carte",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDateLabel: "Date d'expiration",
                expiryDatePlaceholder: "MM/AA",
                cvvLabel: "Code de sécurité (CVV)",
                cvvPlaceholder: "123",
                cardholderNameLabel: "Nom du titulaire",
                cardholderNamePlaceholder: "Nom tel qu'il apparaît sur la carte",
                billingEmailLabel: "Email de facturation",
                billingEmailPlaceholder: "votre@email.com",
                completePaymentButton: "Terminer le paiement - 29,00 $",
                processingPayment: "Traitement du paiement...",
                securePayment: "Paiement sécurisé et crypté",
                sslProtection: "Protection SSL",
                moneyBackGuarantee: "Garantie de remboursement",
                
                // Dashboard page translations
                dashboardPageTitle: "Tableau de bord - Facebook AI Manager",
                loadingUserInfo: "Chargement...",
                dashboardMenuItem: "Tableau de bord",
                scheduleMenuItem: "Planifier",
                aiToolsMenuItem: "Outils IA",
                analyticsMenuItem: "Analytique",
                autoResponseMenuItem: "Réponse automatique",
                settingsMenuItem: "Paramètres",
                logoutMenuItem: "Déconnexion",
                dashboardTitle: "Tableau de bord",
                totalPosts: "Total des publications",
                engagementRate: "Taux d'engagement",
                aiSuggestions: "Suggestions IA",
                scheduledPosts: "Publications planifiées",
                aiPostGeneratorTitle: "Générateur de publications IA",
                postCategoryLabel: "Catégorie de publication",
                motivationalCategory: "Motivant",
                businessCategory: "Affaires",
                lifestyleCategory: "Mode de vie",
                educationalCategory: "Éducatif",
                entertainmentCategory: "Divertissement",
                postToneLabel: "Ton",
                professionalTone: "Professionnel",
                friendlyTone: "Amical",
                casualTone: "Décontracté",
                inspirationalTone: "Inspirant",
                customPromptLabel: "Description personnalisée (facultatif)",
                customPromptPlaceholder: "Écrivez une description personnalisée pour la publication...",
                generatePostButton: "Générer une publication",
                generatedPostTitle: "Publication générée:",
                publishToFacebookButton: "Publier sur Facebook",
                saveAsDraftButton: "Enregistrer comme brouillon",
                recentPostsTitle: "Publications récentes",
                noPostsMessage: "Aucune publication pour le moment. Commencez par créer une nouvelle publication!",
                aiChatTitle: "Assistant IA",
                aiPermissionsLabel: "Autorisations IA :",
                aiWelcomeMessage: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
                aiChatPlaceholder: "Tapez votre message ici...",
                aiChatSendButton: "Envoyer",
                statusDraft: "Brouillon",
                statusPublished: "Publié",
                dashboardMenuItem: "Tableau de bord",
                aiToolsMenuItem: "Outils IA",
                facebookPagesMenuItem: "Pages Facebook",
                analyticsMenuItem: "Analytique",
                autoResponseMenuItem: "Réponse automatique",
                settingsMenuItem: "Paramètres",
                logoutMenuItem: "Déconnexion",
                selectedLanguage: "Français",
                aiDashboardTitle: "Assistant IA Personnel - Facebook AI Manager",
                aiChatTitle: "Assistant IA Personnel",
                aiPermissionsLabel: "Autorisations IA :",
                aiWelcomeMessage: "Bonjour ! Je suis votre assistant IA personnel. Comment puis-je vous aider aujourd'hui ?",
                aiChatPlaceholder: "Tapez votre message ici...",
                dashboardTitle: "Assistant IA Personnel",
                totalPosts: "Total des publications",
                engagementRate: "Taux d'engagement",
                connectedPages: "Pages connectées",
                scheduledPosts: "Publications planifiées",
                aiPostGeneratorTitle: "Générateur de publications IA",
                postCategoryLabel: "Catégorie de publication",
                motivationalCategory: "Motivant",
                businessCategory: "Affaires",
                lifestyleCategory: "Mode de vie",
                educationalCategory: "Éducatif",
                entertainmentCategory: "Divertissement",
                postToneLabel: "Ton",
                professionalTone: "Professionnel",
                friendlyTone: "Amical",
                casualTone: "Décontracté",
                inspirationalTone: "Inspirant",
                customPromptLabel: "Description personnalisée (facultatif)",
                customPromptPlaceholder: "Écrivez une description personnalisée pour la publication...",
                generatePostButton: "Générer une publication",
                generatedPostTitle: "Publication générée:",
                publishToFacebookButton: "Publier sur Facebook",
                saveAsDraftButton: "Enregistrer comme brouillon",
                scheduleButton: "Planifier",
                connectFacebookButton: "Connecter une nouvelle page",
                updateAnalyticsButton: "Mettre à jour les analyses",
                facebookPagesTitle: "Pages Facebook connectées",
                recentPostsTitle: "Publications récentes",
                noConnectedPages: "Aucune page connectée pour le moment. Cliquez sur \"Connecter une nouvelle page\" pour ajouter votre page.",
                noPostsMessage: "Aucune publication pour le moment. Commencez par créer une nouvelle publication !",
                // Analytics dashboard translations
                analyticsDashboardTitle: "Analytique IA - Facebook AI Manager",
                analyticsTitle: "Analytique IA",
                timePeriodLabel: "Période de temps:",
                dailyOption: "Quotidien",
                weeklyOption: "Hebdomadaire",
                monthlyOption: "Mensuel",
                refreshButton: "Actualiser",
                followerGrowth: "Croissance des abonnés",
                topPosts: "Meilleures publications",
                loadingAnalytics: "Chargement des analyses...",
                performanceCharts: "Graphiques de performance",
                topPerformingPosts: "Meilleures publications par engagement",
                postContent: "Contenu de la publication",
                likes: "J'aime",
                shares: "Partages",
                comments: "Commentaires",
                totalEngagement: "Engagement total",
                noPostsData: "Aucune donnée de publication",
                bestPostingTimes: "Meilleurs moments de publication",
                noTimeData: "Aucune donnée temporelle",
                engagementScore: "Score d'engagement",
                // Auto-response dashboard translations
                autoResponseDashboardTitle: "Réponse automatique - Facebook AI Manager",
                autoResponseTitle: "Réponse automatique",
                autoResponseSettings: "Paramètres de réponse automatique",
                enableAutoResponse: "Activer la réponse automatique :",
                saveSettings: "Enregistrer les paramètres",
                manageRules: "Gérer les règles",
                keywords: "Mots-clés (séparés par des virgules) :",
                responseText: "Texte de réponse :",
                addRule: "Ajouter une règle",
                noRules: "Aucune règle définie",
                recentAutoReplies: "Réponses automatiques récentes",
                comment: "Commentaire",
                keywordTriggered: "Mot-clé déclenché",
                aiResponse: "Réponse IA",
                timestamp: "Horodatage",
                noResponses: "Aucune réponse automatique",
                loadingData: "Chargement des données...",
                // Test page translations
                testPageTitle: "Test de changement de langue",
                basicElementsTest: "Test des éléments de base",
                basicElementsDesc: "Cette section teste les éléments de base comme les titres, les paragraphes et les boutons",
                testButton: "Bouton de test",
                testLink: "Lien de test",
                formElementsTest: "Test des éléments de formulaire",
                testInputLabel: "Étiquette du champ de saisie",
                testInputPlaceholder: "Texte de substitution",
                testSelectLabel: "Étiquette de la liste déroulante",
                option1: "Première option",
                option2: "Deuxième option",
                listElementsTest: "Test des éléments de liste",
                listItem1: "Premier élément de liste",
                listItem2: "Deuxième élément de liste",
                resultsSection: "Résultats du test",
                runTestButton: "Exécuter le test"
            },
            de: {
                // Index page translations
                pageTitle: "Facebook-Seitenmanager mit KI - Facebook AI Manager",
                // Trending Topics Dashboard Translations
                trendingTopicsTitle: "Trending-Themen in Ihrer Region - Facebook AI Manager",
                trendingTopicsMenuItem: "Trending-Themen",
                refreshTopics: "Themen aktualisieren",
                fetchNewTopics: "Neue Themen abrufen",
                yourLocation: "Ihr Standort:",
                subscriptionType: "Abonnementtyp:",
                lastUpdated: "Letzte Aktualisierung:",
                totalTopics: "Gesamtthemen",
                generatedContent: "Generierte Inhalte",
                publishedTopics: "Veröffentlichte Themen",
                pendingReview: "Ausstehende Überprüfung",
                loadingTopics: "Themen werden geladen...",
                trendingTopicsList: "Liste der Trending-Themen",
                generateAllContent: "Inhalte für alle generieren",
                topicTitle: "Thementitel",
                topicKeyword: "Schlüsselwort",
                status: "Status",
                actions: "Aktionen",
                noTopicsData: "Keine Themendaten",
                upgradeToAccess: "Upgrade zum Zugriff",
                generatedContentPreview: "Vorschau der generierten Inhalte",
                logoText: "Facebook AI Manager",
                home: "Startseite",
                dashboard: "Dashboard",
                login: "Anmelden",
                register: "Registrieren",
                subscription: "Abonnement",
                payment: "Zahlung",
                logout: "Abmelden",
                username: "Benutzername oder E-Mail",
                password: "Passwort",
                loginButton: "Anmelden",
                loading: "Anmeldung läuft...",
                forgotPassword: "Passwort vergessen?",
                createAccount: "Konto erstellen",
                heroTitle: "KI-gestützter Facebook-Seitenmanager",
                heroSubtitle: "Fortgeschrittene KI-Plattform für das Facebook-Seitenmanagement",
                registerButton: "Konto erstellen",
                dashboardButton: "Dashboard",
                feature1Title: "Intelligente Automatisierung",
                feature1Desc: "Automatisches Erstellen und Organisieren von Inhalten mit fortschrittlicher KI",
                feature2Title: "Kreative Tools",
                feature2Desc: "Erstellen Sie ansprechende Beiträge und visuelle Inhalte mit KI-Unterstützung",
                feature3Title: "Erweiterte Analysen",
                feature3Desc: "Verfolgen Sie die Leistung und optimieren Sie Ihre Social-Media-Strategie",
                feature4Title: "Facebook-Integration",
                feature4Desc: "Vollständige Verwaltung von Facebook-Seiten mit vollständiger Automatisierung",
                aiFeatureTitle: "KI-gestützte Beitrags erstellung",
                aiFeatureSubtitle: "Erstellen Sie automatisch ansprechende Facebook-Beiträge mit fortschrittlicher KI-Technologie",
                aiFeature1: "Beiträge in mehreren Kategorien erstellen",
                aiFeature2: "Ton und Stil anpassen",
                aiFeature3: "Eigene Bilder hochladen",
                aiFeature4: "KI-generierte Bilder (Premium)",
                aiFeature5: "Interaktiver KI-Assistent",
                aiFeature6: "Automatische Facebook-Seitenplanung",
                aiFeature7: "Vollständige Automatisierung des Seitenmanagements",
                aiFeature8: "Integration mit Facebook Ads Manager (Premium)",
                aiFeature9: "Eingebettete Website-Promotion-Links",
                aiFeature10: "Kostenloser Plan: 2 Beiträge täglich",
                aiFeature11: "Premium: Unbegrenzte Beiträge und erweiterte Funktionen",
                tryNowButton: "Jetzt testen - Kostenlos!",
                pricingTitle: "Preispläne",
                freePlan: "Kostenlos",
                freeFeature1: "2 Beiträge täglich",
                freeFeature2: "Grundlegende KI-Tools",
                freeFeature3: "Eine Seite verwalten",
                freeFeature4: "Community-Support",
                freeFeature5: "Grundlegende Vorlagen",
                startFreeButton: "Kostenlos starten",
                premiumPlan: "Premium",
                premiumFeature1: "Unbegrenzte Beiträge",
                premiumFeature2: "Alle KI-Tools",
                premiumFeature3: "Mehrere Seiten verwalten",
                premiumFeature4: "Erweiterte Analysen",
                premiumFeature5: "Prioritätsupport",
                premiumFeature6: "Benutzerdefinierte Vorlagen",
                premiumFeature7: "Erweiterte Planung",
                premiumFeature8: "KI-Bildgenerierung",
                businessPlan: "Business",
                businessFeature1: "Alles im Premium-Plan",
                businessFeature2: "Mehrere Teams verwalten",
                businessFeature3: "Sehr erweiterte Analysen",
                businessFeature4: "Dedizierter 24/7-Support",
                businessFeature5: "Integration mit anderen Tools",
                businessFeature6: "Detaillierte Berichte",
                businessFeature7: "Werbe-Kampagnenmanagement",
                copyright: "&copy; 2025 Facebook AI Manager. Alle Rechte vorbehalten.",
                arabic: "العربية",
                english: "English",
                french: "Français",
                german: "Deutsch",
                spanish: "Español",
                comparisonTitle: "Funktionsvergleich",
                feature: "Funktion",
                dailyPosts: "Tägliche Beiträge",
                unlimited: "Unbegrenzt",
                facebookPages: "Facebook-Seiten",
                aiTools: "KI-Tools",
                aiImageGeneration: "KI-Bildgenerierung",
                advancedAnalytics: "Erweiterte Analysen",
                support: "Support",
                communitySupport: "Community",
                prioritySupport: "Priorität",
                dedicatedSupport: "Dediziert 24/7",
                teamManagement: "Team-Management",
                faqTitle: "Häufig gestellte Fragen",
                faq1Question: "Kann ich meinen Plan jederzeit ändern?",
                faq1Answer: "Ja, Sie können Ihren Plan jederzeit upgraden oder herabstufen. Änderungen gelten ab Beginn des nächsten Abrechnungszyklus.",
                faq2Question: "Gibt es eine kostenlose Testphase?",
                faq2Answer: "Ja, wir bieten eine 14-tägige kostenlose Testversion für den Premium-Plan an. Sie können Ihr Abonnement jederzeit während dieses Zeitraums kündigen.",
                faq3Question: "Welche Zahlungsmethoden sind verfügbar?",
                faq3Answer: "Wir akzeptieren alle gängigen Kreditkarten, PayPal und Banküberweisungen. Alle Transaktionen sind sicher und verschlüsselt.",
                faq4Question: "Kann ich mein Abonnement jederzeit kündigen?",
                faq4Answer: "Ja, Sie können Ihr Abonnement jederzeit über das Dashboard kündigen. Es werden keine zusätzlichen Gebühren berechnet.",
                faq5Question: "Sind meine Daten geschützt und sicher?",
                faq5Answer: "Ja, wir verwenden die neueste Verschlüsselungstechnologie, um Ihre Daten zu schützen. Alle Daten sind gemäß globalen Sicherheitsstandards geschützt.",
                selectedLanguage: "Deutsch",
                
                // Login page translations
                loginPageTitle: "Anmelden - Facebook AI Manager",
                usernameLabel: "Benutzername oder E-Mail",
                usernamePlaceholder: "Benutzernamen oder E-Mail eingeben",
                passwordLabel: "Passwort",
                passwordPlaceholder: "Passwort eingeben",
                loadingText: "Anmeldung läuft...",
                homeLink: "Startseite",
                createAccountLink: "Konto erstellen",
                forgotPasswordLink: "Passwort vergessen?",
                
                // Register page translations
                registerPageTitle: "Konto erstellen - Facebook AI Manager",
                fullNameLabel: "Vollständiger Name",
                fullNamePlaceholder: "Geben Sie Ihren vollständigen Namen ein",
                confirmPasswordLabel: "Passwort bestätigen",
                confirmPasswordPlaceholder: "Passwort bestätigen",
                registerButton: "Konto erstellen",
                
                // Subscription page translations
                subscriptionPageTitle: "Abonnementpläne - Facebook AI Manager",
                subscriptionTitle: "Abonnementpläne",
                subscriptionSubtitle: "Wählen Sie den Plan, der Ihren Bedürfnissen entspricht",
                
                // Payment page translations
                paymentPageTitle: "Zahlung - Facebook AI Manager",
                paymentTitle: "Zahlung abschließen",
                paymentSubtitle: "Schließen Sie den Zahlungsvorgang ab, um Ihr Premium-Abonnement zu aktivieren",
                orderSummary: "Bestellübersicht",
                selectedPlan: "Ausgewählter Plan:",
                duration: "Dauer:",
                oneMonth: "Ein Monat",
                price: "Preis:",
                tax: "Steuer:",
                total: "Gesamt:",
                creditCard: "Kreditkarte",
                paypal: "PayPal",
                bankTransfer: "Banküberweisung",
                cardNumberLabel: "Kartennummer",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDateLabel: "Ablaufdatum",
                expiryDatePlaceholder: "MM/JJ",
                cvvLabel: "Sicherheitscode (CVV)",
                cvvPlaceholder: "123",
                cardholderNameLabel: "Karteninhaber",
                cardholderNamePlaceholder: "Name wie auf der Karte aufgedruckt",
                billingEmailLabel: "Rechnungs-E-Mail",
                billingEmailPlaceholder: "ihre@email.com",
                completePaymentButton: "Zahlung abschließen - 29,00 $",
                processingPayment: "Zahlung wird verarbeitet...",
                securePayment: "Sichere und verschlüsselte Zahlung",
                sslProtection: "SSL-Schutz",
                moneyBackGuarantee: "Geld-zurück-Garantie",
                
                // Dashboard page translations
                dashboardPageTitle: "Dashboard - Facebook AI Manager",
                loadingUserInfo: "Wird geladen...",
                dashboardMenuItem: "Dashboard",
                scheduleMenuItem: "Planen",
                aiToolsMenuItem: "KI-Tools",
                analyticsMenuItem: "Analytik",
                autoResponseMenuItem: "Automatische Antwort",
                settingsMenuItem: "Einstellungen",
                logoutMenuItem: "Abmelden",
                dashboardTitle: "Dashboard",
                totalPosts: "Gesamtbeiträge",
                engagementRate: "Engagement-Rate",
                aiSuggestions: "KI-Vorschläge",
                scheduledPosts: "Geplante Beiträge",
                aiPostGeneratorTitle: "KI-Beitragsgenerator",
                postCategoryLabel: "Beitragskategorie",
                motivationalCategory: "Motivierend",
                businessCategory: "Geschäftlich",
                lifestyleCategory: "Lebensstil",
                educationalCategory: "Bildung",
                entertainmentCategory: "Unterhaltung",
                postToneLabel: "Ton",
                professionalTone: "Professionell",
                friendlyTone: "Freundlich",
                casualTone: "Lässig",
                inspirationalTone: "Inspirierend",
                customPromptLabel: "Benutzerdefinierte Beschreibung (optional)",
                customPromptPlaceholder: "Schreiben Sie eine benutzerdefinierte Beschreibung für den Beitrag...",
                generatePostButton: "Beitrag generieren",
                generatedPostTitle: "Generierter Beitrag:",
                publishToFacebookButton: "Auf Facebook veröffentlichen",
                saveAsDraftButton: "Als Entwurf speichern",
                recentPostsTitle: "Neueste Beiträge",
                noPostsMessage: "Noch keine Beiträge. Beginnen Sie mit der Erstellung eines neuen Beitrags!",
                aiChatTitle: "KI-Assistent",
                aiPermissionsLabel: "KI-Berechtigungen:",
                aiWelcomeMessage: "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
                aiChatPlaceholder: "Geben Sie Ihre Nachricht hier ein...",
                aiChatSendButton: "Senden",
                statusDraft: "Entwurf",
                statusPublished: "Veröffentlicht",
                dashboardMenuItem: "Dashboard",
                aiToolsMenuItem: "KI-Tools",
                facebookPagesMenuItem: "Facebook-Seiten",
                analyticsMenuItem: "Analytik",
                autoResponseMenuItem: "Automatische Antwort",
                settingsMenuItem: "Einstellungen",
                logoutMenuItem: "Abmelden",
                selectedLanguage: "Deutsch",
                aiDashboardTitle: "Persönlicher KI-Assistent - Facebook AI Manager",
                aiChatTitle: "Persönlicher KI-Assistent",
                aiPermissionsLabel: "KI-Berechtigungen:",
                aiWelcomeMessage: "Hallo! Ich bin Ihr persönlicher KI-Assistent. Wie kann ich Ihnen heute helfen?",
                aiChatPlaceholder: "Geben Sie Ihre Nachricht hier ein...",
                dashboardTitle: "Persönlicher KI-Assistent",
                totalPosts: "Gesamtbeiträge",
                engagementRate: "Engagement-Rate",
                connectedPages: "Verbundene Seiten",
                scheduledPosts: "Geplante Beiträge",
                aiPostGeneratorTitle: "KI-Beitragsgenerator",
                postCategoryLabel: "Beitragskategorie",
                motivationalCategory: "Motivierend",
                businessCategory: "Geschäftlich",
                lifestyleCategory: "Lebensstil",
                educationalCategory: "Bildung",
                entertainmentCategory: "Unterhaltung",
                postToneLabel: "Ton",
                professionalTone: "Professionell",
                friendlyTone: "Freundlich",
                casualTone: "Lässig",
                inspirationalTone: "Inspirierend",
                customPromptLabel: "Benutzerdefinierte Beschreibung (optional)",
                customPromptPlaceholder: "Schreiben Sie eine benutzerdefinierte Beschreibung für den Beitrag...",
                generatePostButton: "Beitrag generieren",
                generatedPostTitle: "Generierter Beitrag:",
                publishToFacebookButton: "Auf Facebook veröffentlichen",
                saveAsDraftButton: "Als Entwurf speichern",
                scheduleButton: "Planen",
                connectFacebookButton: "Neue Seite verbinden",
                updateAnalyticsButton: "Analysen aktualisieren",
                facebookPagesTitle: "Verbundene Facebook-Seiten",
                recentPostsTitle: "Neueste Beiträge",
                noConnectedPages: "Noch keine Seiten verbunden. Klicken Sie auf \"Neue Seite verbinden\", um Ihre Seite hinzuzufügen.",
                noPostsMessage: "Noch keine Beiträge. Beginnen Sie mit der Erstellung eines neuen Beitrags!",
                // Analytics dashboard translations
                analyticsDashboardTitle: "KI-Analytik - Facebook AI Manager",
                analyticsTitle: "KI-Analytik",
                timePeriodLabel: "Zeitraum:",
                dailyOption: "Täglich",
                weeklyOption: "Wöchentlich",
                monthlyOption: "Monatlich",
                refreshButton: "Aktualisieren",
                followerGrowth: "Follower-Wachstum",
                topPosts: "Top-Beiträge",
                loadingAnalytics: "Analytik wird geladen...",
                performanceCharts: "Leistungsdiagramme",
                topPerformingPosts: "Beste Beiträge nach Engagement",
                postContent: "Beitragsinhalt",
                likes: "Gefällt mir",
                shares: "Teilen",
                comments: "Kommentare",
                totalEngagement: "Gesamtengagement",
                noPostsData: "Keine Beitragsdaten",
                bestPostingTimes: "Beste Veröffentlichungszeiten",
                noTimeData: "Keine Zeitdaten",
                engagementScore: "Engagement-Score",
                // Auto-response dashboard translations
                autoResponseDashboardTitle: "Automatische Antwort - Facebook AI Manager",
                autoResponseTitle: "Automatische Antwort",
                autoResponseSettings: "Einstellungen für automatische Antwort",
                enableAutoResponse: "Automatische Antwort aktivieren:",
                saveSettings: "Einstellungen speichern",
                manageRules: "Regeln verwalten",
                keywords: "Schlüsselwörter (durch Kommas getrennt):",
                responseText: "Antworttext:",
                addRule: "Regel hinzufügen",
                noRules: "Keine Regeln definiert",
                recentAutoReplies: "Letzte automatische Antworten",
                comment: "Kommentar",
                keywordTriggered: "Ausgelöstes Schlüsselwort",
                aiResponse: "KI-Antwort",
                timestamp: "Zeitstempel",
                noResponses: "Keine automatischen Antworten",
                loadingData: "Daten werden geladen...",
                // Test page translations
                testPageTitle: "Sprachwechsel-Test",
                basicElementsTest: "Test der Basiselemente",
                basicElementsDesc: "Dieser Abschnitt testet Basiselemente wie Überschriften, Absätze und Schaltflächen",
                testButton: "Test-Schaltfläche",
                testLink: "Test-Link",
                formElementsTest: "Test der Formularelemente",
                testInputLabel: "Beschriftung des Eingabefelds",
                testInputPlaceholder: "Platzhaltertext",
                testSelectLabel: "Dropdown-Beschriftung",
                option1: "Erste Option",
                option2: "Zweite Option",
                listElementsTest: "Test der Listenelemente",
                listItem1: "Erstes Listenelement",
                listItem2: "Zweites Listenelement",
                resultsSection: "Testergebnisse",
                runTestButton: "Test ausführen"
            },
            es: {
                // Index page translations
                pageTitle: "Administrador de páginas de Facebook con IA - Facebook AI Manager",
                // Trending Topics Dashboard Translations
                trendingTopicsTitle: "Temas de tendencia en tu área - Facebook AI Manager",
                trendingTopicsMenuItem: "Temas de tendencia",
                refreshTopics: "Actualizar temas",
                fetchNewTopics: "Obtener nuevos temas",
                yourLocation: "Tu ubicación:",
                subscriptionType: "Tipo de suscripción:",
                lastUpdated: "Última actualización:",
                totalTopics: "Temas totales",
                generatedContent: "Contenido generado",
                publishedTopics: "Temas publicados",
                pendingReview: "Pendiente de revisión",
                loadingTopics: "Cargando temas...",
                trendingTopicsList: "Lista de temas de tendencia",
                generateAllContent: "Generar contenido para todos",
                topicTitle: "Título del tema",
                topicKeyword: "Palabra clave",
                status: "Estado",
                actions: "Acciones",
                noTopicsData: "No hay datos de temas",
                upgradeToAccess: "Actualiza para acceder",
                generatedContentPreview: "Vista previa del contenido generado",
                logoText: "Facebook AI Manager",
                home: "Inicio",
                dashboard: "Panel de control",
                login: "Iniciar sesión",
                register: "Registrarse",
                subscription: "Suscripción",
                payment: "Pago",
                logout: "Cerrar sesión",
                username: "Nombre de usuario o Email",
                password: "Contraseña",
                loginButton: "Iniciar sesión",
                loading: "Iniciando sesión...",
                forgotPassword: "¿Olvidaste la contraseña?",
                createAccount: "Crear cuenta",
                heroTitle: "Administrador de páginas de Facebook con IA",
                heroSubtitle: "Plataforma avanzada de IA para la gestión de páginas de Facebook",
                registerButton: "Crear cuenta",
                dashboardButton: "Panel de control",
                feature1Title: "Automatización inteligente",
                feature1Desc: "Crear y organizar contenido automáticamente usando IA avanzada",
                feature2Title: "Herramientas creativas",
                feature2Desc: "Crear publicaciones atractivas y contenido visual con ayuda de IA",
                feature3Title: "Análisis avanzados",
                feature3Desc: "Seguimiento del rendimiento y optimización de la estrategia en redes sociales",
                feature4Title: "Integración con Facebook",
                feature4Desc: "Gestión completa de páginas de Facebook con automatización total",
                aiFeatureTitle: "Creación de publicaciones con IA",
                aiFeatureSubtitle: "Crea automáticamente publicaciones atractivas de Facebook usando tecnología avanzada de IA",
                aiFeature1: "Crear publicaciones en múltiples categorías",
                aiFeature2: "Personalizar tono y estilo",
                aiFeature3: "Subir tus propias imágenes",
                aiFeature4: "Imágenes generadas por IA (premium)",
                aiFeature5: "Asistente de IA interactivo",
                aiFeature6: "Programación automática de páginas de Facebook",
                aiFeature7: "Automatización completa de gestión de páginas",
                aiFeature8: "Integración con el administrador de anuncios de Facebook (premium)",
                aiFeature9: "Enlaces de promoción de sitio web integrados",
                aiFeature10: "Plan gratuito: 2 publicaciones diarias",
                aiFeature11: "Premium: Publicaciones ilimitadas y funciones avanzadas",
                tryNowButton: "¡Pruébalo ahora - Gratis!",
                pricingTitle: "Planes de precios",
                freePlan: "Gratis",
                freeFeature1: "2 publicaciones diarias",
                freeFeature2: "Herramientas básicas de IA",
                freeFeature3: "Gestionar una página",
                freeFeature4: "Soporte comunitario",
                freeFeature5: "Plantillas básicas",
                startFreeButton: "Comenzar gratis",
                premiumPlan: "Premium",
                premiumFeature1: "Publicaciones ilimitadas",
                premiumFeature2: "Todas las herramientas de IA",
                premiumFeature3: "Gestionar múltiples páginas",
                premiumFeature4: "Análisis avanzados",
                premiumFeature5: "Soporte prioritario",
                premiumFeature6: "Plantillas personalizadas",
                premiumFeature7: "Programación avanzada",
                premiumFeature8: "Generación de imágenes por IA",
                businessPlan: "Empresas",
                businessFeature1: "Todo lo del plan Premium",
                businessFeature2: "Gestionar múltiples equipos",
                businessFeature3: "Análisis muy avanzados",
                businessFeature4: "Soporte dedicado 24/7",
                businessFeature5: "Integración con otras herramientas",
                businessFeature6: "Informes detallados",
                businessFeature7: "Gestión de campañas publicitarias",
                copyright: "&copy; 2025 Facebook AI Manager. Todos los derechos reservados.",
                arabic: "العربية",
                english: "English",
                french: "Français",
                german: "Deutsch",
                spanish: "Español",
                comparisonTitle: "Comparación de características",
                feature: "Característica",
                dailyPosts: "Publicaciones diarias",
                unlimited: "Ilimitado",
                facebookPages: "Páginas de Facebook",
                aiTools: "Herramientas de IA",
                aiImageGeneration: "Generación de imágenes por IA",
                advancedAnalytics: "Análisis avanzados",
                support: "Soporte",
                communitySupport: "Comunitario",
                prioritySupport: "Prioritario",
                dedicatedSupport: "Dedicado 24/7",
                teamManagement: "Gestión de equipos",
                faqTitle: "Preguntas frecuentes",
                faq1Question: "¿Puedo cambiar mi plan en cualquier momento?",
                faq1Answer: "Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán al inicio del próximo ciclo de facturación.",
                faq2Question: "¿Hay un período de prueba gratuito?",
                faq2Answer: "Sí, ofrecemos una prueba gratuita de 14 días para el plan Premium. Puedes cancelar tu suscripción en cualquier momento durante este período.",
                faq3Question: "¿Qué métodos de pago están disponibles?",
                faq3Answer: "Aceptamos todas las principales tarjetas de crédito, PayPal y transferencias bancarias. Todas las transacciones son seguras y encriptadas.",
                faq4Question: "¿Puedo cancelar mi suscripción en cualquier momento?",
                faq4Answer: "Sí, puedes cancelar tu suscripción en cualquier momento desde el panel de control. No se te cobrarán cargos adicionales.",
                faq5Question: "¿Mis datos están protegidos y seguros?",
                faq5Answer: "Sí, usamos la última tecnología de encriptación para proteger tus datos. Todos los datos están protegidos según los estándares de seguridad globales.",
                selectedLanguage: "Español",
                
                // Login page translations
                loginPageTitle: "Iniciar sesión - Facebook AI Manager",
                usernameLabel: "Nombre de usuario o Email",
                usernamePlaceholder: "Ingrese nombre de usuario o email",
                passwordLabel: "Contraseña",
                passwordPlaceholder: "Ingrese contraseña",
                loadingText: "Iniciando sesión...",
                homeLink: "Inicio",
                createAccountLink: "Crear cuenta",
                forgotPasswordLink: "¿Olvidaste la contraseña?",
                
                // Register page translations
                registerPageTitle: "Crear cuenta - Facebook AI Manager",
                fullNameLabel: "Nombre completo",
                fullNamePlaceholder: "Ingrese su nombre completo",
                confirmPasswordLabel: "Confirmar contraseña",
                confirmPasswordPlaceholder: "Confirme contraseña",
                registerButton: "Crear cuenta",
                
                // Subscription page translations
                subscriptionPageTitle: "Planes de suscripción - Facebook AI Manager",
                subscriptionTitle: "Planes de suscripción",
                subscriptionSubtitle: "Elige el plan que se adapte a tus necesidades",
                
                // Payment page translations
                paymentPageTitle: "Pago - Facebook AI Manager",
                paymentTitle: "Completar pago",
                paymentSubtitle: "Completa el proceso de pago para activar tu suscripción premium",
                orderSummary: "Resumen del pedido",
                selectedPlan: "Plan seleccionado:",
                duration: "Duración:",
                oneMonth: "Un mes",
                price: "Precio:",
                tax: "Impuesto:",
                total: "Total:",
                creditCard: "Tarjeta de crédito",
                paypal: "PayPal",
                bankTransfer: "Transferencia bancaria",
                cardNumberLabel: "Número de tarjeta",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDateLabel: "Fecha de vencimiento",
                expiryDatePlaceholder: "MM/AA",
                cvvLabel: "Código de seguridad (CVV)",
                cvvPlaceholder: "123",
                cardholderNameLabel: "Nombre del titular",
                cardholderNamePlaceholder: "Nombre como aparece en la tarjeta",
                billingEmailLabel: "Email de facturación",
                billingEmailPlaceholder: "tu@email.com",
                completePaymentButton: "Completar pago - $29.00",
                processingPayment: "Procesando pago...",
                securePayment: "Pago seguro y encriptado",
                sslProtection: "Protección SSL",
                moneyBackGuarantee: "Garantía de devolución de dinero",
                
                // Dashboard page translations
                dashboardPageTitle: "Panel de control - Facebook AI Manager",
                loadingUserInfo: "Cargando...",
                dashboardMenuItem: "Panel de control",
                scheduleMenuItem: "Programar",
                aiToolsMenuItem: "Herramientas de IA",
                analyticsMenuItem: "Analítica",
                autoResponseMenuItem: "Respuesta automática",
                settingsMenuItem: "Configuración",
                logoutMenuItem: "Cerrar sesión",
                dashboardTitle: "Panel de control",
                totalPosts: "Publicaciones totales",
                engagementRate: "Tasa de compromiso",
                aiSuggestions: "Sugerencias de IA",
                scheduledPosts: "Publicaciones programadas",
                aiPostGeneratorTitle: "Generador de publicaciones de IA",
                postCategoryLabel: "Categoría de publicación",
                motivationalCategory: "Motivacional",
                businessCategory: "Negocios",
                lifestyleCategory: "Estilo de vida",
                educationalCategory: "Educativo",
                entertainmentCategory: "Entretenimiento",
                postToneLabel: "Tono",
                professionalTone: "Profesional",
                friendlyTone: "Amigable",
                casualTone: "Casual",
                inspirationalTone: "Inspirador",
                customPromptLabel: "Descripción personalizada (Opcional)",
                customPromptPlaceholder: "Escribe una descripción personalizada para la publicación...",
                generatePostButton: "Generar publicación",
                generatedPostTitle: "Publicación generada:",
                publishToFacebookButton: "Publicar en Facebook",
                saveAsDraftButton: "Guardar como borrador",
                recentPostsTitle: "Publicaciones recientes",
                noPostsMessage: "Aún no hay publicaciones. ¡Comienza creando una nueva publicación!",
                aiChatTitle: "Asistente de IA",
                aiPermissionsLabel: "Permisos de IA:",
                aiWelcomeMessage: "¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?",
                aiChatPlaceholder: "Escribe tu mensaje aquí...",
                aiChatSendButton: "Enviar",
                statusDraft: "Borrador",
                statusPublished: "Publicado",
                dashboardMenuItem: "Panel de control",
                aiToolsMenuItem: "Herramientas de IA",
                facebookPagesMenuItem: "Páginas de Facebook",
                analyticsMenuItem: "Analítica",
                autoResponseMenuItem: "Respuesta automática",
                settingsMenuItem: "Configuración",
                logoutMenuItem: "Cerrar sesión",
                selectedLanguage: "Español",
                aiDashboardTitle: "Asistente de IA Personal - Facebook AI Manager",
                aiChatTitle: "Asistente de IA Personal",
                aiPermissionsLabel: "Permisos de IA:",
                aiWelcomeMessage: "¡Hola! Soy tu asistente de IA personal. ¿Cómo puedo ayudarte hoy?",
                aiChatPlaceholder: "Escribe tu mensaje aquí...",
                dashboardTitle: "Asistente de IA Personal",
                totalPosts: "Publicaciones totales",
                engagementRate: "Tasa de compromiso",
                connectedPages: "Páginas conectadas",
                scheduledPosts: "Publicaciones programadas",
                aiPostGeneratorTitle: "Generador de publicaciones de IA",
                postCategoryLabel: "Categoría de publicación",
                motivationalCategory: "Motivacional",
                businessCategory: "Negocios",
                lifestyleCategory: "Estilo de vida",
                educationalCategory: "Educativo",
                entertainmentCategory: "Entretenimiento",
                postToneLabel: "Tono",
                professionalTone: "Profesional",
                friendlyTone: "Amigable",
                casualTone: "Casual",
                inspirationalTone: "Inspirador",
                customPromptLabel: "Descripción personalizada (Opcional)",
                customPromptPlaceholder: "Escribe una descripción personalizada para la publicación...",
                generatePostButton: "Generar publicación",
                generatedPostTitle: "Publicación generada:",
                publishToFacebookButton: "Publicar en Facebook",
                saveAsDraftButton: "Guardar como borrador",
                scheduleButton: "Programar",
                connectFacebookButton: "Conectar nueva página",
                updateAnalyticsButton: "Actualizar análisis",
                facebookPagesTitle: "Páginas de Facebook conectadas",
                recentPostsTitle: "Publicaciones recientes",
                noConnectedPages: "Aún no hay páginas conectadas. Haz clic en \"Conectar nueva página\" para agregar tu página.",
                noPostsMessage: "Aún no hay publicaciones. ¡Comienza creando una nueva publicación!",
                // Analytics dashboard translations
                analyticsDashboardTitle: "Analítica de IA - Facebook AI Manager",
                analyticsTitle: "Analítica de IA",
                timePeriodLabel: "Período de tiempo:",
                dailyOption: "Diario",
                weeklyOption: "Semanal",
                monthlyOption: "Mensual",
                refreshButton: "Actualizar",
                followerGrowth: "Crecimiento de seguidores",
                topPosts: "Mejores publicaciones",
                loadingAnalytics: "Cargando analítica...",
                performanceCharts: "Gráficos de rendimiento",
                topPerformingPosts: "Mejores publicaciones por compromiso",
                postContent: "Contenido de la publicación",
                likes: "Me gusta",
                shares: "Compartidos",
                comments: "Comentarios",
                totalEngagement: "Compromiso total",
                noPostsData: "No hay datos de publicaciones",
                bestPostingTimes: "Mejores momentos para publicar",
                noTimeData: "No hay datos de tiempo",
                engagementScore: "Puntaje de compromiso",
                // Auto-response dashboard translations
                autoResponseDashboardTitle: "Respuesta automática - Facebook AI Manager",
                autoResponseTitle: "Respuesta automática",
                autoResponseSettings: "Configuración de respuesta automática",
                enableAutoResponse: "Habilitar respuesta automática:",
                saveSettings: "Guardar configuración",
                manageRules: "Gestionar reglas",
                keywords: "Palabras clave (separadas por comas):",
                responseText: "Texto de respuesta:",
                addRule: "Agregar regla",
                noRules: "No hay reglas definidas",
                recentAutoReplies: "Respuestas automáticas recientes",
                comment: "Comentario",
                keywordTriggered: "Palabra clave activada",
                aiResponse: "Respuesta de IA",
                timestamp: "Marca de tiempo",
                noResponses: "No hay respuestas automáticas",
                loadingData: "Cargando datos...",
                // Test page translations
                testPageTitle: "Test de cambio de idioma",
                basicElementsTest: "Test de elementos básicos",
                basicElementsDesc: "Esta sección prueba elementos básicos como títulos, párrafos y botones",
                testButton: "Botón de prueba",
                testLink: "Enlace de prueba",
                formElementsTest: "Test de elementos de formulario",
                testInputLabel: "Etiqueta de campo de entrada",
                testInputPlaceholder: "Texto de marcador de posición",
                testSelectLabel: "Etiqueta de menú desplegable",
                option1: "Opción 1",
                option2: "Opción 2",
                listElementsTest: "Test de elementos de lista",
                listItem1: "Elemento de lista 1",
                listItem2: "Elemento de lista 2",
                resultsSection: "Resultados del test",
                runTestButton: "Ejecutar test"
            },
            ru: {
                // Index page translations
                pageTitle: "Менеджер страниц Facebook с ИИ - Facebook AI Manager",
                logoText: "Facebook AI Manager",
                home: "Главная",
                dashboard: "Панель управления",
                login: "Войти",
                register: "Регистрация",
                subscription: "Подписка",
                payment: "Оплата",
                logout: "Выйти",
                username: "Имя пользователя или Email",
                password: "Пароль",
                loginButton: "Войти",
                loading: "Вход...",
                forgotPassword: "Забыли пароль?",
                createAccount: "Создать аккаунт",
                heroTitle: "Менеджер страниц Facebook с ИИ",
                heroSubtitle: "Продвинутая платформа ИИ для управления страницами Facebook",
                registerButton: "Создать аккаунт",
                dashboardButton: "Панель управления",
                
                // Features
                feature1Title: "Умная автоматизация",
                feature1Desc: "Автоматическое создание и организация контента с помощью продвинутого ИИ",
                feature2Title: "Творческие инструменты",
                feature2Desc: "Создавайте привлекательные посты и визуальный контент с помощью ИИ",
                feature3Title: "Продвинутая аналитика",
                feature3Desc: "Отслеживайте производительность и оптимизируйте стратегию в социальных сетях",
                feature4Title: "Интеграция с Facebook",
                feature4Desc: "Полное управление страницами Facebook с полной автоматизацией",
                
                // AI Features
                aiFeatureTitle: "Создание постов с помощью ИИ",
                aiFeatureSubtitle: "Автоматически создавайте привлекательные посты для Facebook с помощью продвинутой технологии ИИ",
                aiFeature1: "Создание постов в нескольких категориях",
                aiFeature2: "Настройка тона и стиля",
                aiFeature3: "Загрузка собственных изображений",
                aiFeature4: "Изображения, созданные ИИ (премиум)",
                aiFeature5: "Интерактивный ИИ-ассистент",
                aiFeature6: "Автоматическое планирование страниц Facebook",
                aiFeature7: "Полная автоматизация управления страницами",
                aiFeature8: "Интеграция с менеджером рекламы Facebook (премиум)",
                aiFeature9: "Встроенные ссылки для продвижения сайта",
                aiFeature10: "Бесплатный план: 2 поста в день",
                aiFeature11: "Премиум: Неограниченные посты и продвинутые функции",
                tryNowButton: "Попробуйте сейчас - Бесплатно!",
                
                // Pricing
                pricingTitle: "Тарифные планы",
                freePlan: "Бесплатно",
                freeFeature1: "2 поста в день",
                freeFeature2: "Базовые инструменты ИИ",
                freeFeature3: "Управление одной страницей",
                freeFeature4: "Поддержка сообщества",
                freeFeature5: "Базовые шаблоны",
                startFreeButton: "Начать бесплатно",
                
                premiumPlan: "Премиум",
                premiumFeature1: "Неограниченные посты",
                premiumFeature2: "Все инструменты ИИ",
                premiumFeature3: "Управление несколькими страницами",
                premiumFeature4: "Продвинутая аналитика",
                premiumFeature5: "Приоритетная поддержка",
                premiumFeature6: "Пользовательские шаблоны",
                premiumFeature7: "Продвинутое планирование",
                premiumFeature8: "Генерация изображений ИИ",
                
                businessPlan: "Бизнес",
                businessFeature1: "Все из премиум-плана",
                businessFeature2: "Управление несколькими командами",
                businessFeature3: "Очень продвинутая аналитика",
                businessFeature4: "Выделенная поддержка 24/7",
                businessFeature5: "Интеграция с другими инструментами",
                businessFeature6: "Подробные отчеты",
                businessFeature7: "Управление рекламными кампаниями",
                
                // Languages
                arabic: "العربية",
                english: "English",
                french: "Français",
                german: "Deutsch",
                spanish: "Español",
                russian: "Русский",
                selectedLanguage: "Русский",
                
                // Dashboard
                dashboardPageTitle: "Панель управления - Facebook AI Manager",
                dashboardTitle: "Панель управления",
                dashboardMenuItem: "Панель управления",
                aiToolsMenuItem: "Инструменты ИИ",
                facebookPagesMenuItem: "Страницы Facebook",
                analyticsMenuItem: "Аналитика",
                autoResponseMenuItem: "Автоответ",
                settingsMenuItem: "Настройки",
                logoutMenuItem: "Выйти",
                
                // Stats
                totalPosts: "Всего постов",
                engagementRate: "Уровень вовлеченности",
                connectedPages: "Подключенные страницы",
                scheduledPosts: "Запланированные посты",
                
                // AI Dashboard
                aiDashboardTitle: "Личный ИИ-ассистент - Facebook AI Manager",
                aiChatTitle: "Личный ИИ-ассистент",
                aiPermissionsLabel: "Разрешения ИИ:",
                aiWelcomeMessage: "Здравствуйте! Я ваш личный ИИ-ассистент. Как я могу помочь вам сегодня?",
                aiChatPlaceholder: "Введите ваше сообщение здесь...",
                aiChatSendButton: "Отправить",
                
                // Post Generator
                aiPostGeneratorTitle: "Генератор постов ИИ",
                postCategoryLabel: "Категория поста",
                motivationalCategory: "Мотивационный",
                businessCategory: "Бизнес",
                lifestyleCategory: "Образ жизни",
                educationalCategory: "Образовательный",
                entertainmentCategory: "Развлечения",
                
                postToneLabel: "Тон",
                professionalTone: "Профессиональный",
                friendlyTone: "Дружелюбный",
                casualTone: "Непринужденный",
                inspirationalTone: "Вдохновляющий",
                
                customPromptLabel: "Пользовательское описание (необязательно)",
                customPromptPlaceholder: "Напишите пользовательское описание для поста...",
                generatePostButton: "Создать пост",
                generatedPostTitle: "Созданный пост:",
                publishToFacebookButton: "Опубликовать в Facebook",
                saveAsDraftButton: "Сохранить как черновик",
                scheduleButton: "Запланировать",
                
                // Facebook Pages
                facebookPagesTitle: "Подключенные страницы Facebook",
                connectFacebookButton: "Подключить новую страницу",
                updateAnalyticsButton: "Обновить аналитику",
                noConnectedPages: "Пока нет подключенных страниц. Нажмите \"Подключить новую страницу\", чтобы добавить свою страницу.",
                
                // Posts
                recentPostsTitle: "Последние посты",
                noPostsMessage: "Пока нет постов. Начните с создания нового поста!",
                statusDraft: "Черновик",
                statusPublished: "Опубликовано",
                statusScheduled: "Запланировано",
                
                // Analytics
                analyticsDashboardTitle: "ИИ Аналитика - Facebook AI Manager",
                analyticsTitle: "ИИ Аналитика",
                timePeriodLabel: "Период времени:",
                dailyOption: "Ежедневно",
                weeklyOption: "Еженедельно",
                monthlyOption: "Ежемесячно",
                refreshButton: "Обновить",
                followerGrowth: "Рост подписчиков",
                topPosts: "Лучшие посты",
                loadingAnalytics: "Загрузка аналитики...",
                performanceCharts: "Графики производительности",
                topPerformingPosts: "Лучшие посты по вовлеченности",
                postContent: "Содержание поста",
                likes: "Лайки",
                shares: "Репосты",
                comments: "Комментарии",
                totalEngagement: "Общая вовлеченность",
                noPostsData: "Нет данных о постах",
                bestPostingTimes: "Лучшее время для публикации",
                noTimeData: "Нет данных о времени",
                engagementScore: "Оценка вовлеченности",
                
                // Auto-response
                autoResponseDashboardTitle: "Автоответ - Facebook AI Manager",
                autoResponseTitle: "Автоответ",
                autoResponseSettings: "Настройки автоответа",
                enableAutoResponse: "Включить автоответ:",
                saveSettings: "Сохранить настройки",
                manageRules: "Управление правилами",
                keywords: "Ключевые слова (через запятую):",
                responseText: "Текст ответа:",
                addRule: "Добавить правило",
                noRules: "Правила не определены",
                recentAutoReplies: "Последние автоответы",
                comment: "Комментарий",
                keywordTriggered: "Сработавшее ключевое слово",
                aiResponse: "Ответ ИИ",
                timestamp: "Время",
                noResponses: "Нет автоответов",
                loadingData: "Загрузка данных...",
                
                // Login
                loginPageTitle: "Вход - Facebook AI Manager",
                usernameLabel: "Имя пользователя или Email",
                usernamePlaceholder: "Введите имя пользователя или email",
                passwordLabel: "Пароль",
                passwordPlaceholder: "Введите пароль",
                loadingText: "Вход...",
                homeLink: "Главная",
                createAccountLink: "Создать аккаунт",
                forgotPasswordLink: "Забыли пароль?",
                
                // Register
                registerPageTitle: "Создать аккаунт - Facebook AI Manager",
                fullNameLabel: "Полное имя",
                fullNamePlaceholder: "Введите ваше полное имя",
                confirmPasswordLabel: "Подтвердите пароль",
                confirmPasswordPlaceholder: "Подтвердите пароль",
                
                // Subscription
                subscriptionPageTitle: "Тарифные планы - Facebook AI Manager",
                subscriptionTitle: "Тарифные планы",
                subscriptionSubtitle: "Выберите план, который соответствует вашим потребностям",
                
                // Payment
                paymentPageTitle: "Оплата - Facebook AI Manager",
                paymentTitle: "Завершить оплату",
                paymentSubtitle: "Завершите процесс оплаты, чтобы активировать премиум-подписку",
                orderSummary: "Сводка заказа",
                selectedPlan: "Выбранный план:",
                duration: "Длительность:",
                oneMonth: "Один месяц",
                price: "Цена:",
                tax: "Налог:",
                total: "Итого:",
                creditCard: "Кредитная карта",
                paypal: "PayPal",
                bankTransfer: "Банковский перевод",
                cardNumberLabel: "Номер карты",
                cardNumberPlaceholder: "1234 5678 9012 3456",
                expiryDateLabel: "Срок действия",
                expiryDatePlaceholder: "ММ/ГГ",
                cvvLabel: "Код безопасности (CVV)",
                cvvPlaceholder: "123",
                cardholderNameLabel: "Имя владельца карты",
                cardholderNamePlaceholder: "Имя как на карте",
                billingEmailLabel: "Email для выставления счета",
                billingEmailPlaceholder: "ваш@email.com",
                completePaymentButton: "Завершить оплату - $29.00",
                processingPayment: "Обработка платежа...",
                securePayment: "Безопасный и зашифрованный платеж",
                sslProtection: "SSL защита",
                moneyBackGuarantee: "Гарантия возврата денег",
                
                // Trending Topics
                trendingTopicsTitle: "Трендовые темы в вашем регионе - Facebook AI Manager",
                trendingTopicsMenuItem: "Трендовые темы",
                refreshTopics: "Обновить темы",
                fetchNewTopics: "Получить новые темы",
                yourLocation: "Ваше местоположение:",
                subscriptionType: "Тип подписки:",
                lastUpdated: "Последнее обновление:",
                totalTopics: "Всего тем",
                generatedContent: "Созданный контент",
                publishedTopics: "Опубликованные темы",
                pendingReview: "Ожидает проверки",
                loadingTopics: "Загрузка тем...",
                trendingTopicsList: "Список трендовых тем",
                generateAllContent: "Создать контент для всех",
                topicTitle: "Название темы",
                topicKeyword: "Ключевое слово",
                status: "Статус",
                actions: "Действия",
                noTopicsData: "Нет данных о темах",
                upgradeToAccess: "Обновите для доступа",
                generatedContentPreview: "Предпросмотр созданного контента",
                
                // FAQ
                faqTitle: "Часто задаваемые вопросы",
                faq1Question: "Могу ли я изменить свой план в любое время?",
                faq1Answer: "Да, вы можете повысить или понизить свой план в любое время. Изменения вступят в силу в начале следующего платежного цикла.",
                faq2Question: "Есть ли бесплатный пробный период?",
                faq2Answer: "Да, мы предлагаем 14-дневный бесплатный пробный период для премиум-плана. Вы можете отменить подписку в любое время в течение этого периода.",
                faq3Question: "Какие способы оплаты доступны?",
                faq3Answer: "Мы принимаем все основные кредитные карты, PayPal и банковские переводы. Все транзакции безопасны и зашифрованы.",
                faq4Question: "Могу ли я отменить подписку в любое время?",
                faq4Answer: "Да, вы можете отменить подписку в любое время из панели управления. С вас не будет взиматься дополнительная плата.",
                faq5Question: "Защищены ли мои данные и безопасны?",
                faq5Answer: "Да, мы используем новейшую технологию шифрования для защиты ваших данных. Все данные защищены в соответствии с мировыми стандартами безопасности.",
                
                // Comparison
                comparisonTitle: "Сравнение функций",
                feature: "Функция",
                dailyPosts: "Ежедневные посты",
                unlimited: "Неограниченно",
                facebookPages: "Страницы Facebook",
                aiTools: "Инструменты ИИ",
                aiImageGeneration: "Генерация изображений ИИ",
                advancedAnalytics: "Продвинутая аналитика",
                support: "Поддержка",
                communitySupport: "Сообщество",
                prioritySupport: "Приоритетная",
                dedicatedSupport: "Выделенная 24/7",
                teamManagement: "Управление командой",
                
                // Copyright
                copyright: "&copy; 2025 Facebook AI Manager. Все права защищены."
            }
        };
        
        const t = translations[lang] || translations['ar'];
        
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (t[key]) {
                // Special handling for title element
                if (element.tagName === 'TITLE') {
                    element.textContent = t[key];
                } else {
                    element.textContent = t[key];
                }
            }
        });
        
        // Update placeholders
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
            const key = input.getAttribute('data-translate');
            if (key && t[key]) {
                input.placeholder = t[key];
            }
        });
        
        // Update select options
        document.querySelectorAll('option[data-translate]').forEach(option => {
            const key = option.getAttribute('data-translate');
            if (t[key]) {
                option.textContent = t[key];
            }
        });
        
        // Update title attribute
        const titleElement = document.querySelector('title');
        if (titleElement) {
            const titleKey = titleElement.getAttribute('data-translate');
            if (titleKey && t[titleKey]) {
                titleElement.textContent = t[titleKey];
            } else if (t.pageTitle) {
                titleElement.textContent = t.pageTitle;
            }
        }
    }
    
    // Update language display
    function updateLanguageDisplay(lang) {
        const langOption = document.querySelector(`.language-option[data-lang="${lang}"]`);
        
        if (langOption) {
            const flagSrc = langOption.querySelector('img').src;
            const langText = langOption.querySelector('span').textContent;
            
            const flagElement = selectedLanguage.querySelector('img');
            const textElement = selectedLanguage.querySelector('span');
            
            if (flagElement) {
                flagElement.src = `flags/${lang}.svg`;
                flagElement.alt = langText;
            }
            
            if (textElement) {
                textElement.textContent = langText;
            }
        }
    }
    
    // Save language preference to localStorage
    function saveLanguagePreference(lang) {
        localStorage.setItem('preferredLanguage', lang);
    }
    
    // Update page direction based on language
    function updatePageDirection(lang) {
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = lang;
        }
    }
    
    // Update login page specific content
    function updateLoginPageContent(lang) {
        const translations = {
            en: {
                username: 'Username or Email',
                password: 'Password',
                loginButton: 'Login',
                forgotPassword: 'Forgot Password?',
                createAccount: 'Create Account',
                home: 'Home',
                loading: 'Logging in...',
                loginSuccess: 'Login successful! Redirecting...',
                loginError: 'Login error. Please try again.',
                connectionError: 'Connection error. Please check your internet connection and try again.'
            },
            ar: {
                username: 'اسم المستخدم أو البريد الإلكتروني',
                password: 'كلمة المرور',
                loginButton: 'تسجيل الدخول',
                forgotPassword: 'نسيت كلمة المرور؟',
                createAccount: 'إنشاء حساب',
                home: 'الرئيسية',
                loading: 'جاري تسجيل الدخول...',
                loginSuccess: 'تم تسجيل الدخول بنجاح! جاري التوجيه...',
                loginError: 'خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.',
                connectionError: 'حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
            },
            fr: {
                username: 'Nom d\'utilisateur ou Email',
                password: 'Mot de passe',
                loginButton: 'Connexion',
                forgotPassword: 'Mot de passe oublié?',
                createAccount: 'Créer un compte',
                home: 'Accueil',
                loading: 'Connexion en cours...',
                loginSuccess: 'Connexion réussie! Redirection...',
                loginError: 'Erreur de connexion. Veuillez réessayer.',
                connectionError: 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.'
            },
            de: {
                username: 'Benutzername oder E-Mail',
                password: 'Passwort',
                loginButton: 'Anmelden',
                forgotPassword: 'Passwort vergessen?',
                createAccount: 'Konto erstellen',
                home: 'Startseite',
                loading: 'Anmeldung läuft...',
                loginSuccess: 'Anmeldung erfolgreich! Weiterleitung...',
                loginError: 'Anmeldefehler. Bitte versuchen Sie es erneut.',
                connectionError: 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
            },
            es: {
                username: 'Nombre de usuario o Email',
                password: 'Contraseña',
                loginButton: 'Iniciar sesión',
                forgotPassword: '¿Olvidaste la contraseña?',
                createAccount: 'Crear cuenta',
                home: 'Inicio',
                loading: 'Iniciando sesión...',
                loginSuccess: '¡Inicio de sesión exitoso! Redirigiendo...',
                loginError: 'Error de inicio de sesión. Por favor, inténtalo de nuevo.',
                connectionError: 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.'
            },
            ru: {
                username: 'Имя пользователя или Email',
                password: 'Пароль',
                loginButton: 'Войти',
                forgotPassword: 'Забыли пароль?',
                createAccount: 'Создать аккаунт',
                home: 'Главная',
                loading: 'Вход...',
                loginSuccess: 'Вход выполнен успешно! Перенаправление...',
                loginError: 'Ошибка входа. Пожалуйста, попробуйте снова.',
                connectionError: 'Ошибка подключения. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.'
            }
        };
        
        const t = translations[lang] || translations['ar'];
        
        // Update form labels and placeholders
        const usernameLabel = document.querySelector('label[for="username"]');
        const passwordLabel = document.querySelector('label[for="password"]');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginButton = document.querySelector('.btn-primary');
        const loginText = document.getElementById('login-text');
        const loadingText = document.getElementById('loading');
        
        if (usernameLabel) usernameLabel.textContent = t.username;
        if (passwordLabel) passwordLabel.textContent = t.password;
        if (usernameInput) usernameInput.placeholder = t.username;
        if (passwordInput) passwordInput.placeholder = t.password;
        if (loginText) loginText.textContent = t.loginButton;
        if (loadingText) loadingText.innerHTML = `<i class="fas fa-spinner"></i> ${t.loading}`;
        
        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        const navTexts = [t.home, 'Dashboard', 'Register'];
        navLinks.forEach((link, index) => {
            if (navTexts[index]) {
                link.textContent = navTexts[index];
            }
        });
        
        // Update footer links
        const footerLinks = document.querySelectorAll('.footer-links a');
        const footerTexts = [t.home, 'Dashboard', 'Subscription', 'Payment'];
        footerLinks.forEach((link, index) => {
            if (footerTexts[index]) {
                link.textContent = footerTexts[index];
            }
        });
        
        // Update other links
        const otherLinks = document.querySelectorAll('.links a');
        if (otherLinks.length >= 3) {
            otherLinks[0].textContent = t.home;
            otherLinks[1].textContent = t.createAccount;
            otherLinks[2].textContent = t.forgotPassword;
        }
    }
    
    // Update dashboard specific content
    function updateDashboardContent(lang) {
        // Update sidebar menu items
        const menuItems = document.querySelectorAll('.menu-item span');
        if (menuItems.length > 0) {
            const dashboardTranslations = {
                en: ['Dashboard', 'Schedule', 'AI Tools', 'Analytics', 'Auto-Response', 'Settings', 'Logout'],
                ar: ['لوحة التحكم', 'جدولة', 'أدوات الذكاء الاصطناعي', 'تحليلات', 'الرد التلقائي', 'إعدادات', 'تسجيل الخروج'],
                fr: ['Tableau de bord', 'Planifier', 'Outils IA', 'Analytique', 'Réponse automatique', 'Paramètres', 'Déconnexion'],
                de: ['Dashboard', 'Planen', 'KI-Tools', 'Analytik', 'Automatische Antwort', 'Einstellungen', 'Abmelden'],
                es: ['Panel de control', 'Programar', 'Herramientas de IA', 'Analítica', 'Respuesta automática', 'Configuración', 'Cerrar sesión'],
                ru: ['Панель управления', 'Планировать', 'Инструменты ИИ', 'Аналитика', 'Автоответ', 'Настройки', 'Выйти']
            };
            
            const translations = dashboardTranslations[lang] || dashboardTranslations['ar'];
            menuItems.forEach((item, index) => {
                if (index < translations.length) {
                    item.textContent = translations[index];
                }
            });
        }
        
        // Update dashboard cards
        const cardTitles = document.querySelectorAll('.card-title');
        if (cardTitles.length > 0) {
            const cardTranslations = {
                en: ['Total Posts', 'Engagement', 'AI Suggestions', 'Scheduled Posts'],
                ar: ['إجمالي المنشورات', 'معدل التفاعل', 'اقتراحات الذكاء الاصطناعي', 'المنشورات المجدولة'],
                fr: ['Total des publications', 'Engagement', 'Suggestions IA', 'Publications planifiées'],
                de: ['Gesamtbeiträge', 'Engagement', 'KI-Vorschläge', 'Geplante Beiträge'],
                es: ['Publicaciones totales', 'Compromiso', 'Sugerencias de IA', 'Publicaciones programadas'],
                ru: ['Всего постов', 'Вовлеченность', 'Предложения ИИ', 'Запланированные посты']
            };
            
            const translations = cardTranslations[lang] || cardTranslations['ar'];
            cardTitles.forEach((title, index) => {
                if (index < translations.length) {
                    title.textContent = translations[index];
                }
            });
        }
        
        // Update dashboard section titles (only for dashboard page)
        if (window.location.pathname.includes('dashboard.html') || window.location.pathname === '/dashboard.html') {
            const sectionTitles = document.querySelectorAll('h2');
            if (sectionTitles.length > 0) {
                const sectionTranslations = {
                    en: ['Upcoming Posts', 'AI Post Generator', 'AI Assistant', 'AI Page Management Automation'],
                    ar: ['المنشورات القادمة', 'مولد منشورات الذكاء الاصطناعي', 'المساعد الذكي', 'أتمتة إدارة الصفحة بالذكاء الاصطناعي'],
                    fr: ['Publications à venir', 'Générateur de publications IA', 'Assistant IA', 'Automatisation de la gestion de page IA'],
                    de: ['Bevorstehende Beiträge', 'KI-Beitragsgenerator', 'KI-Assistent', 'KI-Seitenverwaltungsautomatisierung'],
                    es: ['Próximas publicaciones', 'Generador de publicaciones de IA', 'Asistente de IA', 'Automatización de gestión de página de IA'],
                    ru: ['Предстоящие посты', 'Генератор постов ИИ', 'ИИ-ассистент', 'Автоматизация управления страницами ИИ']
                };
                
                const translations = sectionTranslations[lang] || sectionTranslations['ar'];
                sectionTitles.forEach((title, index) => {
                    if (index < translations.length) {
                        title.textContent = translations[index];
                    }
                });
            }
        }
    }
    
    // Update auto-response dashboard specific content
    function updateAutoResponseDashboardContent(lang) {
        // This function can be expanded if needed for specific auto-response dashboard updates
        // For now, it's just a placeholder to ensure the function exists
    }
}