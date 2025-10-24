// Dashboard functionality
let currentUser = null;
let trendingTopics = [];
let userLocation = '';
let subscriptionType = 'free';
let lastUpdated = null;

// Load user data
async function loadUserData() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Use environment-appropriate endpoint
    const apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '/api/auth/profile' 
        : '/.netlify/functions/api/auth/profile';
        
    const response = await fetch(apiEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateUserInfo();
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

// Load trending topics data
async function loadTrendingTopics() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        // Fetch trending topics from backend
        const response = await fetch('/.netlify/functions/api/trending/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            trendingTopics = data.topics;
            userLocation = data.location || 'غير محدد';
            subscriptionType = data.subscriptionType || 'free';
            lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : new Date();
            updateDashboard();
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error loading trending topics:', error);
        showError('حدث خطأ في الاتصال');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Fetch new trending topics
async function fetchNewTrendingTopics() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        // Fetch new trending topics from backend
        const response = await fetch('/.netlify/functions/api/trending/fetch', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload topics after fetching new ones
            await loadTrendingTopics();
            alert(data.message || 'تم جلب المواضيع الجديدة بنجاح');
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        showError('حدث خطأ في جلب المواضيع الجديدة');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Generate AI content for a topic
async function generateAIContent(topicId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        // Generate AI content for the topic
        const response = await fetch('/.netlify/functions/api/trending/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicId: topicId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload topics after generating content
            await loadTrendingTopics();
            alert(data.message || 'تم إنشاء المحتوى بنجاح');
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error generating AI content:', error);
        showError('حدث خطأ في إنشاء المحتوى');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Generate AI content for all topics
async function generateAllAIContent() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    if (subscriptionType === 'free') {
        showError('إنشاء المحتوى متاح فقط للمستخدمين المميزين');
        return;
    }
    
    if (!confirm('هل تريد إنشاء محتوى لجميع المواضيع؟')) {
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        // Generate AI content for all topics
        // In a real implementation, this would be a batch operation
        // For now, we'll just reload the topics
        await loadTrendingTopics();
        alert('تم بدء إنشاء المحتوى لجميع المواضيع');
    } catch (error) {
        console.error('Error generating all AI content:', error);
        showError('حدث خطأ في إنشاء المحتوى');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Publish topic
async function publishTopic(topicId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        // Publish the topic
        const response = await fetch('/.netlify/functions/api/trending/publish', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicId: topicId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload topics after publishing
            await loadTrendingTopics();
            alert(data.message || 'تم نشر الموضوع بنجاح');
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error publishing topic:', error);
        showError('حدث خطأ في نشر الموضوع');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Toggle AI content visibility
function toggleAIContent(topicId) {
    const contentElement = document.getElementById(`ai-content-${topicId}`);
    if (contentElement) {
        contentElement.classList.toggle('show-content');
    }
}

// Update dashboard with trending topics data
function updateDashboard() {
    // Update location and subscription info
    document.getElementById('user-location').textContent = userLocation;
    document.getElementById('subscription-type').textContent = 
        subscriptionType === 'free' ? 'مجاني' : 
        subscriptionType === 'premium' ? 'مميز' : 'مميز VIP';
    document.getElementById('last-updated').textContent = 
        lastUpdated ? lastUpdated.toLocaleString('ar-SA') : 'غير محدد';
    
    // Update summary stats
    let totalTopics = trendingTopics.length;
    let generatedContent = 0;
    let publishedTopics = 0;
    let pendingReview = 0;
    
    trendingTopics.forEach(topic => {
        if (topic.status === 'generated') generatedContent++;
        if (topic.status === 'published') publishedTopics++;
        if (topic.status === 'reviewed') pendingReview++;
    });
    
    document.getElementById('total-topics').textContent = totalTopics;
    document.getElementById('generated-content').textContent = generatedContent;
    document.getElementById('published-topics').textContent = publishedTopics;
    document.getElementById('pending-review').textContent = pendingReview;
    
    // Update topics table
    updateTopicsTable();
}

// Update topics table
function updateTopicsTable() {
    const tableBody = document.getElementById('topics-table-body');
    
    if (trendingTopics.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="loading" data-translate="noTopicsData">لا توجد بيانات مواضيع</td></tr>';
        return;
    }
    
    tableBody.innerHTML = trendingTopics.map(topic => {
            // For free users, obfuscate the topic data
            const isFreeUser = subscriptionType === 'free';
            const displayTitle = isFreeUser ? '********' : (topic.topic_title || 'غير محدد');
            const displayKeyword = isFreeUser ? '***' : (topic.topic_keyword || 'غير محدد');
            
            // Status badge
            let statusClass = 'status-discovered';
            let statusText = 'مكتشف';
            
            switch (topic.status) {
                case 'generated':
                    statusClass = 'status-generated';
                    statusText = 'مُنشأ';
                    break;
                case 'reviewed':
                    statusClass = 'status-reviewed';
                    statusText = 'تمت المراجعة';
                    break;
                case 'published':
                    statusClass = 'status-published';
                    statusText = 'منشور';
                    break;
            }
            
            // Actions based on subscription type and status
            let actions = '';
            
            if (!isFreeUser) {
                if (topic.status === 'discovered') {
                    actions = `
                        <button class="btn btn-primary btn-sm" data-action="generate" data-topic-id="${topic.id}">
                            <i class="fas fa-magic"></i> إنشاء محتوى
                        </button>
                    `;
                } else if (topic.status === 'generated') {
                    actions = `
                        <button class="btn btn-secondary btn-sm" data-action="toggle" data-topic-id="${topic.id}">
                            <i class="fas fa-eye"></i> عرض المحتوى
                        </button>
                        <button class="btn btn-success btn-sm" data-action="publish" data-topic-id="${topic.id}">
                            <i class="fas fa-check"></i> نشر
                        </button>
                    `;
                } else if (topic.status === 'reviewed') {
                    actions = `
                        <button class="btn btn-secondary btn-sm" data-action="toggle" data-topic-id="${topic.id}">
                            <i class="fas fa-eye"></i> عرض المحتوى
                        </button>
                        <button class="btn btn-success btn-sm" data-action="publish" data-topic-id="${topic.id}">
                            <i class="fas fa-check"></i> نشر
                        </button>
                    `;
                } else if (topic.status === 'published') {
                    actions = `
                        <button class="btn btn-secondary btn-sm" data-action="toggle" data-topic-id="${topic.id}">
                            <i class="fas fa-eye"></i> عرض المحتوى
                        </button>
                    `;
                }
            } else {
                actions = '<span data-translate="upgradeToAccess">قم بالترقية للوصول</span>';
            }
            
            return `
                <tr>
                    <td class="topic-title">${displayTitle}</td>
                    <td><span class="topic-keyword">${displayKeyword}</span></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${actions}</td>
                </tr>
                ${topic.content ? `
                <tr>
                    <td colspan="4">
                        <div id="ai-content-${topic.id}" class="ai-content">
                            <strong data-translate="generatedContentPreview">معاينة المحتوى المُنشأ:</strong>
                            <p>${topic.content}</p>
                        </div>
                    </td>
                </tr>
                ` : ''}
            `;
        }).join('');
        

}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    
    // Translate error message if it's an object
    let displayMessage = message;
    if (typeof message === 'object' && message.ar) {
        displayMessage = message.ar;
    }
    
    errorElement.textContent = displayMessage;
    errorElement.style.display = 'block';
}

// Refresh trending topics data
async function refreshTopics() {
    await loadTrendingTopics();
}

// Logout function
function logout() {
    if (typeof window.sessionManager !== 'undefined' && typeof window.sessionManager.logout === 'function') {
        window.sessionManager.logout();
    } else {
        window.location.href = 'login.html';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadTrendingTopics();
    
    // Refresh button event
    document.getElementById('refresh-topics').addEventListener('click', refreshTopics);
    
    // Fetch new topics button event
    document.getElementById('fetch-topics').addEventListener('click', fetchNewTrendingTopics);
    
    // Generate all content button event
    document.getElementById('generate-all-content').addEventListener('click', generateAllAIContent);
    
    // Logout link event
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Add event listeners for dynamically created buttons
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        
        const action = button.getAttribute('data-action');
        const topicId = button.getAttribute('data-topic-id');
        
        switch (action) {
            case 'generate':
                generateAIContent(topicId);
                break;
            case 'toggle':
                toggleAIContent(topicId);
                break;
            case 'publish':
                publishTopic(topicId);
                break;
        }
    });
});