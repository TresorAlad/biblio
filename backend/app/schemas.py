from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

from .models import UserRole, ReservationStatut, PenaliteStatut


class UserBase(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    quota: int
    role: UserRole


class UserCreate(BaseModel):
    nom: str = Field(min_length=1, max_length=100)
    prenom: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)
    role: UserRole = UserRole.ADHERENT


class UserUpdate(BaseModel):
    nom: str | None = Field(default=None, min_length=1, max_length=100)
    prenom: str | None = Field(default=None, min_length=1, max_length=100)
    quota: int | None = None


class AdherentOut(UserBase):
    emprunts_actifs: int = 0



class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserBase


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CategorieOut(BaseModel):
    id: int
    nom: str


class LivreOut(BaseModel):
    id: int
    titre: str
    auteur: str
    isbn: str | None
    reference: str | None
    description: str | None
    annee_publication: int | None
    image_url: str | None
    exemplaires_total: int
    exemplaires_disponibles: int
    disponible: bool
    categorie: str


class LivreCreate(BaseModel):
    titre: str
    auteur: str
    isbn: str | None = None
    reference: str | None = None
    description: str | None = None
    annee_publication: int | None = None
    image_url: str | None = None
    exemplaires_total: int = 1
    exemplaires_disponibles: int = 1
    categorie_id: int


class LivreUpdate(BaseModel):
    titre: str | None = None
    auteur: str | None = None
    isbn: str | None = None
    reference: str | None = None
    description: str | None = None
    annee_publication: int | None = None
    image_url: str | None = None
    exemplaires_total: int | None = None
    exemplaires_disponibles: int | None = None
    categorie_id: int | None = None


class EmpruntOut(BaseModel):
    id: int
    livre_id: int
    livre_titre: str
    adherent_id: int
    date_emprunt: date
    date_retour_prevue: date
    date_retour: date | None
    statut: str
    est_en_retard: bool


class EmpruntCreate(BaseModel):
    adherent_id: int
    livre_id: int
    date_emprunt: date | None = None
    duree_jours: int = 30


class ReservationOut(BaseModel):
    id: int
    livre_id: int
    livre_titre: str
    adherent_id: int
    date_reservation: datetime
    statut: ReservationStatut


class ReservationCreate(BaseModel):
    livre_id: int


class PenaliteOut(BaseModel):
    id: int
    adherent_id: int
    emprunt_id: int
    montant: Decimal
    nb_jours_retard: int
    statut: PenaliteStatut
    created_at: datetime
    paid_at: datetime | None

