from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router

app = FastAPI(
    title="CSE Hub API",
    description="Backend API for Department of Computer Science & Engineering Resource Platform",
    version="1.0.0"
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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
