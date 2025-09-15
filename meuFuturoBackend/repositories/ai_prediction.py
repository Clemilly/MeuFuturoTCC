"""
AI Prediction repository for AI prediction-specific database operations.

Extends BaseRepository with AI prediction-specific methods.
"""

from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from models.ai_prediction import AIPrediction, PredictionType, PredictionStatus
from repositories.base import BaseRepository


class AIPredictionRepository(BaseRepository[AIPrediction]):
    """Repository for AIPrediction model with specific AI prediction operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(AIPrediction, db)
    
    async def get_user_predictions(
        self,
        user_id: str,
        status: Optional[PredictionStatus] = None,
        prediction_type: Optional[PredictionType] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[AIPrediction]:
        """
        Get predictions for a specific user.
        
        Args:
            user_id: User ID
            status: Filter by prediction status
            prediction_type: Filter by prediction type
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of predictions
        """
        filters = {"user_id": user_id}
        
        if status:
            filters["status"] = status
        
        if prediction_type:
            filters["type"] = prediction_type
        
        return await self.get_all(
            skip=skip,
            limit=limit,
            filters=filters,
            order_by="-created_at"
        )
    
    async def get_active_predictions(
        self,
        user_id: str,
        prediction_type: Optional[PredictionType] = None,
    ) -> List[AIPrediction]:
        """
        Get active (non-expired) predictions for a user.
        
        Args:
            user_id: User ID
            prediction_type: Filter by prediction type
            
        Returns:
            List of active predictions
        """
        conditions = [
            AIPrediction.user_id == user_id,
            AIPrediction.status == PredictionStatus.ACTIVE,
            or_(
                AIPrediction.expires_at.is_(None),
                AIPrediction.expires_at > datetime.utcnow()
            )
        ]
        
        if prediction_type:
            conditions.append(AIPrediction.type == prediction_type)
        
        query = (
            select(AIPrediction)
            .where(and_(*conditions))
            .order_by(desc(AIPrediction.created_at))
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_high_confidence_predictions(
        self,
        user_id: str,
        confidence_threshold: float = 0.7,
        limit: int = 10,
    ) -> List[AIPrediction]:
        """
        Get high confidence predictions for a user.
        
        Args:
            user_id: User ID
            confidence_threshold: Minimum confidence score
            limit: Maximum number of predictions
            
        Returns:
            List of high confidence predictions
        """
        conditions = [
            AIPrediction.user_id == user_id,
            AIPrediction.status == PredictionStatus.ACTIVE,
            AIPrediction.confidence_score >= confidence_threshold,
            or_(
                AIPrediction.expires_at.is_(None),
                AIPrediction.expires_at > datetime.utcnow()
            )
        ]
        
        query = (
            select(AIPrediction)
            .where(and_(*conditions))
            .order_by(desc(AIPrediction.confidence_score))
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_expired_predictions(
        self,
        user_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[AIPrediction]:
        """
        Get expired predictions.
        
        Args:
            user_id: User ID (optional, if None gets for all users)
            limit: Maximum number of predictions
            
        Returns:
            List of expired predictions
        """
        conditions = [
            AIPrediction.expires_at <= datetime.utcnow(),
            AIPrediction.status == PredictionStatus.ACTIVE
        ]
        
        if user_id:
            conditions.append(AIPrediction.user_id == user_id)
        
        query = (
            select(AIPrediction)
            .where(and_(*conditions))
            .order_by(AIPrediction.expires_at)
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_latest_prediction_by_type(
        self,
        user_id: str,
        prediction_type: PredictionType,
    ) -> Optional[AIPrediction]:
        """
        Get the latest prediction of a specific type for a user.
        
        Args:
            user_id: User ID
            prediction_type: Type of prediction
            
        Returns:
            Latest prediction of the specified type or None
        """
        query = (
            select(AIPrediction)
            .where(
                and_(
                    AIPrediction.user_id == user_id,
                    AIPrediction.type == prediction_type,
                    AIPrediction.status == PredictionStatus.ACTIVE
                )
            )
            .order_by(desc(AIPrediction.created_at))
            .limit(1)
        )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def archive_prediction(self, prediction_id: str) -> Optional[AIPrediction]:
        """
        Archive a prediction.
        
        Args:
            prediction_id: Prediction ID
            
        Returns:
            Updated prediction instance or None if not found
        """
        return await self.update(prediction_id, status=PredictionStatus.ARCHIVED)
    
    async def dismiss_prediction(self, prediction_id: str) -> Optional[AIPrediction]:
        """
        Dismiss a prediction.
        
        Args:
            prediction_id: Prediction ID
            
        Returns:
            Updated prediction instance or None if not found
        """
        return await self.update(prediction_id, status=PredictionStatus.DISMISSED)
    
    async def archive_expired_predictions(self, user_id: Optional[str] = None) -> int:
        """
        Archive all expired predictions.
        
        Args:
            user_id: User ID (optional, if None archives for all users)
            
        Returns:
            Number of archived predictions
        """
        expired_predictions = await self.get_expired_predictions(user_id=user_id)
        
        if not expired_predictions:
            return 0
        
        updates = [
            {"id": pred.id, "status": PredictionStatus.ARCHIVED}
            for pred in expired_predictions
        ]
        
        return await self.bulk_update(updates)
    
    async def get_predictions_by_date_range(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime,
        prediction_type: Optional[PredictionType] = None,
    ) -> List[AIPrediction]:
        """
        Get predictions created within a date range.
        
        Args:
            user_id: User ID
            start_date: Start date
            end_date: End date
            prediction_type: Filter by prediction type
            
        Returns:
            List of predictions in the date range
        """
        conditions = [
            AIPrediction.user_id == user_id,
            AIPrediction.created_at >= start_date,
            AIPrediction.created_at <= end_date
        ]
        
        if prediction_type:
            conditions.append(AIPrediction.type == prediction_type)
        
        query = (
            select(AIPrediction)
            .where(and_(*conditions))
            .order_by(desc(AIPrediction.created_at))
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def cleanup_old_predictions(
        self,
        days_old: int = 90,
        batch_size: int = 100,
    ) -> int:
        """
        Delete old archived/dismissed predictions.
        
        Args:
            days_old: Delete predictions older than this many days
            batch_size: Maximum number of predictions to delete in one batch
            
        Returns:
            Number of deleted predictions
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        conditions = [
            AIPrediction.created_at < cutoff_date,
            AIPrediction.status.in_([PredictionStatus.ARCHIVED, PredictionStatus.DISMISSED])
        ]
        
        query = (
            select(AIPrediction.id)
            .where(and_(*conditions))
            .limit(batch_size)
        )
        
        result = await self.db.execute(query)
        prediction_ids = [row[0] for row in result.all()]
        
        if prediction_ids:
            return await self.bulk_delete(prediction_ids)
        
        return 0
    
    async def get_prediction_statistics(self, user_id: str) -> dict:
        """
        Get prediction statistics for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with prediction statistics
        """
        from sqlalchemy import func
        
        query = (
            select(
                func.count(AIPrediction.id).label("total_predictions"),
                func.count(
                    func.case(
                        (AIPrediction.status == PredictionStatus.ACTIVE, AIPrediction.id),
                        else_=None
                    )
                ).label("active_predictions"),
                func.count(
                    func.case(
                        (AIPrediction.status == PredictionStatus.ARCHIVED, AIPrediction.id),
                        else_=None
                    )
                ).label("archived_predictions"),
                func.avg(AIPrediction.confidence_score).label("avg_confidence"),
                func.max(AIPrediction.confidence_score).label("max_confidence"),
                func.min(AIPrediction.confidence_score).label("min_confidence"),
            )
            .where(AIPrediction.user_id == user_id)
        )
        
        result = await self.db.execute(query)
        row = result.first()
        
        return {
            "total_predictions": row.total_predictions or 0,
            "active_predictions": row.active_predictions or 0,
            "archived_predictions": row.archived_predictions or 0,
            "avg_confidence": float(row.avg_confidence or 0.0),
            "max_confidence": float(row.max_confidence or 0.0),
            "min_confidence": float(row.min_confidence or 0.0),
        }
    
    async def delete_user_predictions(self, user_id: str) -> int:
        """
        Delete all predictions for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Number of deleted predictions
        """
        result = await self.db.execute(
            select(AIPrediction.id).where(AIPrediction.user_id == user_id)
        )
        prediction_ids = [row[0] for row in result.all()]
        
        if prediction_ids:
            return await self.bulk_delete(prediction_ids)
        
        return 0
