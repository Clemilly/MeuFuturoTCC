#!/usr/bin/env python3
"""
Test script to verify register endpoint works without authentication.
"""

import asyncio
import httpx
import json

async def test_register():
    """Test the register endpoint."""
    async with httpx.AsyncClient() as client:
        try:
            # Test data
            user_data = {
                "email": "test@example.com",
                "name": "Test User",
                "password": "password123"
            }
            
            # Make request to register endpoint
            response = await client.post(
                "http://localhost:8000/api/v1/auth/register",
                json=user_data,
                timeout=10.0
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print(f"Response Body: {response.text}")
            
            if response.status_code == 201:
                print("✅ Register endpoint works correctly!")
            elif response.status_code == 401:
                print("❌ Register endpoint requires authentication (this is wrong)")
            else:
                print(f"⚠️  Unexpected status code: {response.status_code}")
                
        except httpx.ConnectError:
            print("❌ Could not connect to server. Make sure it's running on localhost:8000")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_register())
