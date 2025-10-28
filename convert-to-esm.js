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
  path.join(__dirname, 'src', 'routes')
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
      convertToESM(filePath);
    }
  });
}

// Convert a file to ESM
function convertToESM(filePath) {
  console.log(`Converting ${filePath} to ESM...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace require statements with imports
  content = content.replace(/const\s+(\w+)\s+=\s+require\(['"]([^'"]+)['"]\);/g, 'import $1 from "$2.js";');
  content = content.replace(/const\s+{\s*([^}]+)\s*}\s+=\s+require\(['"]([^'"]+)['"]\);/g, 'import { $1 } from "$2.js";');
  
  // Replace module.exports with export default
  content = content.replace(/module\.exports\s+=\s+(\w+);/g, 'export default $1;');
  
  // Replace exports.x = y with export const x = y
  content = content.replace(/exports\.(\w+)\s+=\s+([^;]+);/g, 'export const $1 = $2;');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Main execution
console.log('Starting conversion to ES Modules...');
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});
console.log('Conversion complete!');