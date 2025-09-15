"""
Accessibility service for managing user accessibility settings.
"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from repositories.accessibility_settings_repository import AccessibilitySettingsRepository
from schemas.about import AccessibilitySettingsResponse, AccessibilitySettingsUpdate

logger = structlog.get_logger()


class AccessibilityService:
    """Service for user accessibility settings."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.accessibility_repo = AccessibilitySettingsRepository(db)
    
    async def get_user_accessibility_settings(self, user_id: str) -> Optional[AccessibilitySettingsResponse]:
        """Get user accessibility settings."""
        try:
            settings = await self.accessibility_repo.get_by_user(user_id)
            
            if not settings:
                # Return default settings if none exist
                default_settings = await self.accessibility_repo.get_default_settings()
                return AccessibilitySettingsResponse(**default_settings)
            
            return AccessibilitySettingsResponse(
                high_contrast=settings.high_contrast,
                font_size=settings.font_size,
                color_scheme=settings.color_scheme,
                keyboard_navigation=settings.keyboard_navigation,
                skip_links=settings.skip_links,
                focus_indicators=settings.focus_indicators,
                screen_reader_optimized=settings.screen_reader_optimized,
                alt_text_detailed=settings.alt_text_detailed,
                audio_descriptions=settings.audio_descriptions,
                sound_effects=settings.sound_effects,
                large_click_targets=settings.large_click_targets,
                gesture_controls=settings.gesture_controls
            )
        except Exception as e:
            logger.error("Error getting accessibility settings", error=str(e), user_id=user_id)
            raise
    
    async def update_accessibility_settings(
        self, 
        user_id: str, 
        settings: AccessibilitySettingsUpdate
    ) -> AccessibilitySettingsResponse:
        """Update user accessibility settings."""
        try:
            # Convert Pydantic model to dict, excluding None values
            settings_data = settings.dict(exclude_unset=True)
            
            # Update or create settings
            updated_settings = await self.accessibility_repo.create_or_update(
                user_id, 
                settings_data
            )
            
            logger.info(
                "Accessibility settings updated",
                user_id=user_id,
                settings=settings_data
            )
            
            return AccessibilitySettingsResponse(
                high_contrast=updated_settings.high_contrast,
                font_size=updated_settings.font_size,
                color_scheme=updated_settings.color_scheme,
                keyboard_navigation=updated_settings.keyboard_navigation,
                skip_links=updated_settings.skip_links,
                focus_indicators=updated_settings.focus_indicators,
                screen_reader_optimized=updated_settings.screen_reader_optimized,
                alt_text_detailed=updated_settings.alt_text_detailed,
                audio_descriptions=updated_settings.audio_descriptions,
                sound_effects=updated_settings.sound_effects,
                large_click_targets=updated_settings.large_click_targets,
                gesture_controls=updated_settings.gesture_controls
            )
        except Exception as e:
            logger.error(
                "Error updating accessibility settings",
                error=str(e),
                user_id=user_id,
                settings=settings.dict()
            )
            raise
    
    async def reset_to_defaults(self, user_id: str) -> AccessibilitySettingsResponse:
        """Reset user accessibility settings to defaults."""
        try:
            default_settings = await self.accessibility_repo.get_default_settings()
            
            updated_settings = await self.accessibility_repo.create_or_update(
                user_id,
                default_settings
            )
            
            logger.info("Accessibility settings reset to defaults", user_id=user_id)
            
            return AccessibilitySettingsResponse(
                high_contrast=updated_settings.high_contrast,
                font_size=updated_settings.font_size,
                color_scheme=updated_settings.color_scheme,
                keyboard_navigation=updated_settings.keyboard_navigation,
                skip_links=updated_settings.skip_links,
                focus_indicators=updated_settings.focus_indicators,
                screen_reader_optimized=updated_settings.screen_reader_optimized,
                alt_text_detailed=updated_settings.alt_text_detailed,
                audio_descriptions=updated_settings.audio_descriptions,
                sound_effects=updated_settings.sound_effects,
                large_click_targets=updated_settings.large_click_targets,
                gesture_controls=updated_settings.gesture_controls
            )
        except Exception as e:
            logger.error("Error resetting accessibility settings", error=str(e), user_id=user_id)
            raise
