// Enable all features for paid users on AI Dashboard
window.pageAccess = 'paid';

// AI Dashboard functionality
let currentUser = null;
let userPosts = [];
let facebookPages = [];
let aiChatMessages = [];
let aiPermissionsEnabled = false;
let selectedImage = null;

// Image upload functionality
function initializeImageUpload() {
    const imageUploadBtn = document.getElementById('image-upload-btn');
    const postImage = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageUploadBtn && postImage && imagePreview) {
        imageUploadBtn.addEventListener('click', function() {
            postImage.click();
        });
        
        postImage.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                selectedImage = e.target.files[0];
                
                reader.onload = function(e) {
                    imagePreview.innerHTML = '';
                    imagePreview.classList.remove('empty');
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    imagePreview.appendChild(img);
                };
                
                reader.readAsDataURL(selectedImage);
            }
        });
    }
}

// AI Chat functionality
function initializeAIChat() {
    const aiChatInput = document.getElementById('ai-chat-input');
    const generateBtn = document.getElementById('generate-btn');
    const aiChatMessages = document.querySelector('.ai-chat-messages');
    const aiResults = document.getElementById('ai-results');
    const resultsCount = document.getElementById('results-count');
    const postStyle = document.getElementById('post-style');
    const postLanguage = document.getElementById('post-language');
    const settingsToggle = document.getElementById('settings-toggle');
    const chatOptions = document.getElementById('ai-chat-options');
    
    if (aiChatInput && generateBtn && aiChatMessages) {
        generateBtn.addEventListener('click', function() {
            generateContent();
        });
        
        aiChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateContent();
            }
        });
        
        // Options dropdown toggle
        if (settingsToggle && chatOptions) {
            // Ensure options panel is initially closed
            chatOptions.classList.remove('open');
            
            // Remove any existing event listeners to prevent duplicates
            const newSettingsToggle = settingsToggle.cloneNode(true);
            settingsToggle.parentNode.replaceChild(newSettingsToggle, settingsToggle);
            
            // Add event listener to the new button
            newSettingsToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = chatOptions.classList.toggle('open');
                newSettingsToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                console.log('Settings panel toggled:', isOpen ? 'open' : 'closed');
            });
            
            // Close settings when clicking outside
            document.addEventListener('click', function(e) {
                if (!chatOptions.contains(e.target) && e.target !== newSettingsToggle) {
                    chatOptions.classList.remove('open');
                    newSettingsToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }
}

function generateContent() {
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatMessages = document.querySelector('.ai-chat-messages');
    const aiResults = document.getElementById('ai-results');
    const resultsCount = document.getElementById('results-count');
    const postStyle = document.getElementById('post-style');
    const postLanguage = document.getElementById('post-language');
    const generateBtn = document.getElementById('generate-btn');
    
    const message = aiChatInput.value.trim();
    if (!message) return;
    
    // Disable send button to prevent multiple submissions
    generateBtn.disabled = true;
    
    // Add user message
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'user-message';
    userMessageElement.textContent = message;
    aiChatMessages.appendChild(userMessageElement);
    
    // Clear input
    aiChatInput.value = '';
    
    // Scroll to bottom
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    
    // Show loading message
    const loadingElement = document.createElement('div');
    loadingElement.className = 'ai-message';
    loadingElement.innerHTML = '<div class="loading-animation"><span>.</span><span>.</span><span>.</span></div>';
    aiChatMessages.appendChild(loadingElement);
    
    // Clear previous results
    aiResults.innerHTML = '';
    
    // Get selected options
    const count = parseInt(resultsCount.value);
    const style = postStyle ? postStyle.options[postStyle.selectedIndex].text : 'عام';
    const language = postLanguage ? getLanguageName(postLanguage.value) : 'العربية';
    
    // Store message context for API
    const context = aiChatMessages.length > 0 ? 
        Array.from(aiChatMessages.querySelectorAll('.ai-message, .user-message'))
            .slice(-6)
            .map(el => ({
                role: el.classList.contains('user-message') ? 'user' : 'assistant',
                content: el.textContent
            })) : [];
    
    // Call the actual API endpoint
    fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            context: context,
            options: {
                count: count,
                style: style,
                language: language
            }
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Remove loading message
        aiChatMessages.removeChild(loadingElement);
        
        if (data.success) {
            // Add AI response message
            const aiMessageElement = document.createElement('div');
            aiMessageElement.className = 'ai-message';
            aiMessageElement.textContent = data.response;
            aiChatMessages.appendChild(aiMessageElement);
            
            // Generate AI results if available
            if (data.results && Array.isArray(data.results)) {
                for (let i = 0; i < data.results.length; i++) {
                    generateAIResult(data.results[i], style, i + 1);
                }
            }
        } else {
            // Show error message
            const errorElement = document.createElement('div');
            errorElement.className = 'ai-message error';
            errorElement.textContent = data.error || 'حدث خطأ أثناء معالجة طلبك';
            aiChatMessages.appendChild(errorElement);
            console.error('AI chat error:', data.error);
        }
    })
    .catch(error => {
        console.error('Error sending chat message:', error);
        
        // Remove loading message
        if (loadingElement.parentNode) {
            aiChatMessages.removeChild(loadingElement);
        }
        
        // Show user-friendly error
        const errorElement = document.createElement('div');
        errorElement.className = 'ai-message error';
        errorElement.textContent = 'حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
        aiChatMessages.appendChild(errorElement);
        
        // Log detailed error for debugging
        if (error.message.includes('401')) {
            errorElement.textContent = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
            console.error('Authentication error: Token may be invalid or expired');
        } else if (error.message.includes('403')) {
            errorElement.textContent = 'ليس لديك صلاحية الوصول إلى هذه الميزة.';
            console.error('Authorization error: User may not have premium access');
        }
    })
    .finally(() => {
        // Re-enable send button
        generateBtn.disabled = false;
        
        // Scroll to bottom
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    });
}

function getLanguageName(langCode) {
    const languages = {
        'ar': 'العربية',
        'en': 'الإنجليزية',
        'fr': 'الفرنسية',
        'es': 'الإسبانية',
        'de': 'الألمانية',
        'it': 'الإيطالية',
        'pt': 'البرتغالية',
        'ru': 'الروسية',
        'ja': 'اليابانية',
        'ko': 'الكورية',
        'zh': 'الصينية'
    };
    return languages[langCode] || 'العربية';
}

function generateAIResult(prompt, style, index) {
    const aiResults = document.getElementById('ai-results');
    
    const resultElement = document.createElement('div');
    resultElement.className = 'ai-result';
    
    // Generate sample content based on prompt and style
    let content = generateSampleContent(prompt, style);
    
    resultElement.innerHTML = `
        <div class="result-header">
            <h4>منشور ${index}</h4>
            <div class="result-actions">
                <button class="btn btn-sm btn-primary copy-btn" data-content="${content.replace(/'/g, "\\'")}">
                    <i class="fas fa-copy"></i> نسخ
                </button>
                <button class="btn btn-sm btn-success save-btn" data-content="${content.replace(/'/g, "\\'")}">
                    <i class="fas fa-save"></i> حفظ
                </button>
            </div>
        </div>
        <div class="result-content">
            <p>${content}</p>
        </div>
    `;
    
    // Add event listeners for the buttons
    const copyBtn = resultElement.querySelector('.copy-btn');
    const saveBtn = resultElement.querySelector('.save-btn');
    
    copyBtn.addEventListener('click', function() {
        copyToClipboard(this.dataset.content);
    });
    
    saveBtn.addEventListener('click', function() {
        savePost(this.dataset.content);
    });
    
    aiResults.appendChild(resultElement);
}

function generateSampleContent(prompt, style) {
    const samples = {
        'احترافي': [
            `في عالم الأعمال اليوم، ${prompt} يمثل فرصة حقيقية للنمو والتطوير. من خلال التخطيط الاستراتيجي والتنفيذ المدروس، يمكننا تحقيق نتائج استثنائية.`,
            `نحن نؤمن بأن ${prompt} هو المفتاح لبناء مستقبل أفضل. انضموا إلينا في هذه الرحلة المثيرة نحو التميز والإبداع.`
        ],
        'ودود': [
            `مرحباً أصدقائي! 😊 اليوم أريد أن أشارككم شيئاً رائعاً حول ${prompt}. إنه حقاً يستحق أن نتحدث عنه!`,
            `أهلاً وسهلاً بكم جميعاً! 🌟 ${prompt} موضوع قريب لقلبي، وأتمنى أن تجدوا فيه الفائدة والمتعة.`
        ],
        'مرح': [
            `🎉 واو! ${prompt} أمر مذهل حقاً! من كان يتوقع أن يكون بهذه الروعة؟ 😄`,
            `🚀 استعدوا للمفاجأة! ${prompt} سيغير نظرتكم للأشياء تماماً! 🤩`
        ]
    };
    
    const styleKey = Object.keys(samples).find(key => style.includes(key)) || 'احترافي';
    const sampleArray = samples[styleKey];
    return sampleArray[Math.floor(Math.random() * sampleArray.length)];
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم نسخ النص بنجاح!', 'success');
    }).catch(() => {
        showNotification('فشل في نسخ النص', 'error');
    });
}

// Save post function
function savePost(content) {
    // In a real app, this would save to the backend
    userPosts.unshift({
        id: Date.now(),
        content: content,
        createdAt: new Date().toISOString(),
        status: 'draft'
    });
    
    updatePostsList();
    showNotification('تم حفظ المنشور بنجاح!', 'success');
}

// Load user data
async function loadUserData() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Use CONFIG for environment-appropriate endpoint
        const apiEndpoint = CONFIG.getApiEndpoint('/api/auth/profile');
            
        const response = await fetch(apiEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateUserInfo();
            loadUserPosts();
            loadFacebookPages();
            loadAIPermissions();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = 'login.html';
    }
}

// Update user info display
function updateUserInfo() {
    const userInfoElement = document.getElementById('user-info');
    if (currentUser) {
        userInfoElement.innerHTML = `
            <strong>${currentUser.fullName}</strong><br>
            <small>${currentUser.subscription === 'free' ? 'مجاني' : 'مميز'}</small><br>
            <small>منشورات متبقية: ${currentUser.postsRemaining || 0}</small>
        `;
    }
}

// Load AI permissions
async function loadAIPermissions() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(CONFIG.getApiEndpoint('/api/ai/permissions'), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            aiPermissionsEnabled = data.aiPermissions.enabled;
            document.getElementById('ai-permissions').checked = aiPermissionsEnabled;
        }
    } catch (error) {
        console.error('Error loading AI permissions:', error);
    }
}

// Toggle AI permissions
async function toggleAIPermissions() {
    const token = localStorage.getItem('token');
    const checkbox = document.getElementById('ai-permissions');
    const newStatus = checkbox.checked;
    
    try {
        const endpoint = isEnable ? 
            CONFIG.getApiEndpoint('/api/ai/permissions/enable') :
            CONFIG.getApiEndpoint('/api/ai/permissions/disable');
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            aiPermissionsEnabled = newStatus;
            addAIChatMessage(newStatus ? 
                'تم تمكين صلاحيات AI بنجاح!' : 
                'تم تعطيل صلاحيات AI بنجاح!', 
                'ai');
        } else {
            checkbox.checked = !newStatus;
            addAIChatMessage('حدث خطأ في تحديث الصلاحيات', 'ai');
        }
    } catch (error) {
        console.error('Error toggling AI permissions:', error);
        checkbox.checked = !newStatus;
        addAIChatMessage('حدث خطأ في الاتصال', 'ai');
    }
}

// Load user posts
async function loadUserPosts() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(CONFIG.getApiEndpoint('/api/posts'), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            userPosts = data.posts || [];
            updatePostsList();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Load Facebook pages
async function loadFacebookPages() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(CONFIG.getApiEndpoint('/api/facebook/pages'), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            facebookPages = data.pages || [];
            updatePagesDisplay();
        }
    } catch (error) {
        console.error('Error loading Facebook pages:', error);
    }
}

// Update posts list
function updatePostsList() {
    const postsContainer = document.getElementById('posts-list');
    
    if (userPosts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts"><p data-translate="noPostsMessage">لا توجد منشورات بعد. ابدأ بإنشاء منشور جديد!</p></div>';
        return;
    }
    
    postsContainer.innerHTML = userPosts.map(post => `
        <div class="post-item">
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            <div class="post-meta">
                <span class="post-date">${new Date(post.createdAt).toLocaleDateString('ar-EG')}</span>
                <span class="post-status ${post.status}">${getStatusText(post.status)}</span>
            </div>
            <div class="post-actions">
                <button class="btn btn-sm btn-primary edit-post-btn" data-post-id="${post.id}">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-sm btn-success publish-post-btn" data-post-id="${post.id}">
                    <i class="fas fa-share"></i> نشر
                </button>
                <button class="btn btn-sm btn-danger delete-post-btn" data-post-id="${post.id}">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for post actions
    postsContainer.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editPost(this.dataset.postId);
        });
    });
    
    postsContainer.querySelectorAll('.publish-post-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            publishPost(this.dataset.postId);
        });
    });
    
    postsContainer.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deletePost(this.dataset.postId);
        });
    });
}

// Update pages display
function updatePagesDisplay() {
    const pagesContainer = document.getElementById('pages-list');
    
    if (facebookPages.length === 0) {
        pagesContainer.innerHTML = '<div class="no-pages"><p>لا توجد صفحات مربوطة. قم بربط صفحات فيسبوك أولاً.</p></div>';
        return;
    }
    
    pagesContainer.innerHTML = facebookPages.map(page => `
        <div class="page-item">
            <div class="page-info">
                <img src="${page.picture || 'images/default-page.png'}" alt="${page.name}" class="page-avatar">
                <div class="page-details">
                    <h4>${page.name}</h4>
                    <p>${page.category || 'صفحة عامة'}</p>
                    <small>${page.followers || 0} متابع</small>
                </div>
            </div>
            <div class="page-actions">
                <button class="btn btn-outline analytics-btn" data-page-id="${page.pageId}" data-translate="updateAnalyticsButton">
                    <i class="fas fa-chart-line"></i> تحديث الإحصائيات
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for analytics buttons
    pagesContainer.querySelectorAll('.analytics-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            getAnalytics(this.dataset.pageId);
        });
    });
}

// Update stats
function updateStats() {
    document.getElementById('total-posts').textContent = userPosts.length;
    
    const publishedPosts = userPosts.filter(post => post.status === 'published');
    const engagementRate = publishedPosts.length > 0 ? 
        (publishedPosts.reduce((sum, post) => sum + (post.engagement || 0), 0) / publishedPosts.length).toFixed(1) : 
        '0.0';
    
    document.getElementById('engagement-rate').textContent = engagementRate + '%';
    
    const totalFollowers = facebookPages.reduce((sum, page) => sum + (page.followers || 0), 0);
    document.getElementById('total-followers').textContent = totalFollowers.toLocaleString('ar-EG');
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyPosts = userPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate.getMonth() === thisMonth && postDate.getFullYear() === thisYear;
    }).length;
    
    document.getElementById('monthly-posts').textContent = monthlyPosts;
}

// Helper functions
function getStatusText(status) {
    const statusTexts = {
        'draft': 'مسودة',
        'scheduled': 'مجدول',
        'published': 'منشور',
        'failed': 'فشل'
    };
    return statusTexts[status] || status;
}

function editPost(postId) {
    const post = userPosts.find(p => p.id === postId);
    if (post) {
        // In a real app, this would open an edit modal
        const newContent = prompt('تعديل المنشور:', post.content);
        if (newContent && newContent.trim()) {
            post.content = newContent.trim();
            updatePostsList();
            showNotification('تم تحديث المنشور بنجاح!', 'success');
        }
    }
}

function publishPost(postId) {
    const post = userPosts.find(p => p.id === postId);
    if (post) {
        post.status = 'published';
        post.publishedAt = new Date().toISOString();
        updatePostsList();
        updateStats();
        showNotification('تم نشر المنشور بنجاح!', 'success');
    }
}

function deletePost(postId) {
    if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
        userPosts = userPosts.filter(p => p.id !== postId);
        updatePostsList();
        updateStats();
        showNotification('تم حذف المنشور بنجاح!', 'success');
    }
}

function getAnalytics(pageId) {
    showNotification('جاري تحديث الإحصائيات...', 'info');
    // In a real app, this would call the analytics API
    setTimeout(() => {
        showNotification('تم تحديث الإحصائيات بنجاح!', 'success');
    }, 2000);
}

// Add AI chat message
function addAIChatMessage(message, type) {
    const aiChatMessages = document.querySelector('.ai-chat-messages');
    if (aiChatMessages) {
        const messageElement = document.createElement('div');
        messageElement.className = type === 'ai' ? 'ai-message' : 'user-message';
        messageElement.textContent = message;
        aiChatMessages.appendChild(messageElement);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Logout function
function logout() {
    if (typeof window.sessionManager !== 'undefined' && typeof window.sessionManager.logout === 'function') {
        window.sessionManager.logout();
    } else {
        window.location.href = 'login.html';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    console.log('AI Dashboard: Starting initialization...');
    
    // Enable all features for paid users on AI Dashboard
    window.pageAccess = 'paid';
    if (typeof applyAccessControl === 'function') {
        applyAccessControl();
    }
    
    // Initialize session and validate authentication
    if (typeof SessionManager !== 'undefined') {
        const sessionManager = new SessionManager();
        const isAuthenticated = await sessionManager.initializeSession();
        
        if (!isAuthenticated) {
            console.log('AI Dashboard: Session invalid, redirecting to login');
            return; // Session manager will handle redirect
        }
        
        console.log('AI Dashboard: Session validated successfully');
        currentUser = sessionManager.getCurrentUser();
    } else {
        console.error('AI Dashboard: SessionManager not available');
        // Fallback to basic session check
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            console.log('AI Dashboard: No session found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        try {
            currentUser = JSON.parse(user);
            console.log('AI Dashboard: Using fallback session validation');
        } catch (error) {
            console.error('AI Dashboard: Invalid user data, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
    }
    
    // Initialize components
    initializeImageUpload();
    initializeAIChat();
    loadUserData();
    
    // AI permissions toggle
    const aiPermissionsToggle = document.getElementById('ai-permissions');
    if (aiPermissionsToggle) {
        aiPermissionsToggle.addEventListener('change', toggleAIPermissions);
    }
    
    // Logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof SessionManager !== 'undefined') {
                const sessionManager = new SessionManager();
                sessionManager.logout();
            } else {
                logout();
            }
        });
    }
    
    // Run smoke tests in development environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        runChatSmokeTests();
    }
});

// Simple smoke tests for chat functionality
function runChatSmokeTests() {
    console.log('Running chat functionality smoke tests...');
    
    // Test 1: Verify DOM elements exist
    const elements = [
        { id: 'ai-chat-input', name: 'Chat input' },
        { id: 'generate-btn', name: 'Send button' },
        { id: 'settings-toggle', name: 'Settings toggle' },
        { id: 'ai-chat-options', name: 'Settings panel' },
        { id: 'ai-chat-messages', name: 'Messages container' }
    ];
    
    let allElementsExist = true;
    elements.forEach(el => {
        const element = document.getElementById(el.id);
        if (!element) {
            console.error(`Test failed: ${el.name} (${el.id}) not found in DOM`);
            allElementsExist = false;
        }
    });
    
    if (allElementsExist) {
        console.log('Test passed: All required DOM elements exist');
    }
    
    // Test 2: Verify settings toggle functionality
    const settingsToggle = document.getElementById('settings-toggle');
    const chatOptions = document.getElementById('ai-chat-options');
    
    if (settingsToggle && chatOptions) {
        console.log('Testing settings toggle...');
        const initialState = chatOptions.classList.contains('open');
        settingsToggle.click();
        const newState = chatOptions.classList.contains('open');
        
        if (initialState !== newState) {
            console.log('Test passed: Settings toggle changes panel state');
        } else {
            console.error('Test failed: Settings toggle does not change panel state');
        }
        
        // Reset state
        if (newState) {
            settingsToggle.click();
        }
    }
    
    console.log('Smoke tests completed');
}