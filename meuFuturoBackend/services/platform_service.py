"""
Platform service for managing platform statistics and metrics.
"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from repositories.platform_stats_repository import PlatformStatsRepository
from repositories.user import UserRepository
from repositories.transaction import TransactionRepository
from repositories.category import CategoryRepository
from repositories.ai_prediction import AIPredictionRepository
from schemas.about import PlatformStatsResponse
from models.platform_stats import PlatformStats

logger = structlog.get_logger()


class PlatformService:
    """Service for platform statistics and metrics."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.platform_stats_repo = PlatformStatsRepository(db)
        self.user_repo = UserRepository(db)
        self.transaction_repo = TransactionRepository(db)
        self.category_repo = CategoryRepository(db)
        self.ai_repo = AIPredictionRepository(db)
    
    async def get_platform_stats(self) -> PlatformStatsResponse:
        """Get current platform statistics."""
        try:
            # Get latest stats or calculate new ones
            stats = await self.platform_stats_repo.get_latest_stats()
            
            if not stats:
                # Calculate and create new stats
                stats = await self._calculate_platform_stats()
            
            return PlatformStatsResponse(
                total_users=stats.total_users,
                total_transactions=stats.total_transactions,
                total_categories=stats.total_categories,
                total_goals=0,  # Not implemented yet
                total_budgets=0,  # Not implemented yet
                total_ai_predictions=stats.total_ai_predictions,
                total_alerts=0,  # Not implemented yet
                platform_uptime=stats.platform_uptime,
                last_updated=stats.last_updated
            )
        except Exception as e:
            logger.error("Error getting platform stats", error=str(e))
            raise
    
    async def update_platform_stats(self) -> None:
        """Update platform statistics."""
        try:
            stats_data = await self._calculate_platform_stats_data()
            await self.platform_stats_repo.create_or_update_stats(stats_data)
            logger.info("Platform stats updated successfully")
        except Exception as e:
            logger.error("Error updating platform stats", error=str(e))
            raise
    
    async def _calculate_platform_stats(self) -> PlatformStats:
        """Calculate and create new platform statistics."""
        stats_data = await self._calculate_platform_stats_data()
        return await self.platform_stats_repo.create(**stats_data)
    
    async def _calculate_platform_stats_data(self) -> dict:
        """Calculate platform statistics data."""
        try:
            # Count users
            total_users = await self.user_repo.count()
            
            # Count transactions
            total_transactions = await self.transaction_repo.count()
            
            # Count categories
            total_categories = await self.category_repo.count()
            
            # Count AI predictions
            total_ai_predictions = await self.ai_repo.count()
            
            # Calculate uptime (simplified)
            platform_uptime = await self.platform_stats_repo.calculate_platform_uptime()
            
            return {
                'total_users': total_users,
                'total_transactions': total_transactions,
                'total_categories': total_categories,
                'total_goals': 0,  # Not implemented yet
                'total_budgets': 0,  # Not implemented yet
                'total_ai_predictions': total_ai_predictions,
                'total_alerts': 0,  # Not implemented yet
                'platform_uptime': platform_uptime
            }
        except Exception as e:
            logger.error("Error calculating platform stats data", error=str(e))
            # Return default values if calculation fails
            return {
                'total_users': 0,
                'total_transactions': 0,
                'total_categories': 0,
                'total_goals': 0,
                'total_budgets': 0,
                'total_ai_predictions': 0,
                'total_alerts': 0,
                'platform_uptime': 0.0
            }
