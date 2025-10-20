// Dashboard functionality
let currentUser = null;
let userPosts = [];
let aiChatMessages = [];
let aiPermissionsEnabled = false;

// Mark this page as free; disable paid-only features visually
window.pageAccess = 'free';

// Initialize currentUser from localStorage immediately
function initializeCurrentUser() {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
        try {
            currentUser = JSON.parse(storedUser);
            console.log('Current user initialized from localStorage:', currentUser);
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            currentUser = null;
        }
    }
}

// Initialize user immediately when script loads
initializeCurrentUser();

// Load user data
async function loadUserData() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // إنشاء مستخدم تجريبي للاختبار إذا لم يكن هناك مستخدم مسجل دخوله
    if (!token || !user) {
        console.log('إنشاء مستخدم تجريبي للاختبار...');
        currentUser = {
            id: 'demo-user-123',
            fullName: 'مستخدم تجريبي',
            username: 'demo_user',
            email: 'demo@example.com',
            subscription: 'free',
            postsRemaining: 2,
            facebookPages: [],
            posts: []
        };
        
        // حفظ المستخدم التجريبي في localStorage
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('token', 'demo-token-123');
        
        updateUserInfo();
        loadUserPosts();
        loadAIPermissions();
        return;
    }
    
    // Ensure currentUser is available for API calls
    if (!currentUser) {
        console.error('currentUser is not initialized in loadUserData');
        alert('خطأ: لم يتم تحميل بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'user-id': JSON.parse(user).id
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateUserInfo();
            loadUserPosts();
            loadAIPermissions();
        } else {
            // إذا فشل الاتصال بالخادم، استخدم المستخدم التجريبي
            console.log('فشل الاتصال بالخادم، استخدام المستخدم التجريبي...');
            currentUser = {
                id: 'demo-user-123',
                fullName: 'مستخدم تجريبي',
                username: 'demo_user',
                email: 'demo@example.com',
                subscription: 'free',
                postsRemaining: 2,
                facebookPages: [],
                posts: []
            };
            
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', 'demo-token-123');
            
            updateUserInfo();
            loadUserPosts();
            loadAIPermissions();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // في حالة الخطأ، استخدم المستخدم التجريبي
        console.log('خطأ في الاتصال، استخدام المستخدم التجريبي...');
        currentUser = {
            id: 'demo-user-123',
            fullName: 'مستخدم تجريبي',
            username: 'demo_user',
            email: 'demo@example.com',
            subscription: 'free',
            postsRemaining: 2,
            facebookPages: [],
            posts: []
        };
        
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('token', 'demo-token-123');
        
        updateUserInfo();
        loadUserPosts();
        loadAIPermissions();
    }
}

// Load AI permissions
async function loadAIPermissions() {
    const token = localStorage.getItem('token');
    
    if (token === 'demo-token-123') {
        // For demo user, set default AI permissions
        aiPermissionsEnabled = false;
        document.getElementById('ai-permissions').checked = aiPermissionsEnabled;
        return;
    }
    
    // Ensure currentUser is available
    if (!currentUser) {
        console.error('currentUser is not initialized in loadAIPermissions');
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/api/ai/permissions', {
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
    
    if (token === 'demo-token-123') {
        // For demo user, just update the UI
        aiPermissionsEnabled = newStatus;
        addAIChatMessage(newStatus ? 
            'تم تمكين صلاحيات AI بنجاح!' : 
            'تم تعطيل صلاحيات AI بنجاح!', 
            'ai');
        return;
    }
    
    // Ensure currentUser is available
    if (!currentUser) {
        console.error('currentUser is not initialized in toggleAIPermissions');
        checkbox.checked = !newStatus; // Revert checkbox state
        return;
    }
    
    try {
        const endpoint = newStatus ? 
            '/.netlify/functions/api/ai/permissions/enable' : 
            '/.netlify/functions/api/ai/permissions/disable';
        
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
    
    if (localStorage.getItem('token') === 'demo-token-123') {
        // Demo response
        setTimeout(() => {
            addAIChatMessage('هذه رسالة تجريبية من AI. في الإنتاج، سيتم الاتصال بـ OpenAI API للحصول على ردود فعل حقيقية.', 'ai');
            sendButton.disabled = false;
        }, 1000);
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/api/ai/chat', {
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
        const response = await fetch('/.netlify/functions/api/facebook/posts', {
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
    updateTranslatableElements(savedLang);
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
    
    // إنشاء منشور تجريبي إذا كان المستخدم تجريبي
    if (token === 'demo-token-123') {
        console.log('إنشاء منشور تجريبي...');
        
        const demoPosts = {
            motivational: {
                professional: "تذكر أن النجاح ليس وصولاً بل رحلة مستمرة من التعلم والنمو. استمر في السعي نحو أهدافك! 💪",
                friendly: "يا صديقي، كل يوم جديد هو فرصة لتحقيق شيء رائع! لا تستسلم أبداً 🌟",
                casual: "صباح الخير! اليوم سيكون يوم رائع، فقط آمن بذلك! ☀️",
                inspirational: "الأحلام لا تتحقق بالصدفة، بل بالعمل الجاد والإصرار. ابدأ اليوم! 🚀"
            },
            business: {
                professional: "في عالم الأعمال المتغير، الابتكار هو المفتاح للبقاء في المقدمة. استثمر في أفكارك! 🚀",
                friendly: "الأعمال الناجحة مبنية على العلاقات القوية والثقة المتبادلة. ابني شبكة علاقاتك! 🤝",
                casual: "نصيحة اليوم: استمع لعملائك أكثر من حديثك! 👂",
                inspirational: "كل رائد أعمال ناجح بدأ بفكرة واحدة. ما هي فكرتك؟ 💡"
            },
            lifestyle: {
                professional: "التوازن بين العمل والحياة الشخصية هو أساس السعادة الحقيقية. اعتن بنفسك! ⚖️",
                friendly: "الحياة جميلة عندما نستمتع باللحظات الصغيرة! شاركنا لحظاتك المميزة 📸",
                casual: "أحياناً أفضل قرار هو أخذ استراحة! 😌",
                inspirational: "الحياة قصيرة جداً لتضيعها في القلق. عش اللحظة! ⏰"
            },
            educational: {
                professional: "التعلم المستمر هو مفتاح التميز في أي مجال. استثمر في تطوير مهاراتك! 📚",
                friendly: "شاركنا ما تعلمته اليوم! المعرفة تنمو عندما نشاركها مع الآخرين 🌱",
                casual: "حقائق مذهلة: هل تعلم أن...؟ 🤓",
                inspirational: "العلم نور والجهل ظلام. اقرأ وتعلم كل يوم! 🔍"
            },
            entertainment: {
                professional: "الترفيه جزء مهم من الحياة الصحية. خذ وقتاً للاستمتاع! 🎭",
                friendly: "شاركنا ما يشعرك بالسعادة اليوم! 😄",
                casual: "وقت المرح! ما هو آخر شيء جعلك تضحك؟ 😂",
                inspirational: "الضحك أفضل دواء! اجعل كل يوم مليئاً بالفرح! 😊"
            }
        };
        
        const postContent = demoPosts[category]?.[tone] || 
            "منشور مثير للاهتمام! شاركنا أفكارك في التعليقات 💭";
        
        const newPost = {
            id: Date.now().toString(),
            content: postContent + (customPrompt ? `\n\n${customPrompt}` : ''),
            category,
            tone,
            customPrompt,
            createdAt: new Date().toISOString(),
            status: 'draft',
            aiGenerated: true
        };
        
        // إضافة المنشور الجديد
        userPosts.unshift(newPost);
        currentUser.postsRemaining = Math.max(0, currentUser.postsRemaining - 1);
        
        // عرض المنشور المُنشأ
        document.getElementById('post-content').textContent = newPost.content;
        document.getElementById('generated-post').style.display = 'block';
        
        // تحديث القوائم والإحصائيات
        updatePostsList();
        updateStats();
        updateUserInfo();
        
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/api/facebook/generate-post', {
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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Apply access control
    if (typeof applyAccessControl === 'function') applyAccessControl();
    
    // Load user data
    loadUserData();
    
    // Set up event listeners
    const generateBtn = document.getElementById('generate-post-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePost);
    }
    
    const aiPermissionsCheckbox = document.getElementById('ai-permissions');
    if (aiPermissionsCheckbox) {
        aiPermissionsCheckbox.addEventListener('change', toggleAIPermissions);
    }
    
    const aiChatSendBtn = document.getElementById('ai-chat-send');
    if (aiChatSendBtn) {
        aiChatSendBtn.addEventListener('click', sendAIChatMessage);
    }
    
    const aiChatInput = document.getElementById('ai-chat-input');
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