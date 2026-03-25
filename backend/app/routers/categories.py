from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..crud import create_category, list_categories
from ..database import get_db
from ..deps import require_role
from ..models import UserRole
from ..schemas import CategorieOut


router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryCreate(BaseModel):
    nom: str = Field(min_length=1, max_length=120)


@router.get("", response_model=list[CategorieOut])
def get_categories(db: Session = Depends(get_db)):
    return [CategorieOut(id=c.id, nom=c.nom) for c in list_categories(db)]


@router.post("", response_model=CategorieOut, dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def post_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    try:
        c = create_category(db, nom=payload.nom)
    except Exception:
        # nom unique
        raise HTTPException(status_code=400, detail="Catégorie déjà existante")
    return CategorieOut(id=c.id, nom=c.nom)

