from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .user import User
from app.models.message import MessageType

class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)
    message_type: MessageType = MessageType.TEXT
    reply_to_id: Optional[int] = None

class MessageCreate(MessageBase):
    chat_id: int

class MessageUpdate(BaseModel):
    content: str = Field(..., min_length=1)

class MessageInDBBase(MessageBase):
    id: int
    chat_id: int
    sender_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_edited: bool = False

    class Config:
        from_attributes = True

class Message(MessageInDBBase):
    sender: User
    reply_to: Optional['Message'] = None

class MessageInDB(MessageInDBBase):
    pass 