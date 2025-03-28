from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.chat import user_chat

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Отношения
    created_chats = relationship("Chat", back_populates="creator", foreign_keys="[Chat.creator_id]")
    chats = relationship("Chat", secondary=user_chat, back_populates="participants")
    messages = relationship("Message", back_populates="sender") 