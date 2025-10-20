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
            chatOptions.classList.remove('open');
            settingsToggle.addEventListener('click', function() {
                const isOpen = chatOptions.classList.toggle('open');
                settingsToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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
    
    const message = aiChatInput.value.trim();
    if (!message) return;
    
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
    const style = postStyle.options[postStyle.selectedIndex].text;
    const language = getLanguageName(postLanguage.value);
    
    // Simulate AI response (in a real app, this would call your backend)
    setTimeout(() => {
        // Remove loading message
        aiChatMessages.removeChild(loadingElement);
        
        // Add AI response message
        const aiMessageElement = document.createElement('div');
        aiMessageElement.className = 'ai-message';
        aiMessageElement.textContent = `تم إنشاء ${count} منشورات بأسلوب ${style} باللغة ${language}. يمكنك الاطلاع عليها أدناه:`;
        aiChatMessages.appendChild(aiMessageElement);
        
        // Generate AI results
        for (let i = 0; i < count; i++) {
            generateAIResult(message, style, i + 1);
        }
        
        // Scroll to bottom
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }, 1500);
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
        const response = await fetch('/.netlify/functions/api/auth/profile', {
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
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('token');
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
        const response = await fetch('/.netlify/functions/api/ai/permissions', {
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
        const endpoint = newStatus ? 
            '/.netlify/functions/api/ai/permissions/enable' : 
            '/.netlify/functions/api/ai/permissions/disable';
        
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
        const response = await fetch('/.netlify/functions/api/posts', {
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
        const response = await fetch('/.netlify/functions/api/facebook/pages', {
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
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
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
            return; // Session manager will handle redirect
        }
        
        currentUser = sessionManager.getCurrentUser();
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
});