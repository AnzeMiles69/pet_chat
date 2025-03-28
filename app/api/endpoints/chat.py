from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
from app.db.database import get_db
from app.models.user import User
from app.models.chat import Chat
from app.api.deps import get_current_user
from app.schemas.chat import ChatCreate, Chat as ChatSchema, ChatWithParticipants

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=ChatSchema)
async def create_chat(
    chat: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создать новый чат
    """
    logger.info(f"Creating chat with name: {chat.name} for user: {current_user.username}")

    try:
        # Получаем пользователя из текущей сессии
        user_db = db.query(User).filter(User.id == current_user.id).first()
        if not user_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Создаем чат
        db_chat = Chat(
            name=chat.name.strip(),
            creator_id=user_db.id
        )
        db.add(db_chat)
        
        # Добавляем создателя как участника
        db_chat.participants.append(user_db)
        
        # Сохраняем изменения
        db.commit()
        db.refresh(db_chat)
        
        logger.info(f"Chat created successfully: {db_chat.id}")
        return db_chat
        
    except Exception as e:
        logger.error(f"Error creating chat: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create chat: {str(e)}"
        )

@router.get("/", response_model=List[ChatWithParticipants])
async def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить список чатов текущего пользователя
    """
    user_db = db.query(User).filter(User.id == current_user.id).first()
    return user_db.chats

@router.get("/{chat_id}", response_model=ChatWithParticipants)
async def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить информацию о конкретном чате
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    user_db = db.query(User).filter(User.id == current_user.id).first()
    if user_db not in chat.participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant of this chat"
        )
    
    return chat 