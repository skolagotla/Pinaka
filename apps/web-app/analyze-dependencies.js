/**
 * Dependency Analysis Script
 * 
 * Analyzes React components and their dependencies to identify:
 * 1. Circular dependencies
 * 2. Version conflicts
 * 3. Module resolution issues
 * 4. Potential webpack bundling problems
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const appDir = path.join(__dirname, 'app');
// lib is at workspace root, not in web-app
const libDir = path.join(__dirname, '../../lib');

const issues = {
  circular: [],
  missing: [],
  versionConflicts: [],
  webpackIssues: [],
  antdImports: [],
  reactImports: [],
  dynamicImports: [],
};

// Read package.json to check versions
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// Check for version conflicts
const reactVersion = packageJson.dependencies?.react;
const antdVersion = packageJson.dependencies?.antd; // May be commented out
const nextVersion = packageJson.dependencies?.next;
const flowbiteReactVersion = packageJson.dependencies?.['flowbite-react'];
const reactIconsVersion = packageJson.dependencies?.['react-icons'];

console.log('\n📦 Version Analysis:');
console.log(`  React: ${reactVersion || 'N/A'}`);
console.log(`  React-DOM: ${packageJson.dependencies?.['react-dom'] || 'N/A'}`);
console.log(`  Next.js: ${nextVersion || 'N/A'}`);
console.log(`  Flowbite React: ${flowbiteReactVersion || 'N/A'}`);
console.log(`  React Icons: ${reactIconsVersion || 'N/A'}`);
console.log(`  Ant Design: ${antdVersion || 'REMOVED (migrated to Flowbite)'}`);
console.log(`  @ant-design/pro-layout: ${packageJson.dependencies?.['@ant-design/pro-layout'] || 'REMOVED'}`);
console.log(`  @ant-design/pro-components: ${packageJson.dependencies?.['@ant-design/pro-components'] || 'REMOVED'}`);

// Check for known compatibility issues
const compatibilityIssues = [];

// Note: Ant Design has been migrated to Flowbite, so these checks are no longer relevant
// Keeping for reference in case any legacy code remains

// Next.js 14.2.25 should work with React 18.3.1
if (nextVersion && reactVersion) {
  if (nextVersion.includes('14.2.25') && !reactVersion.includes('18.3')) {
    compatibilityIssues.push({
      type: 'version',
      message: `Next.js 14.2.25 works best with React 18.3.1`,
      severity: 'info',
    });
  }
}

if (compatibilityIssues.length > 0) {
  console.log('\n⚠️  Compatibility Warnings:');
  compatibilityIssues.forEach(issue => {
    console.log(`  ${issue.severity.toUpperCase()}: ${issue.message}`);
  });
}

// Analyze imports in all files
function analyzeFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const imports = {
      react: [],
      antd: [],
      next: [],
      local: [],
      dynamic: [],
    };
    
    lines.forEach((line, index) => {
      // React imports
      if (line.match(/^import.*from ['"]react['"]/)) {
        imports.react.push({ line: index + 1, content: line.trim() });
      }
      
      // Ant Design imports (should be migrated to Flowbite)
      if (line.match(/from ['"]antd['"]|from ['"]@ant-design/)) {
        imports.antd.push({ line: index + 1, content: line.trim() });
        issues.antdImports.push({ file: relativePath, line: index + 1 });
      }
      
      // Next.js imports
      if (line.match(/from ['"]next\//)) {
        imports.next.push({ line: index + 1, content: line.trim() });
      }
      
      // Local imports (potential circular dependencies)
      if (line.match(/from ['"]@\/components|from ['"]@\/lib/)) {
        const match = line.match(/from ['"](@\/[^'"]+)['"]/);
        if (match) {
          imports.local.push({ line: index + 1, import: match[1], content: line.trim() });
        }
      }
      
      // Dynamic imports
      if (line.match(/dynamic\(|import\(/)) {
        imports.dynamic.push({ line: index + 1, content: line.trim() });
        issues.dynamicImports.push({ file: relativePath, line: index + 1 });
      }
    });
    
    return imports;
  } catch (error) {
    issues.missing.push({ file: relativePath, error: error.message });
    return null;
  }
}

// Find all component files
function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && !file.startsWith('.')) {
        findFiles(filePath, fileList);
      }
    } else if (file.match(/\.(jsx|tsx|js|ts)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('\n🔍 Analyzing Components...');

const allFiles = [
  ...findFiles(componentsDir),
  ...findFiles(appDir),
  ...findFiles(libDir),
];

console.log(`  Found ${allFiles.length} files to analyze`);

const fileAnalysis = {};

allFiles.forEach(filePath => {
  const relativePath = path.relative(__dirname, filePath);
  const analysis = analyzeFile(filePath, relativePath);
  if (analysis) {
    fileAnalysis[relativePath] = analysis;
  }
});

// Check for potential circular dependencies
console.log('\n🔄 Checking for Circular Dependencies...');
const circularChecks = [];

Object.keys(fileAnalysis).forEach(file => {
  const imports = fileAnalysis[file];
  imports.local.forEach(localImport => {
    const importPath = localImport.import;
    // Check if this import might create a cycle
    // This is a simplified check - full analysis would require graph traversal
    if (importPath.includes('components') && file.includes('components')) {
      circularChecks.push({
        file,
        import: importPath,
        line: localImport.line,
      });
    }
  });
});

if (circularChecks.length > 0) {
  console.log(`  Found ${circularChecks.length} potential circular dependency candidates`);
  console.log('  Top 10:');
  circularChecks.slice(0, 10).forEach(check => {
    console.log(`    ${check.file}:${check.line} -> ${check.import}`);
  });
} else {
  console.log('  No obvious circular dependencies found');
}

// Summary
console.log('\n📊 Summary:');
console.log(`  Total files analyzed: ${allFiles.length}`);
console.log(`  Files with Ant Design imports (should be 0 after migration): ${issues.antdImports.length}`);
if (issues.antdImports.length > 0) {
  console.log('  ⚠️  WARNING: Found Ant Design imports. These should be migrated to Flowbite.');
  console.log('  Top 10 files with Ant Design imports:');
  issues.antdImports.slice(0, 10).forEach(imp => {
    console.log(`    - ${imp.file}:${imp.line}`);
  });
}
console.log(`  Files with dynamic imports: ${issues.dynamicImports.length}`);
console.log(`  Potential circular dependencies: ${circularChecks.length}`);
console.log(`  Missing files: ${issues.missing.length}`);

// Check for webpack-specific issues
console.log('\n🔧 Webpack-Specific Issues:');

// Check for problematic patterns
const webpackIssues = [];

allFiles.forEach(filePath => {
  const relativePath = path.relative(__dirname, filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for require() in client components
    if (content.includes('"use client"') && content.match(/require\(/)) {
      webpackIssues.push({
        file: relativePath,
        issue: 'require() in client component (should use import)',
        severity: 'warning',
      });
    }
    
    // Check for module.exports in ES modules
    if (content.match(/module\.exports/)) {
      webpackIssues.push({
        file: relativePath,
        issue: 'module.exports in ES module (should use export)',
        severity: 'error',
      });
    }
    
    // Check for default exports that might be undefined
    if (content.match(/export default\s*$/m)) {
      webpackIssues.push({
        file: relativePath,
        issue: 'Empty default export (might cause undefined)',
        severity: 'error',
      });
    }
  } catch (error) {
    // Skip
  }
});

if (webpackIssues.length > 0) {
  console.log(`  Found ${webpackIssues.length} potential webpack issues:`);
  webpackIssues.slice(0, 10).forEach(issue => {
    console.log(`    ${issue.severity.toUpperCase()}: ${issue.file} - ${issue.issue}`);
  });
} else {
  console.log('  No obvious webpack issues found');
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('  1. ✅ Ant Design → Flowbite migration complete');
console.log('  2. Ensure all React components use consistent React version (18.3.1)');
console.log('  3. Check for circular dependencies between shared components');
console.log('  4. Verify all dynamic imports have proper error handling');
console.log('  5. Ensure client components ("use client") don\'t use require()');
console.log('  6. Check that all default exports are properly defined');
if (issues.antdImports.length > 0) {
  console.log('  7. ⚠️  Migrate remaining Ant Design imports to Flowbite components');
}

// Write detailed report
const report = {
  timestamp: new Date().toISOString(),
  versions: {
    react: reactVersion,
    reactDom: packageJson.dependencies?.['react-dom'],
    next: nextVersion,
    flowbiteReact: flowbiteReactVersion,
    reactIcons: reactIconsVersion,
    antd: antdVersion || 'REMOVED (migrated to Flowbite)',
  },
  stats: {
    totalFiles: allFiles.length,
    antdImports: issues.antdImports.length,
    dynamicImports: issues.dynamicImports.length,
    circularCandidates: circularChecks.length,
    webpackIssues: webpackIssues.length,
  },
  issues: {
    compatibility: compatibilityIssues,
    circular: circularChecks.slice(0, 20),
    webpack: webpackIssues,
  },
};

fs.writeFileSync(
  path.join(__dirname, 'dependency-analysis-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n✅ Analysis complete! Report saved to dependency-analysis-report.json');

