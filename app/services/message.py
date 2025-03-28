from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageUpdate

class MessageService:
    @staticmethod
    def get_by_id(db: Session, message_id: int) -> Optional[Message]:
        return db.query(Message).filter(Message.id == message_id).first()

    @staticmethod
    def get_chat_messages(
        db: Session, 
        chat_id: int, 
        skip: int = 0, 
        limit: int = 50
    ) -> List[Message]:
        return (
            db.query(Message)
            .filter(Message.chat_id == chat_id)
            .order_by(Message.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, message_in: MessageCreate, sender_id: int) -> Message:
        db_message = Message(
            content=message_in.content,
            message_type=message_in.message_type,
            chat_id=message_in.chat_id,
            sender_id=sender_id,
            reply_to_id=message_in.reply_to_id
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message

    @staticmethod
    def update(db: Session, db_message: Message, message_in: MessageUpdate) -> Message:
        update_data = message_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_message, field, value)
        
        db_message.is_edited = True
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message

    @staticmethod
    def delete(db: Session, db_message: Message) -> None:
        db.delete(db_message)
        db.commit()

    @staticmethod
    def get_message_replies(
        db: Session, 
        message_id: int, 
        skip: int = 0, 
        limit: int = 10
    ) -> List[Message]:
        return (
            db.query(Message)
            .filter(Message.reply_to_id == message_id)
            .order_by(Message.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        ) 