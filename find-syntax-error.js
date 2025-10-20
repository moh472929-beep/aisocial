// Detailed syntax checker for language-switcher.js
const fs = require('fs');
const path = require('path');

const filePath = 'public/js/language-switcher.js';
const fullPath = path.join(__dirname, filePath);

console.log('🔍 Analyzing language-switcher.js for syntax errors...\n');

try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    // Check for common syntax issues
    let openParens = 0;
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const prevChar = j > 0 ? line[j-1] : '';
            
            // Handle strings
            if ((char === '"' || char === "'") && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = '';
                }
                continue;
            }
            
            if (inString) continue;
            
            // Count brackets and parentheses
            if (char === '(') openParens++;
            if (char === ')') openParens--;
            if (char === '{') openBraces++;
            if (char === '}') openBraces--;
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;
            
            // Check for negative counts (closing without opening)
            if (openParens < 0) {
                console.log(`❌ Line ${lineNum}: Extra closing parenthesis`);
                console.log(`   ${line.trim()}`);
                return;
            }
            if (openBraces < 0) {
                console.log(`❌ Line ${lineNum}: Extra closing brace`);
                console.log(`   ${line.trim()}`);
                return;
            }
            if (openBrackets < 0) {
                console.log(`❌ Line ${lineNum}: Extra closing bracket`);
                console.log(`   ${line.trim()}`);
                return;
            }
        }
        
        // Check for specific problematic patterns
        if (line.includes('console.log') && !line.includes(';') && line.trim().endsWith(')')) {
            console.log(`⚠️  Line ${lineNum}: Possible missing semicolon after console.log`);
            console.log(`   ${line.trim()}`);
        }
    }
    
    console.log(`Final counts:`);
    console.log(`  Open parentheses: ${openParens}`);
    console.log(`  Open braces: ${openBraces}`);
    console.log(`  Open brackets: ${openBrackets}`);
    
    if (openParens !== 0 || openBraces !== 0 || openBrackets !== 0) {
        console.log(`❌ Unmatched brackets/parentheses detected!`);
    } else {
        console.log(`✅ All brackets and parentheses are matched`);
    }
    
} catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
}