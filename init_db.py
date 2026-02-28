#!/usr/bin/env python3
"""
Script to initialize the database with tables and sample data
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from sqlalchemy import create_engine
from app.database import Base
from app.core.config import settings

def init_database():
    """Initialize the database with all tables"""
    print("Creating database tables...")
    
    # Create engine
    engine = create_engine(settings.database_url)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("Database tables created successfully!")
    print(f"Database URL: {settings.database_url}")

if __name__ == "__main__":
    init_database()
