import fs from 'fs';
import path from 'path';

const modelsDir = path.join(process.cwd(), 'src', 'models');
const modelFiles = [
  'Analytics.js',
  'AutoResponse.js',
  'TrendingTopic.js',
  'UserData.js',
  'CompetitorAnalytics.js'
];

async function convertFile(filePath) {
  console.log(`Converting ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace require statements
  content = content.replace(
    /const\s*{\s*ObjectId\s*}\s*=\s*require\(['"]mongodb['"]\);/g, 
    `import { ObjectId } from 'mongodb';`
  );
  
  content = content.replace(
    /const\s*dbConnection\s*=\s*require\(['"]\.\.\/db\/connection['"]\);/g,
    `import { getDb } from '../db/connection.js';`
  );
  
  // Replace getDb calls
  content = content.replace(
    /const\s*db\s*=\s*dbConnection\.getDb\(\);/g,
    `const db = getDb();`
  );
  
  // Replace module.exports
  content = content.replace(
    /module\.exports\s*=\s*(\w+);/g,
    `export default $1;`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Converted ${filePath}`);
}

async function main() {
  for (const file of modelFiles) {
    const filePath = path.join(modelsDir, file);
    if (fs.existsSync(filePath)) {
      await convertFile(filePath);
    } else {
      console.log(`File ${filePath} does not exist, skipping`);
    }
  }
  console.log('All model files converted successfully!');
}

main().catch(console.error);