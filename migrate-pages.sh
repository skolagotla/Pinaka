#!/bin/bash
# Script to help migrate pages from Prisma to FastAPI v2

echo "📋 Pages to migrate:"
echo "  - properties/page.jsx"
echo "  - tenants/page.jsx"
echo "  - leases/page.jsx"
echo "  - operations/page.jsx"
echo "  - payments/page.jsx"
echo "  - financials/page.jsx"
echo ""
echo "These pages need to be converted from server components (withAuth + Prisma)"
echo "to client components using React Query hooks (useV2Data)"
