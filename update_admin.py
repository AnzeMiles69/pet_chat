from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.db.database import Base

# Create database engine
engine = create_engine('sqlite:///app.db')
Session = sessionmaker(bind=engine)
session = Session()

# Find user and update role
user = session.query(User).filter(User.username == 'admin').first()
if user:
    user.role = 'ADMIN'
    session.commit()
    print('User role updated successfully')
else:
    print('User not found') 