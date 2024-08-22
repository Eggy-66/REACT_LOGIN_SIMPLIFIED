from fastapi import FastAPI, HTTPException, Depends, Header
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine
import models
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

SECRET_KEY = "your_secret_key"  # Replace with a strong secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1

app = FastAPI()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# pydantic model
class UserCreate(BaseModel):
    name: str
    lastname: str
    email: str
    username: str
    password: str

    class Config:
        orm_mode = True

    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# endpoint
@app.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    db_user = models.User(
        name=user.name,
        lastname=user.lastname,
        email=user.email,
        username=user.username,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(authorization: Optional[str] = Header(None)):
    if authorization:
        token = authorization.replace("Bearer ", "")
        payload = verify_token(token)
        if payload:
            return payload.get("sub")
    raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/user/")
async def get_user(username: str = Depends(get_current_user)):
    return {"username": username}

@app.get("/users/")
async def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {
            "username": user.username,
            "email": user.email,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "password": user.password.decode('utf-8')  # Assuming password is stored as bytes
        }
        for user in users
    ]
@app.get('/')
async def check():
    return 'hello'

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)
