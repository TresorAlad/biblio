export type UserRole = 'ADHERENT' | 'BIBLIOTHECAIRE'

export interface AuthUser {
  id: string
  nom: string
  prenom: string
  email: string
  quota: number
  role: UserRole
}

export interface Livre {
  id: string
  titre: string
  auteur: string
  isbn: string
  categorie: string
  exemplairesDisponibles: number
  exemplairesTotal: number
  description: string
  anneePublication: number
  image?: string
}

export interface Categorie {
  id: number
  nom: string
}

export type EmpruntStatut = 'ACTIF' | 'RETOURNE' | 'RETARD'

export interface Emprunt {
  id: string
  livreId: string
  livreTitre: string
  adherentId: string
  dateEmprunt: string
  dateRetourPrevue: string
  dateRetourEffective?: string
  statut: EmpruntStatut
  estEnRetard: boolean
}

export type ReservationStatut = 'EN_ATTENTE' | 'PRET' | 'ANNULEE' | 'TERMINEE'

export interface Reservation {
  id: string
  livreId: string
  livreTitre: string
  adherentId: string
  dateReservation: string
  statut: ReservationStatut
}

export type AmendeStatut = 'IMPAYEE' | 'PAYEE'

export interface Amende {
  id: string
  adherentId: string
  empruntId: string
  montant: number
  nombreJourRetard: number
  dateCreation: string
  statut: AmendeStatut
}

export interface Adherent {
  id: string
  nom: string
  prenom: string
  email: string
  quota: number
  empruntsActifs: number
}

