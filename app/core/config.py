from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/legal_docs_db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # File uploads
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_types: list = [".docx", ".pdf"]
    
    # AI Model settings
    model_name: str = "bert-base-multilingual-cased"
    confidence_threshold: float = 0.7
    
    class Config:
        env_file = ".env"

settings = Settings()

# Create upload directory if it doesn't exist
os.makedirs(settings.upload_dir, exist_ok=True)
