from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router

is_production = settings.ENVIRONMENT.lower() == "production"
configured_origins = [
    origin.strip().rstrip("/")
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]
if is_production and not configured_origins:
    raise RuntimeError("CORS_ORIGINS must contain the deployed frontend origin in production.")
if is_production and settings.SECRET_KEY == "your-super-secret-key-change-in-production":
    raise RuntimeError("SECRET_KEY must be configured with a unique secret in production.")

allowed_origins = configured_origins if is_production else [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *configured_origins,
]

app = FastAPI(
    title="CSE Hub API",
    description="Backend API for Department of Computer Science & Engineering Resource Platform",
    version="1.0.0"
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=None if is_production else r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Route
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "CSE Hub Backend"}

# Root Route
@app.get("/")
def root():
    return {"message": "CSE Search Engine API is running"}

# Mount all v1 API routes under /api/v1
app.include_router(api_router, prefix="/api/v1")
