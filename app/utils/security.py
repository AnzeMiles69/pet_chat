from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import base64
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# End-to-end encryption utilities
def generate_key() -> str:
    return Fernet.generate_key().decode()

def encrypt_message(message: str, key: str) -> str:
    f = Fernet(key.encode())
    return f.encrypt(message.encode()).decode()

def decrypt_message(encrypted_message: str, key: str) -> str:
    f = Fernet(key.encode())
    return f.decrypt(encrypted_message.encode()).decode()

def generate_chat_key() -> str:
    """Generate a unique key for chat encryption"""
    return base64.urlsafe_b64encode(Fernet.generate_key()).decode() 