"""
Base repository class with common CRUD operations.

All repositories inherit from this base to get consistent database operations.
"""

from typing import TypeVar, Generic, Type, Optional, List, Dict, Any, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from uuid import uuid4
import structlog

from core.database import Base
from core.exceptions import DatabaseError, ResourceNotFoundError, ResourceConflictError
from core.logging import get_logger

logger = get_logger(__name__)

# Generic type for model
ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base repository class with common CRUD operations.
    
    Args:
        model: SQLAlchemy model class
        db: Database session
    """
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get_by_id(self, id: str) -> Optional[ModelType]:
        """
        Get a single record by ID.
        
        Args:
            id: Record ID
            
        Returns:
            Model instance or None if not found
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            result = await self.db.execute(
                select(self.model).where(self.model.id == id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(
                "Database error in get_by_id",
                model=self.model.__name__,
                id=id,
                error=str(e)
            )
            raise DatabaseError("Erro ao buscar registro por ID")
    
    async def get_by_field(self, field_name: str, value: Any) -> Optional[ModelType]:
        """
        Get a single record by field value.
        
        Args:
            field_name: Name of the field to filter by
            value: Value to match
            
        Returns:
            Model instance or None if not found
        """
        field = getattr(self.model, field_name)
        result = await self.db.execute(
            select(self.model).where(field == value)
        )
        return result.scalar_one_or_none()
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        relationships: Optional[List[str]] = None,
    ) -> List[ModelType]:
        """
        Get multiple records with optional filtering and pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Dictionary of field: value filters
            order_by: Field to order by
            relationships: List of relationship names to eager load
            
        Returns:
            List of model instances
        """
        query = select(self.model)
        
        # Add eager loading for relationships
        if relationships:
            for rel in relationships:
                query = query.options(selectinload(getattr(self.model, rel)))
        
        # Apply filters
        if filters:
            conditions = []
            for field_name, value in filters.items():
                field = getattr(self.model, field_name)
                if isinstance(value, list):
                    conditions.append(field.in_(value))
                else:
                    conditions.append(field == value)
            
            if conditions:
                query = query.where(and_(*conditions))
        
        # Apply ordering
        if order_by:
            if order_by.startswith("-"):
                # Descending order
                field_name = order_by[1:]
                field = getattr(self.model, field_name)
                query = query.order_by(field.desc())
            else:
                # Ascending order
                field = getattr(self.model, order_by)
                query = query.order_by(field)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filtering.
        
        Args:
            filters: Dictionary of field: value filters
            
        Returns:
            Number of matching records
        """
        query = select(func.count(self.model.id))
        
        # Apply filters
        if filters:
            conditions = []
            for field_name, value in filters.items():
                field = getattr(self.model, field_name)
                if isinstance(value, list):
                    conditions.append(field.in_(value))
                else:
                    conditions.append(field == value)
            
            if conditions:
                query = query.where(and_(*conditions))
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def create(self, **kwargs) -> ModelType:
        """
        Create a new record.
        
        Args:
            **kwargs: Field values for the new record
            
        Returns:
            Created model instance
        """
        # Add ID if not provided
        if "id" not in kwargs:
            kwargs["id"] = str(uuid4())
        
        instance = self.model(**kwargs)
        self.db.add(instance)
        await self.db.flush()  # Flush to get the ID
        await self.db.refresh(instance)  # Refresh to load any default values
        await self.db.commit()  # Commit the transaction to persist data
        
        logger.info(
            "Record created",
            model=self.model.__name__,
            id=instance.id
        )
        
        return instance
    
    async def update(self, id: str, **kwargs) -> Optional[ModelType]:
        """
        Update a record by ID.
        
        Args:
            id: Record ID
            **kwargs: Field values to update
            
        Returns:
            Updated model instance or None if not found
        """
        # Remove None values
        update_data = {k: v for k, v in kwargs.items() if v is not None}
        
        if not update_data:
            return await self.get_by_id(id)
        
        result = await self.db.execute(
            update(self.model)
            .where(self.model.id == id)
            .values(**update_data)
            .returning(self.model)
        )
        
        updated_instance = result.scalar_one_or_none()
        
        if updated_instance:
            await self.db.commit()  # Commit the transaction
            logger.info(
                "Record updated",
                model=self.model.__name__,
                id=id,
                fields=list(update_data.keys())
            )
        
        return updated_instance
    
    async def delete(self, id: str) -> bool:
        """
        Delete a record by ID.
        
        Args:
            id: Record ID
            
        Returns:
            True if deleted, False if not found
        """
        result = await self.db.execute(
            delete(self.model).where(self.model.id == id)
        )
        
        deleted = result.rowcount > 0
        
        if deleted:
            await self.db.commit()  # Commit the transaction
            logger.info(
                "Record deleted",
                model=self.model.__name__,
                id=id
            )
        
        return deleted
    
    async def exists(self, id: str) -> bool:
        """
        Check if a record exists by ID.
        
        Args:
            id: Record ID
            
        Returns:
            True if exists, False otherwise
        """
        result = await self.db.execute(
            select(func.count(self.model.id)).where(self.model.id == id)
        )
        return (result.scalar() or 0) > 0
    
    async def bulk_create(self, objects: List[Dict[str, Any]]) -> List[ModelType]:
        """
        Create multiple records in bulk.
        
        Args:
            objects: List of dictionaries with field values
            
        Returns:
            List of created model instances
        """
        instances = []
        for obj_data in objects:
            if "id" not in obj_data:
                obj_data["id"] = str(uuid4())
            instances.append(self.model(**obj_data))
        
        self.db.add_all(instances)
        await self.db.flush()
        
        # Refresh all instances
        for instance in instances:
            await self.db.refresh(instance)
        
        await self.db.commit()  # Commit the transaction to persist data
        
        logger.info(
            "Bulk create completed",
            model=self.model.__name__,
            count=len(instances)
        )
        
        return instances
    
    async def bulk_update(self, updates: List[Dict[str, Any]]) -> int:
        """
        Update multiple records in bulk.
        
        Args:
            updates: List of dictionaries with 'id' and field values
            
        Returns:
            Number of updated records
        """
        updated_count = 0
        
        for update_data in updates:
            record_id = update_data.pop("id")
            if update_data:  # Only update if there are fields to update
                result = await self.db.execute(
                    update(self.model)
                    .where(self.model.id == record_id)
                    .values(**update_data)
                )
                updated_count += result.rowcount
        
        logger.info(
            "Bulk update completed",
            model=self.model.__name__,
            updated_count=updated_count
        )
        
        return updated_count
    
    async def bulk_delete(self, ids: List[str]) -> int:
        """
        Delete multiple records in bulk.
        
        Args:
            ids: List of record IDs to delete
            
        Returns:
            Number of deleted records
        """
        result = await self.db.execute(
            delete(self.model).where(self.model.id.in_(ids))
        )
        
        deleted_count = result.rowcount
        
        logger.info(
            "Bulk delete completed",
            model=self.model.__name__,
            deleted_count=deleted_count
        )
        
        return deleted_count
