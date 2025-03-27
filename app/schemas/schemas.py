from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: bool = True
    role: str = "USER"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Схемы для чатов
class ChatBase(BaseModel):
    name: str
    is_group: bool = True

class ChatCreate(ChatBase):
    pass

class Chat(ChatBase):
    id: int
    created_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Схемы для сообщений
class MessageBase(BaseModel):
    content: str
    chat_id: int

class MessageCreate(MessageBase):
    pass

class MessageSender(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class Message(MessageBase):
    id: int
    sender_id: int
    sender: MessageSender
    created_at: datetime

    class Config:
        from_attributes = True 