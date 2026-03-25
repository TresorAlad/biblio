from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..deps import require_role
from ..models import Emprunt, EmpruntStatut, Utilisateur, UserRole
from ..schemas import AdherentOut, UserCreate, UserUpdate


router = APIRouter(prefix="/adherents", tags=["adherents"])


@router.get("", response_model=list[AdherentOut], dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def list_endpoint(db: Session = Depends(get_db)):
    stmt = (
        select(
            Utilisateur,
            func.count(Emprunt.id).label("emprunts_actifs"),
        )
        .outerjoin(
            Emprunt,
            (Emprunt.adherent_id == Utilisateur.id) & (Emprunt.statut == EmpruntStatut.ACTIF),
        )
        .where(Utilisateur.role == UserRole.ADHERENT)
        .group_by(Utilisateur.id)
        .order_by(Utilisateur.nom.asc(), Utilisateur.prenom.asc())
    )
    rows = db.execute(stmt).all()
    out: list[AdherentOut] = []
    for user, emprunts_actifs in rows:
        out.append(
            AdherentOut(
                id=user.id,
                nom=user.nom,
                prenom=user.prenom,
                email=user.email,
                quota=user.quota,
                role=user.role,
                emprunts_actifs=int(emprunts_actifs or 0),
            )
        )
    return out


@router.post("", response_model=AdherentOut, dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def create_endpoint(payload: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    user = crud.create_user(
        db,
        nom=payload.nom,
        prenom=payload.prenom,
        email=payload.email,
        password=payload.password,
        role=UserRole.ADHERENT,
    )
    return AdherentOut(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        quota=user.quota,
        role=user.role,
        emprunts_actifs=0,
    )


@router.put("/{adherent_id}", response_model=AdherentOut, dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def update_endpoint(adherent_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.get(Utilisateur, adherent_id)
    if not user or user.role != UserRole.ADHERENT:
        raise HTTPException(status_code=404, detail="Adhérent introuvable")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    for k, v in data.items():
        setattr(user, k, v)
    db.add(user)
    db.commit()
    db.refresh(user)
    actifs = crud.count_active_emprunts_for_user(db, user_id=user.id)
    return AdherentOut(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        quota=user.quota,
        role=user.role,
        emprunts_actifs=actifs,
    )

