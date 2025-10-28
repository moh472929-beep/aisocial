import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directories to process
const directories = [
  path.join(__dirname, 'src', 'api'),
  path.join(__dirname, 'src', 'utils'),
  path.join(__dirname, 'src', 'middleware'),
  path.join(__dirname, 'src', 'services'),
  path.join(__dirname, 'src', 'routes'),
  path.join(__dirname, 'src', 'db')
];

// Process files in a directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      fixImports(filePath);
    }
  });
}

// Fix imports in a file
function fixImports(filePath) {
  console.log(`Fixing imports in ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix package imports by removing .js extension
  content = content.replace(/from ["']([^./][^"']*?)\.js["']/g, 'from "$1"');
  
  // Fix dynamic imports
  content = content.replace(/import\s*\(\s*["']([^./][^"']*?)\.js["']\s*\)/g, 'import("$1")');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Main execution
console.log('Starting import fixes...');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});
console.log('Import fixes complete!');