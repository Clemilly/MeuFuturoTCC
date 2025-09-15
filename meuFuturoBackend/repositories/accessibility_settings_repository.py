"""
Repository for accessibility settings.
"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from repositories.base import BaseRepository
from models.accessibility_settings import AccessibilitySettings


class AccessibilitySettingsRepository(BaseRepository[AccessibilitySettings]):
    """Repository for accessibility settings operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(AccessibilitySettings, db)
    
    async def get_by_user(self, user_id: str) -> Optional[AccessibilitySettings]:
        """Get accessibility settings by user ID."""
        result = await self.db.execute(
            select(AccessibilitySettings)
            .where(AccessibilitySettings.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create_or_update(self, user_id: str, settings_data: dict) -> AccessibilitySettings:
        """Create or update accessibility settings for a user."""
        existing_settings = await self.get_by_user(user_id)
        
        if existing_settings:
            # Update existing settings
            for key, value in settings_data.items():
                if hasattr(existing_settings, key):
                    setattr(existing_settings, key, value)
            await self.db.flush()
            await self.db.refresh(existing_settings)
            return existing_settings
        else:
            # Create new settings
            settings_data['user_id'] = user_id
            return await self.create(**settings_data)
    
    async def get_default_settings(self) -> dict:
        """Get default accessibility settings."""
        return {
            'high_contrast': False,
            'font_size': 'medium',
            'color_scheme': 'default',
            'keyboard_navigation': True,
            'skip_links': True,
            'focus_indicators': True,
            'screen_reader_optimized': False,
            'alt_text_detailed': False,
            'audio_descriptions': False,
            'sound_effects': True,
            'large_click_targets': False,
            'gesture_controls': True,
        }
