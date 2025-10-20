// Dashboard functionality
let currentUser = null;
let autoResponseSettings = {
    rules: [],
    enabled: false
};

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
            loadAutoResponseSettings();
            loadRecentResponses();
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

// Load auto-response settings
async function loadAutoResponseSettings() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/api/autoresponse/settings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            autoResponseSettings = data.settings;
            document.getElementById('auto-response-toggle').checked = autoResponseSettings.enabled;
            updateRulesDisplay();
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error loading auto-response settings:', error);
        showError('حدث خطأ في تحميل الإعدادات');
    }
}

// Save auto-response settings
async function saveAutoResponseSettings() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/.netlify/functions/api/autoresponse/settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rules: autoResponseSettings.rules,
                enabled: document.getElementById('auto-response-toggle').checked
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            autoResponseSettings = data.settings;
            showSuccess(data.message);
            updateRulesDisplay();
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error saving auto-response settings:', error);
        showError('حدث خطأ في حفظ الإعدادات');
    } finally {
        hideLoading();
    }
}

// Add new rule
function addRule() {
    const keywordsInput = document.getElementById('keywords');
    const responseTextInput = document.getElementById('response-text');
    
    const keywords = keywordsInput.value.split(',').map(k => k.trim()).filter(k => k);
    const responseText = responseTextInput.value.trim();
    
    if (keywords.length === 0 || responseText === '') {
        showError('يرجى إدخال الكلمات المفتاحية ونص الرد');
        return;
    }
    
    autoResponseSettings.rules.push({
        keywords: keywords,
        response: responseText
    });
    
    keywordsInput.value = '';
    responseTextInput.value = '';
    
    updateRulesDisplay();
}

// Delete rule
function deleteRule(index) {
    autoResponseSettings.rules.splice(index, 1);
    updateRulesDisplay();
}

// Update rules display
function updateRulesDisplay() {
    const container = document.getElementById('rules-container');
    
    if (autoResponseSettings.rules.length === 0) {
        container.innerHTML = '<div class="loading" data-translate="noRules">لا توجد قواعد محددة</div>';
        return;
    }
    
    container.innerHTML = autoResponseSettings.rules.map((rule, index) => `
        <div class="rule-item">
            <button class="delete-rule" data-rule-index="${index}">
                <i class="fas fa-times"></i>
            </button>
            <div><strong data-translate="keywords">الكلمات المفتاحية:</strong> ${rule.keywords.join(', ')}</div>
            <div><strong data-translate="responseText">نص الرد:</strong> ${rule.response}</div>
        </div>
    `).join('');
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-rule').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-rule-index'));
            deleteRule(index);
        });
    });
}

// Load recent responses
async function loadRecentResponses() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/api/autoresponse/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateResponsesTable(data.responses);
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error loading recent responses:', error);
        showError('حدث خطأ في تحميل الردود الأخيرة');
    }
}

// Update responses table
function updateResponsesTable(responses) {
    const tbody = document.getElementById('responses-table-body');
    
    if (responses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading" data-translate="noResponses">لا توجد ردود تلقائية</td></tr>';
        return;
    }
    
    tbody.innerHTML = responses.map(response => `
        <tr>
            <td>${response.original_comment || 'N/A'}</td>
            <td>${response.keyword_triggered || 'N/A'}</td>
            <td>${response.ai_response || 'N/A'}</td>
            <td>${new Date(response.timestamp).toLocaleString('ar-EG')}</td>
        </tr>
    `).join('');
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}

// Show loading indicator
function showLoading() {
    document.getElementById('loading-indicator').style.display = 'block';
}

// Hide loading indicator
function hideLoading() {
    document.getElementById('loading-indicator').style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize session and validate authentication
    if (typeof SessionManager !== 'undefined') {
        const sessionManager = new SessionManager();
        const isAuthenticated = await sessionManager.initializeSession();
        
        if (!isAuthenticated) {
            return; // Session manager will handle redirect
        }
        
        currentUser = sessionManager.getCurrentUser();
    }
    
    loadUserData();
    
    // Save settings button
    document.getElementById('save-settings').addEventListener('click', saveAutoResponseSettings);
    
    // Add rule button
    document.getElementById('add-rule').addEventListener('click', addRule);
    
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