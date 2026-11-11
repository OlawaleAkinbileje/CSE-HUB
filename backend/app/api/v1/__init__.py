from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.resources import router as resources_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.admin import router as admin_router
from app.api.v1.admin import support_router
from app.api.v1.notifications import router as notifications_router

api_router = APIRouter()

# Register endpoint groups
api_router.include_router(auth_router)
api_router.include_router(resources_router)
api_router.include_router(dashboard_router)
api_router.include_router(admin_router)
api_router.include_router(support_router)
api_router.include_router(notifications_router)
