const fs = require('fs');
const path = require('path');

// Copy generated-types.ts and fix import paths
const srcFile = path.join(__dirname, '../../schema/types/src/generated-types.ts');
const destFile = path.join(__dirname, 'src/generated-types.ts');

if (fs.existsSync(srcFile)) {
  let content = fs.readFileSync(srcFile, 'utf-8');
  
  // Replace relative imports with path alias that will work with tsconfig
  // Use @/ alias which is configured in tsconfig.json
  content = content.replace(/from ['"]\.\.\/domains\//g, "from '@/schema/types/domains/");
  
  fs.writeFileSync(destFile, content, 'utf-8');
  console.log('✅ Prepared generated-types.ts for build');
} else {
  console.error('❌ Source file not found:', srcFile);
  process.exit(1);
}

