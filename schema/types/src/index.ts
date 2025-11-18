/**
 * @pinaka/schema-types - Canonical Schema Types
 * 
 * ⭐ SINGLE SOURCE OF TRUTH ⭐
 * 
 * This package provides:
 * - Schema registry (canonical source)
 * - Generated TypeScript types
 * - Generated runtime validators
 * - OpenAPI generation
 * 
 * Version: 1.0.0
 */

// Export registry (canonical source)
export { schemaRegistry, SCHEMA_VERSION, getRegistryMetadata, validateRegistry } from '../registry';

// Export generated types
export * from './generated-types';

// Export generated validators
export * from './generated-validators';

// Re-export Zod for convenience
export { z } from 'zod';

