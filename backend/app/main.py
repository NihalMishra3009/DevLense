from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.api.health import router as health_router
from app.api.repositories import router as repositories_router

app = FastAPI(
    title="DevLense API",
    description="Agentic Codebase Intelligence Platform API",
    version="1.0.0"
)

# Configure CORS
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(repositories_router, prefix=settings.API_V1_STR)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request payload format",
                "details": exc.errors()
            }
        }
    )

@app.get("/")
async def root():
    return {
        "message": "DevLense Agentic Codebase Intelligence API is running.",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
