"""
Pinaka FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from core.config import settings
from core.database import engine, Base
from routers import health, vendors, auth
from routers import auth_v2, organizations, properties, work_orders, attachments
from routers import landlords, tenants, leases, units, notifications, audit_logs, users
from routers import vendors_v2, search
from core.exceptions import setup_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    async with engine.begin() as conn:
        # Create tables (in production, use Alembic migrations)
        # await conn.run_sync(Base.metadata.create_all)
        pass
    
    yield
    
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="Pinaka API",
    description="Pinaka Property Management Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(vendors.router, prefix="/api/v1/vendors", tags=["vendors"])

# V2 API routers
app.include_router(auth_v2.router, prefix="/api/v2")
app.include_router(organizations.router, prefix="/api/v2")
app.include_router(properties.router, prefix="/api/v2")
app.include_router(work_orders.router, prefix="/api/v2")
app.include_router(attachments.router, prefix="/api/v2")
app.include_router(landlords.router, prefix="/api/v2")
app.include_router(tenants.router, prefix="/api/v2")
app.include_router(leases.router, prefix="/api/v2")
app.include_router(units.router, prefix="/api/v2")
app.include_router(notifications.router, prefix="/api/v2")
app.include_router(audit_logs.router, prefix="/api/v2")
app.include_router(users.router, prefix="/api/v2")
app.include_router(vendors_v2.router, prefix="/api/v2")
app.include_router(search.router, prefix="/api/v2")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Pinaka API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

