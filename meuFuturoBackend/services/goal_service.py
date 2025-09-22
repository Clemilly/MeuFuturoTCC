"""
Goal service for financial goals management.
"""

from typing import List, Dict, Any
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import structlog

from repositories.goal import GoalRepository
from schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalProgressUpdate
from models.goal import Goal, GoalType, GoalStatus

logger = structlog.get_logger()


class GoalService:
    """Service for financial goals management."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.goal_repo = GoalRepository(db)
    
    async def get_user_goals(self, user_id: str) -> List[GoalResponse]:
        """Get all goals for a user."""
        goals = await self.goal_repo.get_user_goals(user_id)
        return [self._goal_to_response(goal) for goal in goals]
    
    async def get_active_goals(self, user_id: str) -> List[GoalResponse]:
        """Get active goals for a user."""
        goals = await self.goal_repo.get_active_goals(user_id)
        return [self._goal_to_response(goal) for goal in goals]
    
    async def get_goals_by_type(
        self, 
        user_id: str, 
        goal_type: GoalType
    ) -> List[GoalResponse]:
        """Get goals by type for a user."""
        goals = await self.goal_repo.get_goals_by_type(user_id, goal_type)
        return [self._goal_to_response(goal) for goal in goals]
    
    async def create_goal(self, user_id: str, goal_data: GoalCreate) -> GoalResponse:
        """Create a new financial goal."""
        goal = Goal(
            user_id=user_id,
            **goal_data.model_dump()
        )
        
        created_goal = await self.goal_repo.create(goal)
        
        logger.info(
            "Financial goal created",
            user_id=user_id,
            goal_id=created_goal.id,
            goal_type=created_goal.type.value
        )
        
        return self._goal_to_response(created_goal)
    
    async def update_goal(
        self, 
        user_id: str, 
        goal_id: str, 
        goal_data: GoalUpdate
    ) -> GoalResponse:
        """Update a financial goal."""
        goal = await self.goal_repo.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta não encontrada"
            )
        
        update_data = goal_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(goal, field, value)
        
        updated_goal = await self.goal_repo.update(goal)
        
        logger.info(
            "Financial goal updated",
            user_id=user_id,
            goal_id=goal_id,
            updated_fields=list(update_data.keys())
        )
        
        return self._goal_to_response(updated_goal)
    
    async def delete_goal(self, user_id: str, goal_id: str) -> bool:
        """Delete a financial goal."""
        goal = await self.goal_repo.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta não encontrada"
            )
        
        success = await self.goal_repo.delete(goal_id)
        
        if success:
            logger.info(
                "Financial goal deleted",
                user_id=user_id,
                goal_id=goal_id
            )
        
        return success
    
    async def update_goal_progress(
        self, 
        user_id: str, 
        goal_id: str, 
        progress_data: GoalProgressUpdate
    ) -> GoalResponse:
        """Update goal progress."""
        goal = await self.goal_repo.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta não encontrada"
            )
        
        updated_goal = await self.goal_repo.update_goal_progress(
            goal_id, 
            progress_data.current_amount
        )
        
        logger.info(
            "Goal progress updated",
            user_id=user_id,
            goal_id=goal_id,
            new_amount=float(progress_data.current_amount),
            progress_percentage=updated_goal.progress_percentage
        )
        
        return self._goal_to_response(updated_goal)
    
    async def get_goals_near_completion(
        self, 
        user_id: str, 
        threshold: float = 0.8
    ) -> List[GoalResponse]:
        """Get goals that are near completion."""
        goals = await self.goal_repo.get_goals_near_completion(user_id, threshold)
        return [self._goal_to_response(goal) for goal in goals]
    
    async def get_overdue_goals(self, user_id: str) -> List[GoalResponse]:
        """Get overdue goals for a user."""
        goals = await self.goal_repo.get_overdue_goals(user_id)
        return [self._goal_to_response(goal) for goal in goals]
    
    async def get_goals_ending_soon(
        self, 
        user_id: str, 
        days: int = 30
    ) -> List[GoalResponse]:
        """Get goals ending within specified days."""
        goals = await self.goal_repo.get_goals_ending_soon(user_id, days)
        return [self._goal_to_response(goal) for goal in goals]
    
    async def get_goal_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get goal statistics for a user."""
        all_goals = await self.goal_repo.get_user_goals(user_id)
        active_goals = [g for g in all_goals if g.status == GoalStatus.ACTIVE]
        completed_goals = [g for g in all_goals if g.status == GoalStatus.COMPLETED]
        
        total_goals = len(all_goals)
        active_count = len(active_goals)
        completed_count = len(completed_goals)
        
        # Calculate total target amount
        total_target = sum(float(g.target_amount) for g in active_goals)
        total_current = sum(float(g.current_amount) for g in active_goals)
        
        # Calculate average progress
        avg_progress = 0
        if active_goals:
            avg_progress = sum(g.progress_percentage for g in active_goals) / len(active_goals)
        
        # Goals by type
        goals_by_type = {}
        for goal_type in GoalType:
            goals_by_type[goal_type.value] = len([
                g for g in active_goals if g.type == goal_type
            ])
        
        return {
            "total_goals": total_goals,
            "active_goals": active_count,
            "completed_goals": completed_count,
            "completion_rate": (completed_count / total_goals * 100) if total_goals > 0 else 0,
            "total_target_amount": total_target,
            "total_current_amount": total_current,
            "average_progress": avg_progress,
            "goals_by_type": goals_by_type
        }
    
    def _goal_to_response(self, goal: Goal) -> GoalResponse:
        """Convert Goal model to GoalResponse."""
        return GoalResponse(
            id=goal.id,
            name=goal.name,
            description=goal.description,
            type=goal.type,
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            start_date=goal.start_date,
            target_date=goal.target_date,
            status=goal.status,
            is_recurring=goal.is_recurring,
            progress_percentage=goal.progress_percentage,
            remaining_amount=goal.remaining_amount,
            days_remaining=goal.days_remaining,
            is_completed=goal.is_completed,
            created_at=goal.created_at,
            updated_at=goal.updated_at
        )


