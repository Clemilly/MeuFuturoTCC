"""
Migration script to add About page features.

Adds platform_stats, user_feedback, accessibility_settings, and user_progress tables.
"""

import asyncio
import sys
import os
from sqlalchemy import text

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine


async def upgrade():
    """Add About page features tables."""
    async with engine.begin() as conn:
        # Create platform_stats table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS platform_stats (
                id VARCHAR(36) PRIMARY KEY,
                total_users INTEGER DEFAULT 0,
                total_transactions INTEGER DEFAULT 0,
                total_categories INTEGER DEFAULT 0,
                total_goals INTEGER DEFAULT 0,
                total_budgets INTEGER DEFAULT 0,
                total_ai_predictions INTEGER DEFAULT 0,
                total_alerts INTEGER DEFAULT 0,
                platform_uptime FLOAT DEFAULT 0.0,
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))
        
        # Create user_feedback table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_feedback (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                feedback_type VARCHAR(20) NOT NULL,
                rating INTEGER,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT FALSE,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """))
        
        # Create accessibility_settings table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS accessibility_settings (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL UNIQUE,
                high_contrast BOOLEAN DEFAULT FALSE,
                font_size VARCHAR(20) DEFAULT 'medium',
                color_scheme VARCHAR(20) DEFAULT 'default',
                keyboard_navigation BOOLEAN DEFAULT TRUE,
                skip_links BOOLEAN DEFAULT TRUE,
                focus_indicators BOOLEAN DEFAULT TRUE,
                screen_reader_optimized BOOLEAN DEFAULT FALSE,
                alt_text_detailed BOOLEAN DEFAULT FALSE,
                audio_descriptions BOOLEAN DEFAULT FALSE,
                sound_effects BOOLEAN DEFAULT TRUE,
                large_click_targets BOOLEAN DEFAULT FALSE,
                gesture_controls BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """))
        
        # Create user_progress table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_progress (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                total_income NUMERIC(15, 2) DEFAULT 0.00,
                total_expenses NUMERIC(15, 2) DEFAULT 0.00,
                total_savings NUMERIC(15, 2) DEFAULT 0.00,
                goals_achieved INTEGER DEFAULT 0,
                budgets_respected INTEGER DEFAULT 0,
                days_active INTEGER DEFAULT 0,
                transactions_created INTEGER DEFAULT 0,
                categories_used INTEGER DEFAULT 0,
                ai_insights_viewed INTEGER DEFAULT 0,
                first_transaction BOOLEAN DEFAULT FALSE,
                first_goal BOOLEAN DEFAULT FALSE,
                first_budget BOOLEAN DEFAULT FALSE,
                week_streak INTEGER DEFAULT 0,
                month_streak INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """))
        
        # Create indexes for better performance
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id 
            ON user_feedback(user_id);
        """))
        
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_feedback_type 
            ON user_feedback(feedback_type);
        """))
        
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_feedback_status 
            ON user_feedback(status);
        """))
        
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_accessibility_settings_user_id 
            ON accessibility_settings(user_id);
        """))
        
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
            ON user_progress(user_id);
        """))
        
        # Insert initial platform stats
        await conn.execute(text("""
            INSERT INTO platform_stats (
                id, total_users, total_transactions, total_categories, 
                total_goals, total_budgets, total_ai_predictions, 
                total_alerts, platform_uptime, last_updated
            ) VALUES (
                gen_random_uuid(), 0, 0, 0, 0, 0, 0, 0, 99.9, NOW()
            ) ON CONFLICT DO NOTHING;
        """))
        
        print("✅ Migration completed successfully!")
        print("📊 Added platform_stats table")
        print("💬 Added user_feedback table")
        print("♿ Added accessibility_settings table")
        print("📈 Added user_progress table")
        print("🔍 Added performance indexes")


async def downgrade():
    """Remove About page features tables."""
    async with engine.begin() as conn:
        # Drop tables in reverse order
        await conn.execute(text("DROP TABLE IF EXISTS user_progress;"))
        await conn.execute(text("DROP TABLE IF EXISTS accessibility_settings;"))
        await conn.execute(text("DROP TABLE IF EXISTS user_feedback;"))
        await conn.execute(text("DROP TABLE IF EXISTS platform_stats;"))
        
        print("✅ Rollback completed successfully!")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        asyncio.run(downgrade())
    else:
        asyncio.run(upgrade())
