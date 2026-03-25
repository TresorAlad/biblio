from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..deps import get_current_user, require_role
from ..models import Penalite, UserRole
from ..schemas import PenaliteOut


router = APIRouter(prefix="/penalites", tags=["penalites"])


def _to_out(p: Penalite) -> PenaliteOut:
    return PenaliteOut(
        id=p.id,
        adherent_id=p.adherent_id,
        emprunt_id=p.emprunt_id,
        montant=p.montant,
        nb_jours_retard=p.nb_jours_retard,
        statut=p.statut,
        created_at=p.created_at,
        paid_at=p.paid_at,
    )


@router.get("", response_model=list[PenaliteOut])
def list_endpoint(
    adherent_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role == UserRole.ADHERENT:
        adherent_id = user.id
    penalites = crud.list_penalites(db, adherent_id=adherent_id)
    return [_to_out(p) for p in penalites]


@router.post("/{penalite_id}/payer", response_model=PenaliteOut, dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def payer_endpoint(penalite_id: int, db: Session = Depends(get_db)):
    p = db.get(Penalite, penalite_id)
    if not p:
        raise HTTPException(status_code=404, detail="Pénalité introuvable")
    p = crud.mark_penalite_paid(db, penalite=p)
    return _to_out(p)

