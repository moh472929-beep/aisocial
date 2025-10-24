// Dashboard functionality
let currentUser = null;
let userPosts = [];
let aiChatMessages = [];
let aiPermissionsEnabled = false;

// Mark this page as free; disable paid-only features visually
window.pageAccess = 'free';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // CRITICAL: Initialize session FIRST before any other operations
    console.log('Dashboard: Starting initialization...');
    console.log('Dashboard: localStorage contents:', {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user'),
        tokenLength: localStorage.getItem('token')?.length || 0
    });
    
    // Add a small delay to ensure all scripts are loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if user is premium and should be redirected to AI dashboard
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const userSubscription = user?.subscription || 'free';
            console.log('Dashboard: User subscription type:', userSubscription);
            
            if (userSubscription === 'premium' || userSubscription === 'paid') {
                console.log('Dashboard: Premium user detected, redirecting to AI dashboard...');
                window.location.href = 'ai-dashboard.html';
                return;
            }
        } catch (e) {
            console.log('Dashboard: Error parsing user data, continuing with regular dashboard...');
        }
    }
    
    // Use the global session manager for consistency
    if (typeof window.sessionManager !== 'undefined') {
        console.log('Dashboard: SessionManager found, initializing session...');
        
        try {
            const isAuthenticated = await window.sessionManager.initializeSession();
            
            if (!isAuthenticated) {
                // Session validation failed, user will be redirected
                console.log('Dashboard: Session invalid, redirecting to login');
                return;
            }
            
            currentUser = window.sessionManager.getCurrentUser();
            console.log('Dashboard: Session validated successfully, user:', {
                email: currentUser?.email,
                fullName: currentUser?.fullName
            });
        } catch (error) {
            console.error('Dashboard: Session initialization error:', error);
            // On error, try to use cached data if available
            const token = localStorage.getItem('token');
            const cachedUser = localStorage.getItem('user');
            
            if (token && cachedUser) {
                try {
                    currentUser = JSON.parse(cachedUser);
                    console.log('Dashboard: Using cached user data due to initialization error');
                } catch (e) {
                    console.error('Dashboard: Failed to parse cached user:', e);
                    window.location.href = 'login.html';
                    return;
                }
            } else {
                window.location.href = 'login.html';
                return;
            }
        }
    } else {
        console.error('Dashboard: SessionManager not available, checking for cached session...');
        
        // Fallback: check for cached session data
        const token = localStorage.getItem('token');
        const cachedUser = localStorage.getItem('user');
        
        if (token && cachedUser) {
            try {
                currentUser = JSON.parse(cachedUser);
                console.log('Dashboard: Using cached session data');
            } catch (e) {
                console.error('Dashboard: Failed to parse cached user:', e);
                window.location.href = 'login.html';
                return;
            }
        } else {
            window.location.href = 'login.html';
            return;
        }
    }
    
    // Apply access control after session validation
    if (typeof applyAccessControl === 'function') applyAccessControl();
    
    // Load user data only after session validation
    loadUserData();
    
    // REMOVED: Language system initialization from here
    // Language system will be initialized by language-switcher.js after session validation
    console.log('Dashboard: Session initialization complete, language system will initialize separately');

    // Set up AI chat functionality
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatSend = document.getElementById('ai-chat-send');
    
    if (aiChatSend) {
        aiChatSend.addEventListener('click', sendAIChatMessage);
    }
    
    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIChatMessage();
            }
        });
    }
    
    // Set up logout link event listener
    const logoutLinks = document.querySelectorAll('a[href="#"]');
    logoutLinks.forEach(link => {
        if (link.textContent.includes('تسجيل الخروج') || link.querySelector('[data-translate="logoutMenuItem"]')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    });
});

// DEPRECATED FUNCTIONS - Use SessionManager instead
// These functions are kept for backward compatibility but should not be used

// Session persistence and validation - DEPRECATED: Use SessionManager instead
async function validateSession() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // If no token or user data, redirect to login
    if (!token || !storedUser) {
        console.log('No valid session found, redirecting to login...');
        clearSession();
        redirectToLogin();
        return false;
    }
    
    try {
        // Parse stored user data
        currentUser = JSON.parse(storedUser);
        
        // Validate token with backend
        // Use CONFIG for environment-appropriate endpoint
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
                // Update currentUser with fresh data from backend
                currentUser = data.user;
                localStorage.setItem('user', JSON.stringify(currentUser));
                console.log('Session validated successfully');
                return true;
            }
        }
        
        // Token is invalid or expired
        console.log('Session validation failed, clearing session');
        clearSession();
        redirectToLogin();
        return false;
        
    } catch (error) {
        console.error('Session validation error:', error);
        // On network error, use cached user data but log the issue
        if (currentUser) {
            console.log('Using cached user data due to network error');
            return true;
        }
        
        // If no cached data and network error, redirect to login without clearing tokens
        redirectToLogin();
        return false;
    }
}

// Clear all session data
function clearSession() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    currentUser = null;
    console.log('Session cleared');
}

// Redirect to login page
function redirectToLogin() {
    // Prevent infinite redirects
    if (window.location.pathname.includes('login') || window.location.pathname.includes('index')) {
        return;
    }
    
    console.log('Redirecting to login page');
    window.location.href = 'login.html';
}

// Initialize session on page load
async function initializeSession() {
    console.log('Initializing session...');
    
    const isValidSession = await validateSession();
    
    if (isValidSession) {
        console.log('Session initialized successfully');
        return true;
    }
    
    return false;
}

// Load user data
async function loadUserData() {
    const token = localStorage.getItem('token');
    
    // Prefer sessionManager for authoritative user state
    let sessionUser = null;
    if (typeof window.sessionManager !== 'undefined') {
        sessionUser = window.sessionManager.getCurrentUser();
    }

    // If user not yet available from sessionManager, try to validate and refresh
    if (!sessionUser && typeof window.sessionManager !== 'undefined') {
        try {
            const ok = await window.sessionManager.validateSession();
            if (ok) {
                sessionUser = window.sessionManager.getCurrentUser();
                if (sessionUser) {
                    // Cache user in localStorage for fallback
                    try { localStorage.setItem('user', JSON.stringify(sessionUser)); } catch {}
                }
            }
        } catch (e) {
            console.warn('Dashboard: Session validation during loadUserData failed:', e);
        }
    }

    // Fallback to cached localStorage user if sessionManager not available or still null
    if (!sessionUser) {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
            try {
                sessionUser = JSON.parse(rawUser);
            } catch (err) {
                console.error('Dashboard: Error parsing cached user data:', err);
            }
        }
    }

    // If token or user still missing after validation, redirect without clearing token
    if (!token || !sessionUser) {
        console.log('Dashboard: No authenticated user after validation; redirecting to login');
        // IMPORTANT: Do NOT clear token here to avoid race-induced logout loops
        window.location.href = 'login.html';
        return;
    }

    currentUser = sessionUser;
    updateUserInfo();
    loadUserPosts();
    loadAIPermissions();
}

// Load AI permissions
async function loadAIPermissions() {
    const token = localStorage.getItem('token');
    
    // Ensure currentUser is available
    if (!currentUser) {
        console.error('currentUser is not initialized in loadAIPermissions');
        return;
    }
    
    try {
        const response = await fetch(CONFIG.getApiEndpoint('/api/ai/permissions'), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'user-id': currentUser.id
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
    
    // Ensure currentUser is available
    if (!currentUser) {
        console.error('currentUser is not initialized in toggleAIPermissions');
        checkbox.checked = !newStatus; // Revert checkbox state
        return;
    }
    
    try {
        const endpoint = isEnable ? 
            CONFIG.getApiEndpoint('/api/ai/permissions/enable') :
            CONFIG.getApiEndpoint('/api/ai/permissions/disable');
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'user-id': currentUser.id,
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
            checkbox.checked = !newStatus; // Revert the checkbox
            addAIChatMessage('حدث خطأ: ' + data.error, 'ai');
        }
    } catch (error) {
        console.error('Error toggling AI permissions:', error);
        checkbox.checked = !newStatus; // Revert the checkbox
        addAIChatMessage('حدث خطأ في الاتصال', 'ai');
    }
}

// Send AI chat message
async function sendAIChatMessage() {
    const inputElement = document.getElementById('ai-chat-input');
    const message = inputElement.value.trim();
    
    if (!message) return;
    
    // Ensure currentUser is available
    if (!currentUser) {
        console.error('currentUser is not initialized');
        addAIChatMessage('خطأ: لم يتم تحميل بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.', 'ai');
        return;
    }
    
    const sendButton = document.getElementById('ai-chat-send');
    sendButton.disabled = true;
    
    // Add user message to chat
    addAIChatMessage(message, 'user');
    inputElement.value = '';
    
    try {
        const response = await fetch(CONFIG.getApiEndpoint('/api/ai/chat'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'user-id': currentUser.id,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: aiChatMessages.slice(-6) // Send last 6 messages as context
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addAIChatMessage(data.response, 'ai');
        } else {
            addAIChatMessage('حدث خطأ: ' + data.error, 'ai');
        }
    } catch (error) {
        console.error('Error sending AI chat message:', error);
        addAIChatMessage('حدث خطأ في الاتصال', 'ai');
    } finally {
        sendButton.disabled = false;
    }
}

// Add message to AI chat
function addAIChatMessage(text, sender) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';
    messageElement.innerHTML = `<p>${text}</p>`;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store message
    aiChatMessages.push({
        role: sender === 'user' ? 'user' : 'assistant',
        content: text
    });
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

// Load user posts
async function loadUserPosts() {
    const token = localStorage.getItem('token');
    
    // Ensure currentUser is available
    if (!currentUser) {
        console.error('currentUser is not initialized in loadUserPosts');
        return;
    }
    
    try {
        const response = await fetch(CONFIG.getApiEndpoint('/api/facebook/posts'), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'user-id': currentUser.id
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            userPosts = data.posts;
            updatePostsList();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Update posts list
function updatePostsList() {
    const postsList = document.getElementById('posts-list');
    
    if (userPosts.length === 0) {
        postsList.innerHTML = '<p data-translate="noPostsMessage">لا توجد منشورات بعد. ابدأ بإنشاء منشور جديد!</p>';
        return;
    }
    
    postsList.innerHTML = userPosts.map(post => `
        <div class="post-item">
            <h4>${post.category} - ${post.tone}</h4>
            <div class="post-meta">
                ${new Date(post.createdAt).toLocaleDateString('ar-SA')}
                <span class="post-status status-${post.status}" data-translate="status${post.status.charAt(0).toUpperCase() + post.status.slice(1)}">
                </span>
            </div>
            <p>${post.content}</p>
        </div>
    `).join('');
    
    // Apply translations to the newly added elements
    const savedLang = localStorage.getItem('preferredLanguage') || 'ar';
    
    // Ensure language system is initialized before applying translations
    if (typeof window.updateAllLanguageElements === 'function') {
        window.updateAllLanguageElements(savedLang);
    } else if (typeof updateTranslatableElements === 'function') {
        updateTranslatableElements(savedLang);
    }
}

// Update stats
function updateStats() {
    document.getElementById('total-posts').textContent = userPosts.length;
    document.getElementById('engagement-rate').textContent = '0%';
    document.getElementById('ai-suggestions').textContent = userPosts.filter(p => p.aiGenerated).length;
    document.getElementById('scheduled-posts').textContent = userPosts.filter(p => p.status === 'scheduled').length;
}

// Generate post function
async function generatePost() {
    const category = document.getElementById('post-category').value;
    const tone = document.getElementById('post-tone').value;
    const customPrompt = document.getElementById('custom-prompt').value;
    
    const token = localStorage.getItem('token');
    
    // Check if user has remaining posts
    if (currentUser && currentUser.postsRemaining <= 0) {
        alert('لقد استنفدت عدد المنشورات المتاحة. يرجى الترقية للحصول على المزيد.');
        return;
    }
    
    try {
        const response = await fetch(CONFIG.getApiEndpoint('/api/facebook/generate-post'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'user-id': currentUser.id
            },
            body: JSON.stringify({
                category,
                tone,
                customPrompt
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('post-content').textContent = data.post.content;
            document.getElementById('generated-post').style.display = 'block';
            
            // Update posts list
            userPosts.unshift(data.post);
            updatePostsList();
            updateStats();
            
            // Update user info
            currentUser.postsRemaining = data.postsRemaining;
            updateUserInfo();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error generating post:', error);
        alert('خطأ في إنشاء المنشور');
    }
}

// Logout function
function logout() {
    console.log('Logging out user...');
    if (typeof window.sessionManager !== 'undefined') {
        window.sessionManager.logout();
    } else {
        // Fallback logout
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = 'login.html';
    }
}