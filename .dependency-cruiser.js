/**
 * Dependency Cruiser Configuration
 * 
 * Enforces architectural boundaries in Domain-Driven Design structure
 * 
 * Install: npm install -D dependency-cruiser
 * Run: npx depcruise --config .dependency-cruiser.js src
 */

module.exports = {
  forbidden: [
    {
      name: 'no-cross-domain-imports',
      comment: 'Domains should not import from other domains directly',
      severity: 'error',
      from: {
        path: '^domains/([^/]+)',
      },
      to: {
        path: '^domains/(?!\\1)',
      },
    },
    {
      name: 'no-domain-to-infrastructure',
      comment: 'Domain layer should not depend on infrastructure',
      severity: 'error',
      from: {
        path: '^domains/[^/]+/domain',
      },
      to: {
        path: '^domains/[^/]+/infrastructure',
      },
    },
    {
      name: 'no-domain-to-interfaces',
      comment: 'Domain layer should not depend on interfaces',
      severity: 'error',
      from: {
        path: '^domains/[^/]+/domain',
      },
      to: {
        path: '^domains/[^/]+/interfaces',
      },
    },
    {
      name: 'no-application-to-infrastructure',
      comment: 'Application layer should depend on domain interfaces, not infrastructure directly',
      severity: 'warn',
      from: {
        path: '^domains/[^/]+/application',
      },
      to: {
        path: '^domains/[^/]+/infrastructure',
      },
    },
    {
      name: 'interfaces-must-use-schemas',
      comment: 'Interfaces should use @pinaka/schemas for DTOs',
      severity: 'warn',
      from: {
        path: '^domains/[^/]+/interfaces',
      },
      to: {
        path: '^(?!@pinaka/schemas|@/lib/schemas|@/schema)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^node_modules/[^/]+',
      },
    },
  },
};

