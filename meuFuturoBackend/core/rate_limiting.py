"""
Rate limiting implementation for the MeuFuturo API.

Provides rate limiting functionality to prevent abuse and ensure fair usage.
"""

import time
from typing import Dict, Optional, Tuple
from collections import defaultdict, deque
from dataclasses import dataclass
from fastapi import Request, HTTPException, status
import structlog

from core.constants import SecurityConstants, ErrorMessages
from core.exceptions import RateLimitError

logger = structlog.get_logger()


@dataclass
class RateLimitConfig:
    """Rate limit configuration."""
    requests_per_minute: int = SecurityConstants.RATE_LIMIT_PER_MINUTE
    requests_per_hour: int = SecurityConstants.RATE_LIMIT_PER_HOUR
    burst_limit: int = SecurityConstants.RATE_LIMIT_BURST
    window_size_minutes: int = 1
    window_size_hours: int = 60


class RateLimiter:
    """Rate limiter implementation using sliding window algorithm."""
    
    def __init__(self, config: RateLimitConfig = None):
        self.config = config or RateLimitConfig()
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.burst_requests: Dict[str, deque] = defaultdict(deque)
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get client identifier from request."""
        # Try to get real IP from headers (for reverse proxy setups)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _cleanup_old_requests(self, requests: deque, window_seconds: int) -> None:
        """Remove requests older than the window."""
        current_time = time.time()
        while requests and current_time - requests[0] > window_seconds:
            requests.popleft()
    
    def _check_rate_limit(
        self, 
        client_id: str, 
        window_seconds: int, 
        max_requests: int,
        requests: deque
    ) -> Tuple[bool, int, int]:
        """
        Check if client is within rate limit.
        
        Returns:
            Tuple of (is_allowed, current_requests, remaining_requests)
        """
        current_time = time.time()
        
        # Clean up old requests
        self._cleanup_old_requests(requests, window_seconds)
        
        # Check if adding this request would exceed the limit
        if len(requests) >= max_requests:
            return False, len(requests), 0
        
        # Add current request
        requests.append(current_time)
        
        return True, len(requests), max_requests - len(requests)
    
    def is_allowed(self, request: Request) -> Tuple[bool, Dict[str, int]]:
        """
        Check if request is allowed based on rate limits.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        client_id = self._get_client_identifier(request)
        current_time = time.time()
        
        # Check minute-based rate limit
        minute_requests = self.requests[f"{client_id}_minute"]
        minute_allowed, minute_current, minute_remaining = self._check_rate_limit(
            client_id,
            60,  # 1 minute window
            self.config.requests_per_minute,
            minute_requests
        )
        
        # Check hour-based rate limit
        hour_requests = self.requests[f"{client_id}_hour"]
        hour_allowed, hour_current, hour_remaining = self._check_rate_limit(
            client_id,
            3600,  # 1 hour window
            self.config.requests_per_hour,
            hour_requests
        )
        
        # Check burst limit (last 10 seconds)
        burst_requests = self.burst_requests[client_id]
        self._cleanup_old_requests(burst_requests, 10)  # 10 second window
        
        burst_allowed = len(burst_requests) < self.config.burst_limit
        if burst_allowed:
            burst_requests.append(current_time)
        
        # Rate limit info
        rate_limit_info = {
            "minute_limit": self.config.requests_per_minute,
            "minute_current": minute_current,
            "minute_remaining": minute_remaining,
            "hour_limit": self.config.requests_per_hour,
            "hour_current": hour_current,
            "hour_remaining": hour_remaining,
            "burst_limit": self.config.burst_limit,
            "burst_current": len(burst_requests),
            "burst_remaining": max(0, self.config.burst_limit - len(burst_requests))
        }
        
        # Request is allowed if all limits are respected
        is_allowed = minute_allowed and hour_allowed and burst_allowed
        
        if not is_allowed:
            logger.warning(
                "Rate limit exceeded",
                client_id=client_id,
                minute_current=minute_current,
                minute_limit=self.config.requests_per_minute,
                hour_current=hour_current,
                hour_limit=self.config.requests_per_hour,
                burst_current=len(burst_requests),
                burst_limit=self.config.burst_limit
            )
        
        return is_allowed, rate_limit_info


# Global rate limiter instance
rate_limiter = RateLimiter()


def check_rate_limit(request: Request) -> None:
    """
    FastAPI dependency to check rate limits.
    
    Args:
        request: FastAPI request object
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    is_allowed, rate_limit_info = rate_limiter.is_allowed(request)
    
    if not is_allowed:
        # Calculate retry after time
        retry_after = 60  # Default to 1 minute
        
        # If minute limit exceeded, retry after 1 minute
        if rate_limit_info["minute_remaining"] == 0:
            retry_after = 60
        # If hour limit exceeded, retry after 1 hour
        elif rate_limit_info["hour_remaining"] == 0:
            retry_after = 3600
        # If burst limit exceeded, retry after 10 seconds
        elif rate_limit_info["burst_remaining"] == 0:
            retry_after = 10
        
        raise RateLimitError(
            message=ErrorMessages.RATE_LIMIT_EXCEEDED,
            retry_after=retry_after,
            details=rate_limit_info
        ).to_http_exception()


class EndpointRateLimiter:
    """Rate limiter for specific endpoints with custom limits."""
    
    def __init__(self, requests_per_minute: int = 30, requests_per_hour: int = 500):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.rate_limiter = RateLimiter(RateLimitConfig(
            requests_per_minute=requests_per_minute,
            requests_per_hour=requests_per_hour
        ))
    
    def __call__(self, request: Request) -> None:
        """Check rate limit for this endpoint."""
        is_allowed, rate_limit_info = self.rate_limiter.is_allowed(request)
        
        if not is_allowed:
            retry_after = 60
            if rate_limit_info["minute_remaining"] == 0:
                retry_after = 60
            elif rate_limit_info["hour_remaining"] == 0:
                retry_after = 3600
            
            raise RateLimitError(
                message=ErrorMessages.RATE_LIMIT_EXCEEDED,
                retry_after=retry_after,
                details=rate_limit_info
            ).to_http_exception()


# Predefined rate limiters for different endpoint types
auth_rate_limiter = EndpointRateLimiter(requests_per_minute=10, requests_per_hour=100)
api_rate_limiter = EndpointRateLimiter(requests_per_minute=60, requests_per_hour=1000)
upload_rate_limiter = EndpointRateLimiter(requests_per_minute=5, requests_per_hour=50)
search_rate_limiter = EndpointRateLimiter(requests_per_minute=30, requests_per_hour=500)


def get_rate_limit_headers(rate_limit_info: Dict[str, int]) -> Dict[str, str]:
    """
    Generate rate limit headers for response.
    
    Args:
        rate_limit_info: Rate limit information
        
    Returns:
        Dictionary of rate limit headers
    """
    return {
        "X-RateLimit-Limit-Minute": str(rate_limit_info["minute_limit"]),
        "X-RateLimit-Remaining-Minute": str(rate_limit_info["minute_remaining"]),
        "X-RateLimit-Reset-Minute": str(int(time.time()) + 60),
        "X-RateLimit-Limit-Hour": str(rate_limit_info["hour_limit"]),
        "X-RateLimit-Remaining-Hour": str(rate_limit_info["hour_remaining"]),
        "X-RateLimit-Reset-Hour": str(int(time.time()) + 3600),
        "X-RateLimit-Limit-Burst": str(rate_limit_info["burst_limit"]),
        "X-RateLimit-Remaining-Burst": str(rate_limit_info["burst_remaining"]),
    }
