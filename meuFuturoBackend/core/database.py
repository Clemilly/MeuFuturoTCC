"""
Database configuration and session management.

Uses SQLAlchemy 2.0 with async support and PostgreSQL.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
import structlog

from core.config import settings

logger = structlog.get_logger()

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=True,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.
    
    Yields:
        AsyncSession: Database session
        
    Example:
        ```python
        @app.get("/users/")
        async def get_users(db: AsyncSession = Depends(get_db_session)):
            # Use db session here
            pass
        ```
    """
    async with AsyncSessionLocal() as session:
        try:
            logger.debug("Database session created")
            yield session
        except Exception as e:
            logger.error("Database session error", error=str(e))
            await session.rollback()
            raise
        finally:
            await session.close()
            logger.debug("Database session closed")


async def create_test_engine():
    """
    Create a test database engine for testing.
    
    Returns:
        AsyncEngine: Test database engine
    """
    if not settings.TEST_DATABASE_URL:
        raise ValueError("TEST_DATABASE_URL must be set for testing")
        
    return create_async_engine(
        settings.TEST_DATABASE_URL,
        echo=False,
        future=True,
    )


async def init_db() -> None:
    """
    Initialize database with all tables.
    
    Note:
        In production, use Alembic migrations instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")


async def drop_db() -> None:
    """
    Drop all database tables.
    
    Warning:
        This will delete all data! Only use for testing.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        logger.warning("All database tables dropped")
