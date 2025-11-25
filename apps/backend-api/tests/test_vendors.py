"""
Tests for vendor endpoints
"""

import pytest
from httpx import AsyncClient
from db.models import ServiceProvider
from core.auth import create_access_token
from datetime import timedelta
from core.config import settings


@pytest.fixture
def auth_token():
    """Create a test auth token"""
    return create_access_token(
        data={"sub": "test_user_id", "role": "super_admin", "email": "test@pinaka.com"},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint"""
    response = await client.get("/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_list_vendors_empty(client: AsyncClient, auth_token: str):
    """Test listing vendors when none exist"""
    response = await client.get(
        "/api/v2/vendors",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == []
    assert data["pagination"]["total"] == 0


@pytest.mark.asyncio
async def test_create_vendor(client: AsyncClient, auth_token: str, db_session):
    """Test creating a vendor"""
    vendor_data = {
        "type": "vendor",
        "name": "Test Vendor",
        "email": "vendor@test.com",
        "phone": "1234567890",
        "category": "plumbing",
    }
    
    response = await client.post(
        "/api/v2/vendors",
        json=vendor_data,
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Test Vendor"
    assert data["data"]["email"] == "vendor@test.com"


@pytest.mark.asyncio
async def test_get_vendor_not_found(client: AsyncClient, auth_token: str):
    """Test getting a non-existent vendor"""
    response = await client.get(
        "/api/v2/vendors/non_existent_id",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_vendors_with_filters(client: AsyncClient, auth_token: str, db_session):
    """Test listing vendors with filters"""
    # Create test vendors
    vendor1 = ServiceProvider(
        id="test_vendor_1",
        provider_id="provider_1",
        type="vendor",
        name="Plumbing Vendor",
        email="plumbing@test.com",
        phone="1234567890",
        category="plumbing",
        is_active=True,
    )
    vendor2 = ServiceProvider(
        id="test_vendor_2",
        provider_id="provider_2",
        type="vendor",
        name="Electrical Vendor",
        email="electrical@test.com",
        phone="0987654321",
        category="electrical",
        is_active=True,
    )
    
    db_session.add(vendor1)
    db_session.add(vendor2)
    await db_session.commit()
    
    # Test filter by category
    response = await client.get(
        "/api/v1/vendors?category=plumbing",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["category"] == "plumbing"

