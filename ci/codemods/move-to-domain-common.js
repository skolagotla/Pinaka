/**
 * Codemod: Move duplicated domain logic to packages/domain-common
 * 
 * Usage:
 *   npx jscodeshift -t ci/codemods/move-to-domain-common.js . --extensions=ts,tsx
 * 
 * This is a template codemod - customize based on specific duplication patterns
 */

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Example: Replace duplicated date formatting logic
  // This is a template - customize based on actual duplication patterns found

  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'Date' },
      property: { name: 'toLocaleString' },
    },
  }).forEach((path) => {
    // Replace with domain-common utility
    // This is just an example - customize based on actual patterns
  });

  return root.toSource();
};

