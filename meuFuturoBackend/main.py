"""
FastAPI application main entry point.

Configures the FastAPI app with all routes, middleware, and settings.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import structlog
import time

from core.config import settings
from core.logging import configure_logging, get_logger
from core.exceptions import MeuFuturoException
from core.rate_limiting import check_rate_limit, get_rate_limit_headers
from api.auth import router as auth_router
from api.financial import router as financial_router
from api.ai_predictions import router as ai_router
from api.about import router as about_router
from core.database import engine, Base

# Configure structured logging
configure_logging(
    log_level=settings.LOG_LEVEL,
    log_format=settings.LOG_FORMAT
)

logger = get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with response time."""
    start_time = time.time()
    client_ip = request.client.host if request.client else None
    
    # Log request
    logger.log_api_request(
        method=request.method,
        url=str(request.url),
        client_ip=client_ip
    )
    
    try:
        response = await call_next(request)
        
        # Calculate response time
        process_time = time.time() - start_time
        
        # Log response
        logger.log_api_response(
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            response_time=round(process_time, 4),
            client_ip=client_ip
        )
        
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        
        logger.error(
            "Request failed",
            method=request.method,
            url=str(request.url),
            error=repr(e),  # Use repr instead of str to avoid DetachedInstanceError
            response_time=round(process_time, 4),
            client_ip=client_ip
        )
        
        raise


# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    logger.warning(
        "HTTP Exception",
        status_code=exc.status_code,
        detail=exc.detail,
        url=str(request.url),
        method=request.method,
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(MeuFuturoException)
async def meu_futuro_exception_handler(request: Request, exc: MeuFuturoException):
    """Handle custom MeuFuturo exceptions."""
    http_exc = exc.to_http_exception()
    return JSONResponse(
        status_code=http_exc.status_code,
        content=http_exc.detail
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.error(
        "Validation Error",
        errors=exc.errors(),
        url=str(request.url),
        method=request.method,
    )
    
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Dados de entrada inválidos",
            "details": exc.errors(),
            "status_code": 422,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(
        "Unexpected Error",
        error=str(exc),
        error_type=type(exc).__name__,
        url=str(request.url),
        method=request.method,
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Erro interno do servidor",
            "status_code": 500,
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "MeuFuturo API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "MeuFuturo API - Sistema de Gestão Financeira Acessível",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": "/health",
    }


# Include API routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_PREFIX}/auth",
    tags=["Authentication"],
)

app.include_router(
    financial_router,
    prefix=f"{settings.API_V1_PREFIX}/financial",
    tags=["Financial Management"],
)

app.include_router(
    ai_router,
    prefix=f"{settings.API_V1_PREFIX}/ai",
    tags=["AI Insights"],
)

app.include_router(
    about_router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=["About Page"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup."""
    logger.info("Starting MeuFuturo API", version=settings.VERSION)
    
    # Create database tables (in production, use Alembic migrations)
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
    logger.info("MeuFuturo API started successfully")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    logger.info("Shutting down MeuFuturo API")
    
    # Close database connections
    await engine.dispose()
    
    logger.info("MeuFuturo API shut down successfully")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower(),
    )
