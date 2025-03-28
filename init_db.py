import os
from alembic.config import Config
from alembic import command
from app.db.database import Base, engine
from app.models import user, chat, message
from app.core.config import settings

def init_db():
    # Создаем все таблицы
    Base.metadata.create_all(bind=engine)
    
    # Инициализируем Alembic
    alembic_cfg = Config("alembic.ini")
    
    # Создаем первую миграцию
    command.revision(alembic_cfg, autogenerate=True, message="Initial migration")
    
    # Применяем миграции
    command.upgrade(alembic_cfg, "head")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!") 