# Secure Chat Application

Безопасное чат-приложение с end-to-end шифрованием и реал-тайм обменом сообщениями.

## Возможности

- Реал-тайм обмен сообщениями
- End-to-end шифрование
- Групповые чаты
- Отправка файлов
- Система статусов пользователей
- Уведомления
- История сообщений

## Технологии

### Backend
- Python 3.8+
- FastAPI
- WebSocket
- SQLAlchemy
- Redis
- JWT Authentication
- End-to-end encryption

### Frontend
- React
- TypeScript
- Material-UI
- Socket.io-client
- Axios

## Установка

1. Клонируйте репозиторий:
```bash
git clone [repository-url]
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл .env и настройте переменные окружения:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
```

4. Запустите сервер:
```bash
uvicorn app.main:app --reload
```

## Безопасность

- Все сообщения шифруются end-to-end
- Используется JWT для аутентификации
- Пароли хешируются с использованием bcrypt
- WebSocket соединения защищены
- Реализована защита от CSRF атак

## Лицензия

MIT 