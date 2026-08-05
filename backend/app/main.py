from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.bugs import router as bugs_router
from app.api.health import router as health_router
from app.api.projects import router as projects_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Production CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Recommend restricting origins in production via settings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(bugs_router, prefix="/api")


@app.get("/")
def root():
    return {
        "application": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "status": "running",
        "message": f"Welcome to {settings.PROJECT_NAME} API 🚀"
    }