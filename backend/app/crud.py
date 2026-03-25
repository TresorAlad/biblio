from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import and_, or_, select, func
from sqlalchemy.orm import Session, joinedload

from .config import settings
from .models import (
    Categorie,
    Emprunt,
    EmpruntStatut,
    Livre,
    Penalite,
    PenaliteStatut,
    Reservation,
    ReservationStatut,
    Utilisateur,
    UserRole,
)
from .security import hash_password, verify_password


def get_user_by_email(db: Session, email: str) -> Utilisateur | None:
    return db.execute(select(Utilisateur).where(Utilisateur.email == email)).scalar_one_or_none()


def create_user(db: Session, *, nom: str, prenom: str, email: str, password: str, role: UserRole) -> Utilisateur:
    user = Utilisateur(
        nom=nom,
        prenom=prenom,
        email=email,
        mot_de_passe_hash=hash_password(password),
        role=role,
        quota=99 if role == UserRole.BIBLIOTHECAIRE else 3,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, *, email: str, password: str) -> Utilisateur | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.mot_de_passe_hash):
        return None
    return user


def list_categories(db: Session) -> list[Categorie]:
    return list(db.execute(select(Categorie).order_by(Categorie.nom.asc())).scalars().all())


def create_category(db: Session, *, nom: str) -> Categorie:
    cat = Categorie(nom=nom)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def list_livres(
    db: Session,
    *,
    search: str | None = None,
    categorie_id: int | None = None,
) -> list[Livre]:
    stmt = select(Livre).options(joinedload(Livre.categorie)).order_by(Livre.titre.asc())
    if categorie_id is not None:
        stmt = stmt.where(Livre.categorie_id == categorie_id)
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Livre.titre).like(like),
                func.lower(Livre.auteur).like(like),
                func.lower(func.coalesce(Livre.isbn, "")).like(like),
            )
        )
    return list(db.execute(stmt).scalars().all())


def get_livre(db: Session, livre_id: int) -> Livre | None:
    return db.execute(
        select(Livre).options(joinedload(Livre.categorie)).where(Livre.id == livre_id)
    ).scalar_one_or_none()


def create_livre(db: Session, *, data: dict) -> Livre:
    livre = Livre(**data)
    livre.disponible = livre.exemplaires_disponibles > 0
    db.add(livre)
    db.commit()
    db.refresh(livre)
    return get_livre(db, livre.id)  # with categorie loaded


def update_livre(db: Session, *, livre: Livre, data: dict) -> Livre:
    for k, v in data.items():
        setattr(livre, k, v)
    if livre.exemplaires_disponibles < 0:
        livre.exemplaires_disponibles = 0
    if livre.exemplaires_total < 0:
        livre.exemplaires_total = 0
    livre.disponible = livre.exemplaires_disponibles > 0
    db.add(livre)
    db.commit()
    db.refresh(livre)
    return get_livre(db, livre.id)


def delete_livre(db: Session, *, livre: Livre) -> None:
    db.delete(livre)
    db.commit()


def count_active_emprunts_for_user(db: Session, *, user_id: int) -> int:
    return int(
        db.execute(
            select(func.count(Emprunt.id)).where(
                and_(Emprunt.adherent_id == user_id, Emprunt.statut == EmpruntStatut.ACTIF)
            )
        ).scalar_one()
    )


def has_unpaid_penalties(db: Session, *, user_id: int) -> bool:
    cnt = db.execute(
        select(func.count(Penalite.id)).where(
            and_(Penalite.adherent_id == user_id, Penalite.statut == PenaliteStatut.IMPAYEE)
        )
    ).scalar_one()
    return int(cnt) > 0


def create_emprunt(
    db: Session,
    *,
    adherent: Utilisateur,
    livre: Livre,
    date_emprunt: date | None,
    duree_jours: int,
) -> Emprunt:
    if adherent.role != UserRole.ADHERENT:
        raise ValueError("Seuls les adhérents peuvent emprunter")
    if has_unpaid_penalties(db, user_id=adherent.id):
        raise ValueError("Amendes impayées: emprunt bloqué")
    actifs = count_active_emprunts_for_user(db, user_id=adherent.id)
    if actifs >= adherent.quota:
        raise ValueError("Quota d'emprunts atteint")
    if livre.exemplaires_disponibles <= 0:
        raise ValueError("Livre indisponible")

    d_emprunt = date_emprunt or date.today()
    d_retour_prevue = d_emprunt + timedelta(days=max(1, int(duree_jours)))

    livre.exemplaires_disponibles -= 1
    livre.disponible = livre.exemplaires_disponibles > 0

    emprunt = Emprunt(
        adherent_id=adherent.id,
        livre_id=livre.id,
        date_emprunt=d_emprunt,
        date_retour_prevue=d_retour_prevue,
        statut=EmpruntStatut.ACTIF,
    )
    db.add(emprunt)
    db.add(livre)
    db.commit()
    db.refresh(emprunt)
    return emprunt


def return_emprunt(db: Session, *, emprunt: Emprunt) -> Emprunt:
    if emprunt.statut != EmpruntStatut.ACTIF:
        return emprunt

    today = date.today()
    emprunt.date_retour = today
    emprunt.statut = EmpruntStatut.RETOURNE

    livre = db.get(Livre, emprunt.livre_id)
    if livre:
        livre.exemplaires_disponibles += 1
        if livre.exemplaires_disponibles > livre.exemplaires_total:
            livre.exemplaires_disponibles = livre.exemplaires_total
        livre.disponible = livre.exemplaires_disponibles > 0
        db.add(livre)

    # pénalité si retard
    if today > emprunt.date_retour_prevue:
        nb = (today - emprunt.date_retour_prevue).days
        montant = (Decimal(str(settings.penalty_rate_per_day)) * Decimal(nb)).quantize(Decimal("0.01"))

        if emprunt.penalite is None:
            pen = Penalite(
                emprunt_id=emprunt.id,
                adherent_id=emprunt.adherent_id,
                montant=montant,
                nb_jours_retard=nb,
                statut=PenaliteStatut.IMPAYEE,
            )
            db.add(pen)
        else:
            emprunt.penalite.nb_jours_retard = nb
            emprunt.penalite.montant = montant
            db.add(emprunt.penalite)

    db.add(emprunt)
    db.commit()
    db.refresh(emprunt)
    return emprunt


def list_emprunts(
    db: Session,
    *,
    adherent_id: int | None = None,
    only_active: bool | None = None,
) -> list[Emprunt]:
    stmt = select(Emprunt).options(joinedload(Emprunt.livre)).order_by(Emprunt.id.desc())
    if adherent_id is not None:
        stmt = stmt.where(Emprunt.adherent_id == adherent_id)
    if only_active is True:
        stmt = stmt.where(Emprunt.statut == EmpruntStatut.ACTIF)
    return list(db.execute(stmt).scalars().all())


def create_reservation(db: Session, *, adherent: Utilisateur, livre: Livre) -> Reservation:
    if adherent.role != UserRole.ADHERENT:
        raise ValueError("Seuls les adhérents peuvent réserver")
    if livre.exemplaires_disponibles > 0:
        raise ValueError("Livre disponible: empruntez-le directement")

    reservation = Reservation(
        adherent_id=adherent.id,
        livre_id=livre.id,
        statut=ReservationStatut.EN_ATTENTE,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def list_reservations(db: Session, *, adherent_id: int | None = None) -> list[Reservation]:
    stmt = select(Reservation).options(joinedload(Reservation.livre)).order_by(Reservation.id.desc())
    if adherent_id is not None:
        stmt = stmt.where(Reservation.adherent_id == adherent_id)
    return list(db.execute(stmt).scalars().all())


def cancel_reservation(db: Session, *, reservation: Reservation) -> Reservation:
    reservation.statut = ReservationStatut.ANNULEE
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def mark_reservation_ready(db: Session, *, reservation: Reservation) -> Reservation:
    reservation.statut = ReservationStatut.PRET
    reservation.notified_at = datetime.now(timezone.utc).replace(tzinfo=None)
    reservation.expires_at = (datetime.now(timezone.utc) + timedelta(days=2)).replace(tzinfo=None)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def reservation_to_emprunt(db: Session, *, reservation: Reservation, duree_jours: int = 30) -> Emprunt:
    if reservation.statut != ReservationStatut.PRET:
        raise ValueError("Réservation non prête")
    livre = db.get(Livre, reservation.livre_id)
    adherent = db.get(Utilisateur, reservation.adherent_id)
    if not livre or not adherent:
        raise ValueError("Données manquantes")
    if livre.exemplaires_disponibles <= 0:
        raise ValueError("Livre indisponible")

    emprunt = create_emprunt(db, adherent=adherent, livre=livre, date_emprunt=date.today(), duree_jours=duree_jours)
    reservation.statut = ReservationStatut.TERMINEE
    db.add(reservation)
    db.commit()
    return emprunt


def list_penalites(db: Session, *, adherent_id: int | None = None) -> list[Penalite]:
    stmt = select(Penalite).order_by(Penalite.id.desc())
    if adherent_id is not None:
        stmt = stmt.where(Penalite.adherent_id == adherent_id)
    return list(db.execute(stmt).scalars().all())


def mark_penalite_paid(db: Session, *, penalite: Penalite) -> Penalite:
    penalite.statut = PenaliteStatut.PAYEE
    penalite.paid_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.add(penalite)
    db.commit()
    db.refresh(penalite)
    return penalite

