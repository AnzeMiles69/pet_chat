from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.services.message import MessageService
from app.services.chat import ChatService
from app.schemas.message import Message, MessageCreate, MessageUpdate
from app.models.user import User
from app.core.websocket import ConnectionManager

router = APIRouter()
manager = ConnectionManager()

@router.get("/chat/{chat_id}", response_model=List[Message])
def get_chat_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve messages from a chat.
    """
    chat = ChatService.get_by_id(db=db, chat_id=chat_id)
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )
    if current_user not in chat.participants:
        raise HTTPException(
            status_code=403,
            detail="Not a chat participant",
        )
    messages = MessageService.get_chat_messages(
        db=db, chat_id=chat_id, skip=skip, limit=limit
    )
    return messages

@router.post("/", response_model=Message)
def create_message(
    *,
    db: Session = Depends(get_db),
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new message.
    """
    chat = ChatService.get_by_id(db=db, chat_id=message_in.chat_id)
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )
    if current_user not in chat.participants:
        raise HTTPException(
            status_code=403,
            detail="Not a chat participant",
        )
    message = MessageService.create(
        db=db, message_in=message_in, sender_id=current_user.id
    )
    # Отправляем сообщение всем подключенным клиентам в чате
    manager.broadcast_to_chat(chat_id=chat.id, message=message)
    return message

@router.put("/{message_id}", response_model=Message)
def update_message(
    *,
    db: Session = Depends(get_db),
    message_id: int,
    message_in: MessageUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a message.
    """
    message = MessageService.get_by_id(db=db, message_id=message_id)
    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    message = MessageService.update(
        db=db, db_message=message, message_in=message_in
    )
    return message

@router.delete("/{message_id}")
def delete_message(
    *,
    db: Session = Depends(get_db),
    message_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a message.
    """
    message = MessageService.get_by_id(db=db, message_id=message_id)
    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    MessageService.delete(db=db, db_message=message)
    return {"status": "success"}

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_id: int,
    db: Session = Depends(get_db),
):
    await manager.connect(websocket, chat_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Здесь можно добавить обработку входящих сообщений
            await manager.broadcast_to_chat(chat_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id) 