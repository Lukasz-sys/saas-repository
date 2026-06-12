from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.schemas.user import UserCreate
from app.models.user import User

from app.database.session import get_db
from app.core.security import hash_password

from app.schemas.user import UserCreate, UserLogin

from app.core.security import hash_password, verify_password
from app.core.auth import create_access_token, get_current_user
import secrets
from app.services.email_service import send_verification_email

router = APIRouter()


@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    verification_token = secrets.token_urlsafe(32)
    new_user = User(
    email=user.email,
    password_hash=hash_password(user.password),
    verification_token=verification_token
)

    db.add(new_user)

    db.commit()
    
    send_verification_email(user.email, verification_token)

    return {
    "message": "User created. Check your email."
}
    
    
@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not existing_user.is_verified:
        raise HTTPException(
        status_code=403,
        detail="Email not verified"
    )

    access_token = create_access_token(
        data={
            "sub": str(existing_user.id)
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
    
@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_verified": current_user.is_verified
    }
    
    
@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.verification_token == token
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token"
        )

    user.is_verified = True
    user.verification_token = None

    db.commit()

    return {
        "message": "Email verified"
    }