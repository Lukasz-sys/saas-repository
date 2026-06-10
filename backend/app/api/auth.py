from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.schemas.user import UserCreate
from app.models.user import User

from app.database.session import get_db
from app.core.security import hash_password

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

    new_user = User(
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)

    db.commit()

    return {
        "message": "User created"
    }