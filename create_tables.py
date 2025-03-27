from sqlalchemy import create_engine
from app.models.user import Base

# Create database engine
engine = create_engine('sqlite:///chat.db')

# Create all tables
Base.metadata.create_all(engine)
print('Database tables created successfully') 