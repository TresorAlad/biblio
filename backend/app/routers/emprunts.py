from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from .. import crud
from ..database import get_db
from ..deps import get_current_user
from ..models import Emprunt, EmpruntStatut, UserRole, Utilisateur
from ..schemas import EmpruntCreate, EmpruntOut


router = APIRouter(prefix="/emprunts", tags=["emprunts"])


def _is_overdue(e: Emprunt) -> bool:
    if e.statut != EmpruntStatut.ACTIF:
        return False
    return date.today() > e.date_retour_prevue


def _to_out(e: Emprunt) -> EmpruntOut:
    return EmpruntOut(
        id=e.id,
        livre_id=e.livre_id,
        livre_titre=e.livre.titre if e.livre else "",
        adherent_id=e.adherent_id,
        date_emprunt=e.date_emprunt,
        date_retour_prevue=e.date_retour_prevue,
        date_retour=e.date_retour,
        statut="RETARD" if _is_overdue(e) else e.statut.value,
        est_en_retard=_is_overdue(e),
    )


@router.get("", response_model=list[EmpruntOut])
def list_endpoint(
    adherent_id: int | None = Query(default=None),
    only_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role == UserRole.ADHERENT:
        adherent_id = user.id
    emprunts = crud.list_emprunts(db, adherent_id=adherent_id, only_active=only_active)
    return [_to_out(e) for e in emprunts]


@router.post("", response_model=EmpruntOut)
def create_endpoint(payload: EmpruntCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # adhérent: emprunt pour lui-même
    if user.role == UserRole.ADHERENT:
        adherent = user
    else:
        adherent = db.get(Utilisateur, payload.adherent_id)
        if adherent is None or adherent.role != UserRole.ADHERENT:
            raise HTTPException(status_code=404, detail="Adhérent introuvable")

    livre = crud.get_livre(db, payload.livre_id)
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")

    try:
        emprunt = crud.create_emprunt(
            db,
            adherent=adherent,
            livre=livre,
            date_emprunt=payload.date_emprunt,
            duree_jours=payload.duree_jours,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    emprunt_full = db.execute(
        select(Emprunt).options(joinedload(Emprunt.livre)).where(Emprunt.id == emprunt.id)
    ).scalar_one()
    return _to_out(emprunt_full)


@router.post("/{emprunt_id}/retour", response_model=EmpruntOut)
def retour_endpoint(emprunt_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    emprunt = db.get(Emprunt, emprunt_id)
    if not emprunt:
        raise HTTPException(status_code=404, detail="Emprunt introuvable")
    if user.role == UserRole.ADHERENT and emprunt.adherent_id != user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")

    emprunt = crud.return_emprunt(db, emprunt=emprunt)
    emprunt = db.execute(
        select(Emprunt).options(joinedload(Emprunt.livre)).where(Emprunt.id == emprunt_id)
    ).scalar_one()
    return _to_out(emprunt)

