from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.hash import bcrypt
import sys
import os

# Добавляем путь к корневой директории проекта в PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.user import User
from app.db.database import SQLALCHEMY_DATABASE_URL

# Создаем подключение к базе данных
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def create_admin_user():
    # Проверяем, существует ли уже пользователь с таким email
    existing_user = db.query(User).filter(User.email == "admin@example.com").first()
    if existing_user:
        print("Админ уже существует!")
        return

    # Создаем хеш пароля
    hashed_password = bcrypt.hash("admin123")

    # Создаем нового пользователя-админа
    admin_user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=hashed_password,
        is_active=True,
        role="ADMIN"
    )

    try:
        db.add(admin_user)
        db.commit()
        print("Админ успешно создан!")
        print("Email: admin@example.com")
        print("Пароль: admin123")
    except Exception as e:
        print(f"Ошибка при создании админа: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user() 