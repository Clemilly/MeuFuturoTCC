"""
Repository for platform statistics.
"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from repositories.base import BaseRepository
from models.platform_stats import PlatformStats


class PlatformStatsRepository(BaseRepository[PlatformStats]):
    """Repository for platform statistics operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(PlatformStats, db)
    
    async def get_latest_stats(self) -> Optional[PlatformStats]:
        """Get the latest platform statistics."""
        result = await self.db.execute(
            select(PlatformStats)
            .order_by(PlatformStats.last_updated.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def create_or_update_stats(self, stats_data: dict) -> PlatformStats:
        """Create or update platform statistics."""
        existing_stats = await self.get_latest_stats()
        
        if existing_stats:
            # Update existing stats
            for key, value in stats_data.items():
                setattr(existing_stats, key, value)
            await self.db.flush()
            await self.db.refresh(existing_stats)
            return existing_stats
        else:
            # Create new stats
            return await self.create(**stats_data)
    
    async def calculate_platform_uptime(self) -> float:
        """Calculate platform uptime percentage."""
        # This is a simplified calculation
        # In a real implementation, you'd track actual uptime
        return 99.9  # Placeholder value
