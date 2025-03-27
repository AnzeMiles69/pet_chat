from sqlalchemy.orm import Session
from app.db.database import engine, SessionLocal
from app.models.models import Base, User, UserRole, UserStatus
from app.utils.security import get_password_hash

def init_db():
    try:
        # Создаем все таблицы
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        
        # Создаем сессию базы данных
        db = SessionLocal()
        
        # Создаем тестового пользователя
        test_user = User(
            email="test@example.com",
            username="testuser",
            role=UserRole.USER,
            is_active=True,
            status=UserStatus.OFFLINE
        )
        test_user.hashed_password = get_password_hash("testpass123")
        
        # Создаем админа
        admin_user = User(
            email="admin@example.com",
            username="admin",
            role=UserRole.ADMIN,
            is_active=True,
            status=UserStatus.OFFLINE
        )
        admin_user.hashed_password = get_password_hash("admin123")
        
        # Добавляем пользователей в базу данных
        db.add(test_user)
        db.add(admin_user)
        db.commit()
        
        print("База данных успешно инициализирована")
        print("Тестовый пользователь создан:")
        print("Username: testuser")
        print("Password: testpass123")
        print("\nАдминистратор создан:")
        print("Username: admin")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Ошибка при инициализации базы данных: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Удаляем старую базу данных если она существует
    if os.path.exists("chat.db"):
        os.remove("chat.db")
    init_db() 