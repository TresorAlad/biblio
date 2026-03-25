from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..deps import get_current_user
from ..schemas import LoginRequest, TokenResponse, UserBase, UserCreate
from ..security import create_access_token


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = crud.create_user(
        db,
        nom=payload.nom,
        prenom=payload.prenom,
        email=payload.email,
        password=payload.password,
        role=payload.role,
    )
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(
        access_token=token,
        user=UserBase(
            id=user.id,
            nom=user.nom,
            prenom=user.prenom,
            email=user.email,
            quota=user.quota,
            role=user.role,
        ),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, email=payload.email, password=payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(
        access_token=token,
        user=UserBase(
            id=user.id,
            nom=user.nom,
            prenom=user.prenom,
            email=user.email,
            quota=user.quota,
            role=user.role,
        ),
    )


@router.get("/me", response_model=UserBase)
def me(user=Depends(get_current_user)):
    return UserBase(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        quota=user.quota,
        role=user.role,
    )

