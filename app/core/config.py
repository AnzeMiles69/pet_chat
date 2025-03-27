from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Secure Chat"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # В продакшене использовать переменную окружения
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./chat.db"  # В продакшене использовать PostgreSQL
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # WebSocket
    WS_MESSAGE_QUEUE_SIZE: int = 100
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 