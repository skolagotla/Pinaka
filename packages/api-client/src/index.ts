/**
 * @pinaka/api-client - Type-safe API Client
 * 
 * V2: Uses openapi-fetch with types from FastAPI OpenAPI spec
 */

export { api, authenticatedApi, getAuthHeaders } from './api-client';
export type { paths, components } from '@pinaka/shared-types/v2-api';

