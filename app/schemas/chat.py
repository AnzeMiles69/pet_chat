from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user import User

class ChatBase(BaseModel):
    name: str

class ChatCreate(ChatBase):
    pass

class Chat(ChatBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChatUpdate(ChatBase):
    name: Optional[str] = None

class ChatWithParticipants(Chat):
    participants: List[User]
    creator: User

    class Config:
        from_attributes = True 