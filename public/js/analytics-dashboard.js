// Analytics Dashboard functionality
let currentUser = null;
let analyticsData = [];
let followerGrowthChart = null;
let engagementRateChart = null;
let competitorAnalytics = null;

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

// Load analytics data
async function loadAnalyticsData(period = 'daily') {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        // Fetch analytics data from backend
        const response = await fetch(`/.netlify/functions/api/analytics/dashboard?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            analyticsData = data.analytics;
            updateDashboard();
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error loading analytics data:', error);
        showError('حدث خطأ في الاتصال');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Update dashboard with analytics data
function updateDashboard() {
    if (analyticsData.length === 0) {
        showError('لا توجد بيانات تحليلية متاحة');
        return;
    }
    
    // Update summary stats
    let totalPosts = 0;
    let totalEngagementRate = 0;
    let totalFollowerGrowth = 0;
    let totalTopPosts = 0;
    
    analyticsData.forEach(page => {
        totalPosts += page.totalPosts || 0;
        totalEngagementRate += page.engagementRate || 0;
        totalFollowerGrowth += page.followerGrowth || 0;
        totalTopPosts += page.topPosts ? page.topPosts.length : 0;
    });
    
    document.getElementById('total-posts').textContent = totalPosts;
    document.getElementById('engagement-rate').textContent = `${(totalEngagementRate / analyticsData.length).toFixed(2)}%`;
    document.getElementById('follower-growth').textContent = `${(totalFollowerGrowth / analyticsData.length).toFixed(2)}%`;
    document.getElementById('top-posts').textContent = totalTopPosts;
    
    // Update charts
    updateCharts();
    
    // Update top posts table
    updateTopPostsTable();
    
    // Update best posting times
    updateBestPostingTimes();
}

// Update charts
function updateCharts() {
    // Follower growth chart
    const followerGrowthCtx = document.getElementById('follower-growth-chart').getContext('2d');
    
    if (followerGrowthChart) {
        followerGrowthChart.destroy();
    }
    
    const followerGrowthData = {
        labels: analyticsData.map((_, index) => `الصفحة ${index + 1}`),
        datasets: [{
            label: 'نمو المتابعين (%)',
            data: analyticsData.map(page => page.followerGrowth || 0),
            backgroundColor: 'rgba(24, 119, 242, 0.2)',
            borderColor: 'rgba(24, 119, 242, 1)',
            borderWidth: 2
        }]
    };
    
    followerGrowthChart = new Chart(followerGrowthCtx, {
        type: 'bar',
        data: followerGrowthData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
    
    // Engagement rate chart
    const engagementRateCtx = document.getElementById('engagement-rate-chart').getContext('2d');
    
    if (engagementRateChart) {
        engagementRateChart.destroy();
    }
    
    const engagementRateData = {
        labels: analyticsData.map((_, index) => `الصفحة ${index + 1}`),
        datasets: [{
            label: 'معدل التفاعل (%)',
            data: analyticsData.map(page => page.engagementRate || 0),
            backgroundColor: 'rgba(0, 184, 148, 0.2)',
            borderColor: 'rgba(0, 184, 148, 1)',
            borderWidth: 2
        }]
    };
    
    engagementRateChart = new Chart(engagementRateCtx, {
        type: 'line',
        data: engagementRateData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Update top posts table
function updateTopPostsTable() {
    const tableBody = document.getElementById('top-posts-table');
    
    // Collect all top posts from all pages
    let allTopPosts = [];
    analyticsData.forEach(page => {
        if (page.topPosts && page.topPosts.length > 0) {
            allTopPosts = allTopPosts.concat(page.topPosts);
        }
    });
    
    if (allTopPosts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="loading">لا توجد بيانات منشورات</td></tr>';
        return;
    }
    
    // Sort by total engagement
    allTopPosts.sort((a, b) => {
        const engagementA = (a.likes || 0) + (a.shares || 0) + (a.comments || 0);
        const engagementB = (b.likes || 0) + (b.shares || 0) + (b.comments || 0);
        return engagementB - engagementA;
    });
    
    // Limit to top 10 posts
    allTopPosts = allTopPosts.slice(0, 10);
    
    tableBody.innerHTML = allTopPosts.map(post => `
        <tr>
            <td class="post-preview">${post.content || 'لا يوجد محتوى'}</td>
            <td>${post.likes || 0}</td>
            <td>${post.shares || 0}</td>
            <td>${post.comments || 0}</td>
            <td>${(post.likes || 0) + (post.shares || 0) + (post.comments || 0)}</td>
        </tr>
    `).join('');
}

// Update best posting times
function updateBestPostingTimes() {
    const container = document.getElementById('best-times-container');
    
    // Collect all best posting times from all pages
    let allBestTimes = [];
    analyticsData.forEach(page => {
        if (page.bestPostTimes && page.bestPostTimes.length > 0) {
            allBestTimes = allBestTimes.concat(page.bestPostTimes);
        }
    });
    
    if (allBestTimes.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد بيانات أوقات</div>';
        return;
    }
    
    // Group by hour and calculate average engagement
    const timeGroups = {};
    allBestTimes.forEach(time => {
        if (!timeGroups[time.hour]) {
            timeGroups[time.hour] = { count: 0, totalEngagement: 0 };
        }
        timeGroups[time.hour].count++;
        timeGroups[time.hour].totalEngagement += time.averageEngagement;
    });
    
    // Calculate average engagement per hour
    const avgTimes = Object.keys(timeGroups).map(hour => ({
        hour: parseInt(hour),
        averageEngagement: timeGroups[hour].totalEngagement / timeGroups[hour].count
    }));
    
    // Sort by average engagement and take top 5
    avgTimes.sort((a, b) => b.averageEngagement - a.averageEngagement);
    const topTimes = avgTimes.slice(0, 5);
    
    container.innerHTML = topTimes.map(time => `
        <div class="time-card">
            <div class="time-value">${time.hour}:00</div>
            <div class="engagement-score">${time.averageEngagement.toFixed(2)}</div>
            <div data-translate="engagementScore">درجة التفاعل</div>
        </div>
    `).join('');
}

// Analyze competitor
async function analyzeCompetitor() {
    const token = localStorage.getItem('token');
    const competitorPageId = document.getElementById('competitor-page-id').value.trim();
    
    if (!competitorPageId) {
        showError('يرجى إدخال معرف صفحة المنافس أو الرابط');
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        // Extract page ID from URL if needed
        let pageId = competitorPageId;
        if (pageId.includes('facebook.com/')) {
            const urlParts = pageId.split('/');
            pageId = urlParts[urlParts.length - 1];
        }
        
        // Send request to analyze competitor
        const response = await fetch('/.netlify/functions/api/competitor/analyze', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ competitorPageId: pageId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            competitorAnalytics = data.analytics;
            updateCompetitorResults();
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error('Error analyzing competitor:', error);
        showError('حدث خطأ في تحليل المنافس');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// Update competitor results
function updateCompetitorResults() {
    if (!competitorAnalytics) {
        return;
    }
    
    // Show results section
    document.getElementById('competitor-results').style.display = 'block';
    
    // Update summary
    document.getElementById('competitor-summary-text').textContent = competitorAnalytics.summary || 'لا توجد ملخصات';
    
    // Update stats
    const stats = competitorAnalytics.engagement_stats || {};
    document.getElementById('competitor-total-likes').textContent = stats.total_likes || 0;
    document.getElementById('competitor-total-shares').textContent = stats.total_shares || 0;
    document.getElementById('competitor-total-comments').textContent = stats.total_comments || 0;
    document.getElementById('competitor-engagement-rate').textContent = `${stats.engagement_rate || 0}%`;
    
    // Update top posts table
    const topPostsTable = document.getElementById('competitor-top-posts-table');
    const topPosts = competitorAnalytics.top_posts || [];
    
    if (topPosts.length === 0) {
        topPostsTable.innerHTML = '<tr><td colspan="5" class="loading">لا توجد بيانات منشورات</td></tr>';
    } else {
        topPostsTable.innerHTML = topPosts.map(post => `
            <tr>
                <td class="post-preview">${post.message || 'لا يوجد محتوى'}</td>
                <td>${post.likes || 0}</td>
                <td>${post.shares || 0}</td>
                <td>${post.comments || 0}</td>
                <td>${(post.likes || 0) + (post.shares || 0) + (post.comments || 0)}</td>
            </tr>
        `).join('');
    }
    
    // Update keywords
    const keywordsContainer = document.getElementById('competitor-keywords');
    const keywords = competitorAnalytics.keywords || [];
    
    if (keywords.length === 0) {
        keywordsContainer.innerHTML = '<span class="loading">لا توجد بيانات كلمات مفتاحية</span>';
    } else {
        keywordsContainer.innerHTML = keywords.map(keyword => 
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');
    }
}

// Download report
function downloadReport() {
    if (!competitorAnalytics) {
        showError('لا توجد بيانات لتنزيلها');
        return;
    }
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add summary
    csvContent += "ملخص التحليل\\n";
    csvContent += `"${competitorAnalytics.summary || 'لا توجد ملخصات'}"\\n\\n`;
    
    // Add stats
    csvContent += "الإحصائيات\\n";
    const stats = competitorAnalytics.engagement_stats || {};
    csvContent += `إجمالي الإعجابات,${stats.total_likes || 0}\\n`;
    csvContent += `إجمالي المشاركات,${stats.total_shares || 0}\\n`;
    csvContent += `إجمالي التعليقات,${stats.total_comments || 0}\\n`;
    csvContent += `معدل التفاعل,${stats.engagement_rate || 0}%\\n\\n`;
    
    // Add top posts
    csvContent += "أفضل المنشورات\\n";
    csvContent += "المحتوى,الإعجابات,المشاركات,التعليقات,إجمالي التفاعل\\n";
    
    const topPosts = competitorAnalytics.top_posts || [];
    topPosts.forEach(post => {
        const totalEngagement = (post.likes || 0) + (post.shares || 0) + (post.comments || 0);
        csvContent += `"${post.message || 'لا يوجد محتوى'}",${post.likes || 0},${post.shares || 0},${post.comments || 0},${totalEngagement}\\n`;
    });
    
    // Add keywords
    csvContent += "\\nالكلمات المفتاحية\\n";
    const keywords = competitorAnalytics.keywords || [];
    csvContent += keywords.join(",") + "\\n";
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "تقرير_المنافس.csv");
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Refresh analytics data
async function refreshAnalytics() {
    const period = document.getElementById('time-period').value;
    await loadAnalyticsData(period);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadAnalyticsData();
    
    // Time period change event
    document.getElementById('time-period').addEventListener('change', function() {
        loadAnalyticsData(this.value);
    });
    
    // Refresh button event
    document.getElementById('refresh-analytics').addEventListener('click', refreshAnalytics);
    
    // Competitor analysis button event
    document.getElementById('analyze-competitor').addEventListener('click', analyzeCompetitor);
    
    // Download report button event
    document.getElementById('download-report').addEventListener('click', downloadReport);
    
    // Logout link event
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.removeAttribute('onclick');
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});