from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from database import Base
from database import engine


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    lastname = Column(String)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

# Create the tables
Base.metadata.create_all(bind=engine)