"""
Structured logging configuration for the MeuFuturo API.

Provides consistent, structured logging across the application.
"""

import sys
import logging
import asyncio
import time
from typing import Any, Dict, Optional
from pathlib import Path
import structlog
from structlog.stdlib import LoggerFactory
from structlog.processors import JSONRenderer, TimeStamper, add_log_level
from structlog.dev import ConsoleRenderer

from core.constants import LoggingConstants


def configure_logging(
    log_level: str = LoggingConstants.LOG_LEVEL,
    log_format: str = LoggingConstants.LOG_FORMAT,
    log_file: Optional[str] = None
) -> None:
    """
    Configure structured logging for the application.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log format (json, console)
        log_file: Optional log file path
    """
    # Configure standard library logging
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(message)s",
        stream=sys.stdout
    )
    
    # Configure file logging if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, log_level.upper()))
        logging.getLogger().addHandler(file_handler)
    
    # Configure structlog processors
    processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]
    
    # Add appropriate renderer based on format
    if log_format.lower() == "json":
        processors.append(JSONRenderer())
    else:
        processors.append(ConsoleRenderer(colors=True))
    
    # Configure structlog
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=LoggerFactory(),
        cache_logger_on_first_use=True,
    )


class StructuredLogger:
    """Structured logger wrapper with common logging patterns."""
    
    def __init__(self, name: str):
        self.logger = structlog.get_logger(name)
    
    def debug(self, message: str, **kwargs: Any) -> None:
        """Log debug message with structured data."""
        self.logger.debug(message, **kwargs)
    
    def info(self, message: str, **kwargs: Any) -> None:
        """Log info message with structured data."""
        self.logger.info(message, **kwargs)
    
    def warning(self, message: str, **kwargs: Any) -> None:
        """Log warning message with structured data."""
        self.logger.warning(message, **kwargs)
    
    def error(self, message: str, **kwargs: Any) -> None:
        """Log error message with structured data."""
        self.logger.error(message, **kwargs)
    
    def critical(self, message: str, **kwargs: Any) -> None:
        """Log critical message with structured data."""
        self.logger.critical(message, **kwargs)
    
    def exception(self, message: str, **kwargs: Any) -> None:
        """Log exception with traceback."""
        self.logger.exception(message, **kwargs)
    
    # Business-specific logging methods
    def log_user_action(
        self, 
        action: str, 
        user_id: str, 
        **kwargs: Any
    ) -> None:
        """Log user action with standard fields."""
        self.info(
            f"User action: {action}",
            action=action,
            user_id=user_id,
            **kwargs
        )
    
    def log_api_request(
        self,
        method: str,
        url: str,
        user_id: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        """Log API request with standard fields."""
        self.info(
            "API request",
            method=method,
            url=url,
            user_id=user_id,
            **kwargs
        )
    
    def log_api_response(
        self,
        method: str,
        url: str,
        status_code: int,
        response_time: float,
        user_id: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        """Log API response with standard fields."""
        self.info(
            "API response",
            method=method,
            url=url,
            status_code=status_code,
            response_time=response_time,
            user_id=user_id,
            **kwargs
        )
    
    def log_database_operation(
        self,
        operation: str,
        table: str,
        record_id: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        """Log database operation with standard fields."""
        self.info(
            f"Database operation: {operation}",
            operation=operation,
            table=table,
            record_id=record_id,
            **kwargs
        )
    
    def log_security_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        """Log security event with standard fields."""
        self.warning(
            f"Security event: {event_type}",
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            **kwargs
        )
    
    def log_business_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        **kwargs: Any
    ) -> None:
        """Log business event with standard fields."""
        self.info(
            f"Business event: {event_type}",
            event_type=event_type,
            user_id=user_id,
            **kwargs
        )
    
    def log_performance_metric(
        self,
        metric_name: str,
        value: float,
        unit: str = "ms",
        **kwargs: Any
    ) -> None:
        """Log performance metric with standard fields."""
        self.info(
            f"Performance metric: {metric_name}",
            metric_name=metric_name,
            value=value,
            unit=unit,
            **kwargs
        )


def get_logger(name: str) -> StructuredLogger:
    """
    Get a structured logger instance.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        StructuredLogger instance
    """
    return StructuredLogger(name)


# Performance monitoring decorator
def log_performance(logger: StructuredLogger, operation_name: str):
    """
    Decorator to log performance metrics.
    
    Args:
        logger: Logger instance
        operation_name: Name of the operation being measured
    """
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            import time
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                execution_time = (time.time() - start_time) * 1000  # Convert to milliseconds
                
                logger.log_performance_metric(
                    f"{operation_name}_execution_time",
                    execution_time,
                    operation=operation_name,
                    success=True
                )
                
                return result
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                
                logger.log_performance_metric(
                    f"{operation_name}_execution_time",
                    execution_time,
                    operation=operation_name,
                    success=False,
                    error=str(e)
                )
                
                raise
        
        def sync_wrapper(*args, **kwargs):
            import time
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                execution_time = (time.time() - start_time) * 1000
                
                logger.log_performance_metric(
                    f"{operation_name}_execution_time",
                    execution_time,
                    operation=operation_name,
                    success=True
                )
                
                return result
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                
                logger.log_performance_metric(
                    f"{operation_name}_execution_time",
                    execution_time,
                    operation=operation_name,
                    success=False,
                    error=str(e)
                )
                
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Database query logging
def log_database_query(logger: StructuredLogger, query_type: str, table: str):
    """
    Decorator to log database queries.
    
    Args:
        logger: Logger instance
        query_type: Type of query (SELECT, INSERT, UPDATE, DELETE)
        table: Table name
    """
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                execution_time = (time.time() - start_time) * 1000
                
                logger.log_database_operation(
                    query_type,
                    table,
                    execution_time=execution_time,
                    success=True
                )
                
                return result
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                
                logger.log_database_operation(
                    query_type,
                    table,
                    execution_time=execution_time,
                    success=False,
                    error=str(e)
                )
                
                raise
        
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                execution_time = (time.time() - start_time) * 1000
                
                logger.log_database_operation(
                    query_type,
                    table,
                    execution_time=execution_time,
                    success=True
                )
                
                return result
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                
                logger.log_database_operation(
                    query_type,
                    table,
                    execution_time=execution_time,
                    success=False,
                    error=str(e)
                )
                
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Initialize logging on module import
configure_logging()
