/**
 * Codemod: Replace local type imports with @pinaka/schemas
 * 
 * Usage:
 *   npx jscodeshift -t ci/codemods/replace-local-types.js . --extensions=ts,tsx,js,jsx
 * 
 * This codemod replaces:
 *   import { Type } from '../local/types'
 *   import { Type } from '../../local/types'
 *   import { Type } from '@/lib/schemas' (if not already using @pinaka/schemas)
 * 
 * With:
 *   import { Type } from '@pinaka/schemas'
 */

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all import declarations
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;

    // Replace relative paths to local types
    if (
      source.includes('../local/types') ||
      source.includes('../../local/types') ||
      source.includes('../../../local/types') ||
      source.includes('../../../../local/types')
    ) {
      path.node.source.value = '@pinaka/schemas';
      return;
    }

    // Replace @/lib/schemas with @pinaka/schemas (if not already @pinaka/schemas)
    if (source === '@/lib/schemas' || source === '@/lib/schemas/') {
      path.node.source.value = '@pinaka/schemas';
      return;
    }
  });

  return root.toSource();
};

