/**
 * Codemod: Extract repeated hook to shared package
 * 
 * Usage:
 *   npx jscodeshift -t ci/codemods/extract-hook-to-shared.js . --extensions=ts,tsx,js,jsx --hook-name=useAuth
 * 
 * This codemod:
 * 1. Finds all instances of a hook (e.g., useAuth)
 * 2. Replaces local implementations with import from @pinaka/ui/hooks
 * 
 * Example:
 *   Before: function useAuth() { ... }
 *   After: import { useAuth } from '@pinaka/ui/hooks/useAuth'
 */

module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const hookName = options.hookName || 'useAuth';

  // Pattern 1: Function declaration
  // function useAuth() { ... }
  root.find(j.FunctionDeclaration, {
    id: { name: hookName },
  }).forEach((path) => {
    // Check if this is a hook (starts with 'use')
    if (hookName.startsWith('use')) {
      // Replace function declaration with import
      const importStatement = j.importDeclaration(
        [j.importSpecifier(j.identifier(hookName))],
        j.literal(`@pinaka/ui/hooks/${hookName}`)
      );
      
      // Remove the function declaration
      path.prune();
      
      // Add import at the top (if not already present)
      const existingImports = root.find(j.ImportDeclaration, {
        source: { value: `@pinaka/ui/hooks/${hookName}` },
      });
      
      if (existingImports.length === 0) {
        const firstImport = root.find(j.ImportDeclaration).at(0);
        if (firstImport.length > 0) {
          firstImport.insertBefore(importStatement);
        } else {
          root.get().node.program.body.unshift(importStatement);
        }
      }
    }
  });

  // Pattern 2: Const arrow function
  // const useAuth = () => { ... }
  root.find(j.VariableDeclarator, {
    id: { name: hookName },
    init: {
      type: 'ArrowFunctionExpression',
    },
  }).forEach((path) => {
    if (hookName.startsWith('use')) {
      // Replace variable declaration with import
      const importStatement = j.importDeclaration(
        [j.importSpecifier(j.identifier(hookName))],
        j.literal(`@pinaka/ui/hooks/${hookName}`)
      );
      
      // Remove the variable declaration
      const parent = path.parent;
      if (parent.value.declarations.length === 1) {
        parent.prune();
      } else {
        path.prune();
      }
      
      // Add import at the top (if not already present)
      const existingImports = root.find(j.ImportDeclaration, {
        source: { value: `@pinaka/ui/hooks/${hookName}` },
      });
      
      if (existingImports.length === 0) {
        const firstImport = root.find(j.ImportDeclaration).at(0);
        if (firstImport.length > 0) {
          firstImport.insertBefore(importStatement);
        } else {
          root.get().node.program.body.unshift(importStatement);
        }
      }
    }
  });

  // Pattern 3: Const function expression
  // const useAuth = function() { ... }
  root.find(j.VariableDeclarator, {
    id: { name: hookName },
    init: {
      type: 'FunctionExpression',
    },
  }).forEach((path) => {
    if (hookName.startsWith('use')) {
      // Replace variable declaration with import
      const importStatement = j.importDeclaration(
        [j.importSpecifier(j.identifier(hookName))],
        j.literal(`@pinaka/ui/hooks/${hookName}`)
      );
      
      // Remove the variable declaration
      const parent = path.parent;
      if (parent.value.declarations.length === 1) {
        parent.prune();
      } else {
        path.prune();
      }
      
      // Add import at the top (if not already present)
      const existingImports = root.find(j.ImportDeclaration, {
        source: { value: `@pinaka/ui/hooks/${hookName}` },
      });
      
      if (existingImports.length === 0) {
        const firstImport = root.find(j.ImportDeclaration).at(0);
        if (firstImport.length > 0) {
          firstImport.insertBefore(importStatement);
        } else {
          root.get().node.program.body.unshift(importStatement);
        }
      }
    }
  });

  return root.toSource();
};

