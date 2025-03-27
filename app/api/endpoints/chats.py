from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.chat import Chat, Message
from app.schemas import schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.Chat)
def create_chat(
    *,
    db: Session = Depends(get_db),
    chat_in: schemas.ChatCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Create new chat.
    """
    chat = Chat(
        name=chat_in.name,
        is_group=chat_in.is_group,
        creator_id=current_user.id
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.get("/", response_model=List[schemas.Chat])
def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get all chats.
    """
    return db.query(Chat).all()

@router.get("/{chat_id}", response_model=schemas.Chat)
def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get chat by ID.
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@router.post("/{chat_id}/messages", response_model=schemas.Message)
def create_message(
    *,
    db: Session = Depends(get_db),
    chat_id: int,
    message_in: schemas.MessageCreate,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Create new message in chat.
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    message = Message(
        content=message_in.content,
        chat_id=chat_id,
        sender_id=current_user.id
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/{chat_id}/messages", response_model=List[schemas.Message])
def get_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get all messages in chat.
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    return db.query(Message).filter(Message.chat_id == chat_id).all() 