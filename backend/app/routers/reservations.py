from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from .. import crud
from ..database import get_db
from ..deps import get_current_user, require_role
from ..models import Reservation, ReservationStatut, UserRole
from ..schemas import ReservationCreate, ReservationOut


router = APIRouter(prefix="/reservations", tags=["reservations"])


def _to_out(r: Reservation) -> ReservationOut:
    return ReservationOut(
        id=r.id,
        livre_id=r.livre_id,
        livre_titre=r.livre.titre if r.livre else "",
        adherent_id=r.adherent_id,
        date_reservation=r.date_reservation,
        statut=r.statut,
    )


@router.get("", response_model=list[ReservationOut])
def list_endpoint(
    adherent_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role == UserRole.ADHERENT:
        adherent_id = user.id
    reservations = crud.list_reservations(db, adherent_id=adherent_id)
    return [_to_out(r) for r in reservations]


@router.post("", response_model=ReservationOut, dependencies=[Depends(require_role(UserRole.ADHERENT))])
def create_endpoint(payload: ReservationCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    livre = crud.get_livre(db, payload.livre_id)
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    try:
        r = crud.create_reservation(db, adherent=user, livre=livre)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Réservation déjà existante")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    r_full = db.execute(
        select(Reservation).options(joinedload(Reservation.livre)).where(Reservation.id == r.id)
    ).scalar_one()
    return _to_out(r_full)


@router.post("/{reservation_id}/annuler", response_model=ReservationOut)
def cancel_endpoint(reservation_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = db.get(Reservation, reservation_id)
    if not r:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if user.role == UserRole.ADHERENT and r.adherent_id != user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    r = crud.cancel_reservation(db, reservation=r)
    r_full = db.execute(
        select(Reservation).options(joinedload(Reservation.livre)).where(Reservation.id == r.id)
    ).scalar_one()
    return _to_out(r_full)


@router.post("/{reservation_id}/notifier", response_model=ReservationOut, dependencies=[Depends(require_role(UserRole.BIBLIOTHECAIRE))])
def notify_ready_endpoint(reservation_id: int, db: Session = Depends(get_db)):
    r = db.get(Reservation, reservation_id)
    if not r:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if r.statut != ReservationStatut.EN_ATTENTE:
        raise HTTPException(status_code=400, detail="Statut invalide")
    r = crud.mark_reservation_ready(db, reservation=r)
    r_full = db.execute(
        select(Reservation).options(joinedload(Reservation.livre)).where(Reservation.id == r.id)
    ).scalar_one()
    return _to_out(r_full)


@router.post("/{reservation_id}/emprunter")
def borrow_from_reservation_endpoint(
    reservation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    r = db.get(Reservation, reservation_id)
    if not r:
        raise HTTPException(status_code=404, detail="Réservation introuvable")
    if user.role == UserRole.ADHERENT and r.adherent_id != user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    try:
        emprunt = crud.reservation_to_emprunt(db, reservation=r)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True, "emprunt_id": emprunt.id}

