/**
 * Codemod: Move duplicated UI components to packages/ui
 * 
 * Usage:
 *   npx jscodeshift -t ci/codemods/move-to-ui-package.js . --extensions=tsx,jsx
 * 
 * This is a template codemod - customize based on specific duplication patterns
 */

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Example: Replace duplicated component imports
  // This is a template - customize based on actual duplication patterns found

  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;

    // Replace relative component imports with @pinaka/ui
    // Example: import { Button } from '../../components/Button'
    // Becomes: import { Button } from '@pinaka/ui'
    
    // This is just an example - customize based on actual patterns
  });

  return root.toSource();
};

