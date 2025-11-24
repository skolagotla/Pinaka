# @pinaka/api-client

Type-safe API client for FastAPI v2, generated from OpenAPI spec.

## Usage

```typescript
import { api, authenticatedApi } from "@pinaka/api-client";
import type { components } from "@pinaka/shared-types/v2-api";

// GET request
const { data, error } = await api.GET("/api/v2/properties", {
  params: {
    query: { page: 1, limit: 10 }
  }
});

// POST request
const { data, error } = await authenticatedApi.POST("/api/v2/properties", {
  body: {
    landlord_id: "...",
    address_line1: "...",
    // ... fully typed!
  }
});
```

## Types

All types are available from `@pinaka/shared-types/v2-api`:

```typescript
import type { components, paths } from "@pinaka/shared-types/v2-api";

type Property = components["schemas"]["Property"];
type PropertyCreate = components["schemas"]["PropertyCreate"];
```

