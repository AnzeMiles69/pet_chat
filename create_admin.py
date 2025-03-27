from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.security import get_password_hash

# Create database engine
engine = create_engine('sqlite:///chat.db')
Session = sessionmaker(bind=engine)
session = Session()

# Create admin user
admin = User(
    username='admin',
    email='admin@example.com',
    hashed_password=get_password_hash('admin123'),
    role='ADMIN',
    is_active=True
)

session.add(admin)
session.commit()
print('Admin user created successfully') 