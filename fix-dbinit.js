import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to process
const directories = [
  'src/api',
  'src/middleware'
];

// Function to process a file
async function processFile(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace dbInit.getModel with getModel
    let newContent = content.replace(/dbInit\.getModel\(/g, 'getModel(');
    
    // Replace import dbInit from "../db/init.js"; with import { initDB, getModel } from "../db/init.js";
    newContent = newContent.replace(/import dbInit from "\.\.\/db\/init\.js";/g, 'import { initDB, getModel } from "../db/init.js";');
    
    // Write the file if changes were made
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to process a directory recursively
async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.name.endsWith('.js')) {
      await processFile(fullPath);
    }
  }
}

// Main function
async function main() {
  console.log('Starting to fix dbInit references...');
  
  for (const dir of directories) {
    const fullDir = path.join(process.cwd(), dir);
    console.log(`Processing directory: ${fullDir}`);
    await processDirectory(fullDir);
  }
  
  console.log('Finished fixing dbInit references.');
}

main().catch(console.error);