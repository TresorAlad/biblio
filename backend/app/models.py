from __future__ import annotations

import enum
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Boolean,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole(str, enum.Enum):
    ADHERENT = "ADHERENT"
    BIBLIOTHECAIRE = "BIBLIOTHECAIRE"


class EmpruntStatut(str, enum.Enum):
    ACTIF = "ACTIF"
    RETOURNE = "RETOURNE"


class ReservationStatut(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    PRET = "PRET"
    ANNULEE = "ANNULEE"
    TERMINEE = "TERMINEE"


class PenaliteStatut(str, enum.Enum):
    IMPAYEE = "IMPAYEE"
    PAYEE = "PAYEE"


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(100))
    prenom: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(190), unique=True, index=True)
    mot_de_passe_hash: Mapped[str] = mapped_column(String(255))
    quota: Mapped[int] = mapped_column(Integer, default=3)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.ADHERENT, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    emprunts: Mapped[list["Emprunt"]] = relationship(back_populates="adherent")
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="adherent")
    penalites: Mapped[list["Penalite"]] = relationship(back_populates="adherent")


class Categorie(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    livres: Mapped[list["Livre"]] = relationship(back_populates="categorie")


class Livre(Base):
    __tablename__ = "livres"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    titre: Mapped[str] = mapped_column(String(255), index=True)
    auteur: Mapped[str] = mapped_column(String(255), index=True)
    reference: Mapped[str | None] = mapped_column(String(64), nullable=True)
    isbn: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    annee_publication: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    exemplaires_total: Mapped[int] = mapped_column(Integer, default=1)
    exemplaires_disponibles: Mapped[int] = mapped_column(Integer, default=1)
    disponible: Mapped[bool] = mapped_column(Boolean, default=True)

    categorie_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    categorie: Mapped["Categorie"] = relationship(back_populates="livres")
    emprunts: Mapped[list["Emprunt"]] = relationship(back_populates="livre")
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="livre")


class Emprunt(Base):
    __tablename__ = "emprunts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    adherent_id: Mapped[int] = mapped_column(ForeignKey("utilisateurs.id"), index=True)
    livre_id: Mapped[int] = mapped_column(ForeignKey("livres.id"), index=True)
    date_emprunt: Mapped[date] = mapped_column(Date)
    date_retour_prevue: Mapped[date] = mapped_column(Date)
    date_retour: Mapped[date | None] = mapped_column(Date, nullable=True)
    statut: Mapped[EmpruntStatut] = mapped_column(Enum(EmpruntStatut), default=EmpruntStatut.ACTIF, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    adherent: Mapped["Utilisateur"] = relationship(back_populates="emprunts")
    livre: Mapped["Livre"] = relationship(back_populates="emprunts")
    penalite: Mapped["Penalite | None"] = relationship(back_populates="emprunt", uselist=False)


class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (
        UniqueConstraint("adherent_id", "livre_id", "statut", name="uq_reservation_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    adherent_id: Mapped[int] = mapped_column(ForeignKey("utilisateurs.id"), index=True)
    livre_id: Mapped[int] = mapped_column(ForeignKey("livres.id"), index=True)
    date_reservation: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    statut: Mapped[ReservationStatut] = mapped_column(Enum(ReservationStatut), default=ReservationStatut.EN_ATTENTE, index=True)
    notified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    adherent: Mapped["Utilisateur"] = relationship(back_populates="reservations")
    livre: Mapped["Livre"] = relationship(back_populates="reservations")


class Penalite(Base):
    __tablename__ = "penalites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    emprunt_id: Mapped[int] = mapped_column(ForeignKey("emprunts.id"), unique=True, index=True)
    adherent_id: Mapped[int] = mapped_column(ForeignKey("utilisateurs.id"), index=True)
    montant: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    nb_jours_retard: Mapped[int] = mapped_column(Integer)
    statut: Mapped[PenaliteStatut] = mapped_column(Enum(PenaliteStatut), default=PenaliteStatut.IMPAYEE, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    emprunt: Mapped["Emprunt"] = relationship(back_populates="penalite")
    adherent: Mapped["Utilisateur"] = relationship(back_populates="penalites")

