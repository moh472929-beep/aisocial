// Simple test script to verify trending topics implementation
console.log('Testing Trending Topics Implementation...');

// Test that required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'src/models/TrendingTopic.js',
    'src/api/trendingTopicsController.js',
    'public/trending-topics.html'
];

console.log('Checking required files...');

let allFilesExist = true;
for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} does not exist`);
        allFilesExist = false;
    }
}

// Test that the API routes are properly registered
const apiFile = path.join(__dirname, 'netlify/functions/api.js');
if (fs.existsSync(apiFile)) {
    const apiContent = fs.readFileSync(apiFile, 'utf8');
    if (apiContent.includes('trendingTopics')) {
        console.log('✅ Trending topics controller is registered in API');
    } else {
        console.log('❌ Trending topics controller is not registered in API');
    }
} else {
    console.log('❌ API file does not exist');
}

// Test that the model is properly registered
const dbInitFile = path.join(__dirname, 'src/db/init.js');
if (fs.existsSync(dbInitFile)) {
    const dbInitContent = fs.readFileSync(dbInitFile, 'utf8');
    if (dbInitContent.includes('TrendingTopic')) {
        console.log('✅ Trending topics model is registered in database initializer');
    } else {
        console.log('❌ Trending topics model is not registered in database initializer');
    }
} else {
    console.log('❌ Database initializer file does not exist');
}

// Test that the language translations are added
const languageFile = path.join(__dirname, 'public/js/language-switcher.js');
if (fs.existsSync(languageFile)) {
    const languageContent = fs.readFileSync(languageFile, 'utf8');
    if (languageContent.includes('trendingTopicsTitle')) {
        console.log('✅ Trending topics translations are added to language switcher');
    } else {
        console.log('❌ Trending topics translations are not added to language switcher');
    }
} else {
    console.log('❌ Language switcher file does not exist');
}

// Test that the menu item is added to dashboard
const dashboardFile = path.join(__dirname, 'public/dashboard.html');
if (fs.existsSync(dashboardFile)) {
    const dashboardContent = fs.readFileSync(dashboardFile, 'utf8');
    if (dashboardContent.includes('trending-topics.html')) {
        console.log('✅ Trending topics menu item is added to dashboard');
    } else {
        console.log('❌ Trending topics menu item is not added to dashboard');
    }
} else {
    console.log('❌ Dashboard file does not exist');
}

console.log('\n🎉 Trending Topics Implementation Test Complete!');