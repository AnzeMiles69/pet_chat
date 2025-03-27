from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil

from app.db.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas import schemas
from app.api import deps

router = APIRouter()

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get current user.
    """
    return current_user

@router.patch("/me", response_model=schemas.User)
async def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserUpdate,
    current_user: User = Depends(deps.get_current_user),
    avatar: Optional[UploadFile] = File(None)
):
    """
    Update current user.
    """
    # Update avatar if provided
    if avatar:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(avatar.filename)[1]
        avatar_filename = f"avatar_{current_user.id}_{int(datetime.now().timestamp())}{file_extension}"
        avatar_path = os.path.join(upload_dir, avatar_filename)
        
        # Save file
        with open(avatar_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        
        # Update avatar_url in user_in
        current_user.avatar_url = f"/avatars/{avatar_filename}"

    # Update other fields
    for field, value in user_in.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

    current_user.last_seen = datetime.utcnow()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/", response_model=List[schemas.User])
def get_users(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(User).all()

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get user by ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}/role", response_model=schemas.User)
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Update user role. Only admins can do this.
    """
    if not current_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change user roles"
        )
    
    if role not in ["USER", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be either USER or ADMIN"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    db.commit()
    db.refresh(user)
    return user 