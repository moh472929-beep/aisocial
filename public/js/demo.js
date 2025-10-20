// Demo page functionality
function changeLanguage() {
    const language = document.getElementById('language').value;
    const isRTL = language === 'ar';
    
    // Update body class for RTL languages
    if (isRTL) {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
    
    // Update placeholder text
    const chatPlaceholder = document.getElementById('chat-placeholder');
    const permissionsPlaceholder = document.getElementById('permissions-placeholder');
    
    if (isRTL) {
        chatPlaceholder.innerHTML = '<p>سيظهر واجهة الدردشة هنا في التنفيذ الحقيقي</p>';
        permissionsPlaceholder.innerHTML = '<p>سيظهر واجهة أذونات الذكاء الاصطناعي هنا في التنفيذ الحقيقي</p>';
    } else {
        chatPlaceholder.innerHTML = '<p>Chat interface would appear here in a real implementation</p>';
        permissionsPlaceholder.innerHTML = '<p>AI permissions interface would appear here in a real implementation</p>';
    }
    
    // Show position change message
    const message = isRTL ? 
        'Chat position changed to LEFT side for Arabic (RTL)' : 
        'Chat position changed to RIGHT side for ' + getLanguageName(language) + ' (LTR)';
    
    alert(message);
}

function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'ru': 'Russian'
    };
    return languages[code] || 'Unknown';
}