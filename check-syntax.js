// Simple syntax checker for JavaScript files
const fs = require('fs');
const path = require('path');

const jsFiles = [
    'public/js/dashboard.js',
    'public/js/session-manager.js',
    'public/js/language-switcher.js',
    'public/js/login.js',
    'public/js/main.js',
    'public/js/access-control.js'
];

console.log('🔍 Checking JavaScript files for syntax errors...\n');

jsFiles.forEach(filePath => {
    try {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Try to parse the JavaScript
            new Function(content);
            console.log(`✅ ${filePath} - No syntax errors`);
        } else {
            console.log(`⚠️  ${filePath} - File not found`);
        }
    } catch (error) {
        console.log(`❌ ${filePath} - Syntax error:`);
        console.log(`   ${error.message}`);
        
        // Try to find the line number
        const match = error.message.match(/line (\d+)/i);
        if (match) {
            const lineNum = parseInt(match[1]);
            console.log(`   Error at line ${lineNum}`);
        }
        console.log('');
    }
});

console.log('\n🏁 Syntax check complete.');