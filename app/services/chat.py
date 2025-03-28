from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.chat import Chat
from app.models.user import User
from app.schemas.chat import ChatCreate, ChatUpdate

class ChatService:
    @staticmethod
    def get_by_id(db: Session, chat_id: int) -> Optional[Chat]:
        return db.query(Chat).filter(Chat.id == chat_id).first()

    @staticmethod
    def get_user_chats(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Chat]:
        return (
            db.query(Chat)
            .join(Chat.participants)
            .filter(User.id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, chat_in: ChatCreate, creator_id: int) -> Chat:
        db_chat = Chat(
            name=chat_in.name,
            description=chat_in.description,
            is_group=chat_in.is_group,
            created_by=creator_id
        )
        
        # Добавляем создателя как участника
        creator = db.query(User).filter(User.id == creator_id).first()
        db_chat.participants.append(creator)
        
        # Добавляем других участников
        if chat_in.participant_ids:
            participants = db.query(User).filter(User.id.in_(chat_in.participant_ids)).all()
            db_chat.participants.extend(participants)
        
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        return db_chat

    @staticmethod
    def update(db: Session, db_chat: Chat, chat_in: ChatUpdate) -> Chat:
        update_data = chat_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_chat, field, value)
        
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        return db_chat

    @staticmethod
    def delete(db: Session, db_chat: Chat) -> None:
        db.delete(db_chat)
        db.commit()

    @staticmethod
    def add_participant(db: Session, chat: Chat, user_id: int) -> Chat:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user not in chat.participants:
            chat.participants.append(user)
            db.commit()
            db.refresh(chat)
        return chat

    @staticmethod
    def remove_participant(db: Session, chat: Chat, user_id: int) -> Chat:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user in chat.participants:
            chat.participants.remove(user)
            db.commit()
            db.refresh(chat)
        return chat 