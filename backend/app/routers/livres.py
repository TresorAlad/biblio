from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..deps import require_role
from ..models import UserRole
from ..schemas import LivreCreate, LivreOut, LivreUpdate


router = APIRouter(prefix="/livres", tags=["livres"])


def _to_out(l):
    return LivreOut(
        id=l.id,
        titre=l.titre,
        auteur=l.auteur,
        isbn=l.isbn,
        reference=l.reference,
        description=l.description,
        annee_publication=l.annee_publication,
        image_url=l.image_url,
        exemplaires_total=l.exemplaires_total,
        exemplaires_disponibles=l.exemplaires_disponibles,
        disponible=bool(l.disponible),
        categorie=l.categorie.nom if l.categorie else "",
    )


@router.get("", response_model=list[LivreOut])
def list_endpoint(
    search: str | None = Query(default=None),
    categorie_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    livres = crud.list_livres(db, search=search, categorie_id=categorie_id)
    return [_to_out(l) for l in livres]


@router.get("/{livre_id}", response_model=LivreOut)
def get_endpoint(livre_id: int, db: Session = Depends(get_db)):
    livre = crud.get_livre(db, livre_id)
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    return _to_out(livre)


@router.post("", response_model=LivreOut, dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def create_endpoint(payload: LivreCreate, db: Session = Depends(get_db)):
    livre = crud.create_livre(db, data=payload.model_dump())
    return _to_out(livre)


@router.put("/{livre_id}", response_model=LivreOut, dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def update_endpoint(livre_id: int, payload: LivreUpdate, db: Session = Depends(get_db)):
    livre = crud.get_livre(db, livre_id)
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    livre = crud.update_livre(db, livre=livre, data={k: v for k, v in payload.model_dump().items() if v is not None})
    return _to_out(livre)


@router.delete("/{livre_id}", dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def delete_endpoint(livre_id: int, db: Session = Depends(get_db)):
    livre = crud.get_livre(db, livre_id)
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    crud.delete_livre(db, livre=livre)
    return {"ok": True}

