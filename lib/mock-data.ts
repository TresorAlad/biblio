// Mock data for the library management system

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

export interface Emprunt {
  id: string
  livreId: string
  livreTitre: string
  adherentId: string
  dateEmprunt: string
  dateRetourPrevue: string
  dateRetourEffective?: string
  statut: 'ACTIF' | 'RETOURNE' | 'RETARD'
}

export interface Reservation {
  id: string
  livreId: string
  livreTitre: string
  adherentId: string
  dateReservation: string
  statut: 'EN_ATTENTE' | 'PRET' | 'ANNULEE'
}

export interface Adherent {
  id: string
  nom: string
  email: string
  type: 'ETUDIANT' | 'ENSEIGNANT'
  dateInscription: string
  carteAdherent: string
}

export interface Amende {
  id: string
  adherentId: string
  montant: number
  raison: string
  dateCreaion: string
  statut: 'IMPAYEE' | 'PAYEE'
}

// Mock books data
export const mockLivres: Livre[] = [
  {
    id: '1',
    titre: 'Clean Code',
    auteur: 'Robert C. Martin',
    isbn: '978-0132350884',
    categorie: 'Informatique',
    exemplairesDisponibles: 3,
    exemplairesTotal: 5,
    description: 'A handbook of agile software craftsmanship',
    anneePublication: 2008,
  },
  {
    id: '2',
    titre: 'The Pragmatic Programmer',
    auteur: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    categorie: 'Informatique',
    exemplairesDisponibles: 2,
    exemplairesTotal: 4,
    description: 'Your journey to mastery',
    anneePublication: 2019,
  },
  {
    id: '3',
    titre: 'Design Patterns',
    auteur: 'Gang of Four',
    isbn: '978-0201633610',
    categorie: 'Informatique',
    exemplairesDisponibles: 1,
    exemplairesTotal: 3,
    description: 'Elements of Reusable Object-Oriented Software',
    anneePublication: 1994,
  },
  {
    id: '4',
    titre: '1984',
    auteur: 'George Orwell',
    isbn: '978-0451524935',
    categorie: 'Littérature',
    exemplairesDisponibles: 4,
    exemplairesTotal: 5,
    description: 'A dystopian social science fiction novel',
    anneePublication: 1949,
  },
  {
    id: '5',
    titre: 'To Kill a Mockingbird',
    auteur: 'Harper Lee',
    isbn: '978-0061120084',
    categorie: 'Littérature',
    exemplairesDisponibles: 3,
    exemplairesTotal: 4,
    description: 'A gripping tale of racial injustice',
    anneePublication: 1960,
  },
  {
    id: '6',
    titre: 'Sapiens',
    auteur: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    categorie: 'Histoire',
    exemplairesDisponibles: 2,
    exemplairesTotal: 3,
    description: 'A brief history of humankind',
    anneePublication: 2011,
  },
  {
    id: '7',
    titre: 'Atomic Habits',
    auteur: 'James Clear',
    isbn: '978-0735211292',
    categorie: 'Développement Personnel',
    exemplairesDisponibles: 5,
    exemplairesTotal: 6,
    description: 'Tiny changes, remarkable results',
    anneePublication: 2018,
  },
  {
    id: '8',
    titre: 'The Art of Computer Programming',
    auteur: 'Donald Knuth',
    isbn: '978-0201896831',
    categorie: 'Informatique',
    exemplairesDisponibles: 0,
    exemplairesTotal: 2,
    description: 'Fundamental algorithms',
    anneePublication: 1968,
  },
]

export const mockEmprunts: Emprunt[] = [
  {
    id: '1',
    livreId: '1',
    livreTitre: 'Clean Code',
    adherentId: 'adherent1',
    dateEmprunt: '2024-01-15',
    dateRetourPrevue: '2024-02-15',
    statut: 'ACTIF',
  },
  {
    id: '2',
    livreId: '4',
    livreTitre: '1984',
    adherentId: 'adherent1',
    dateEmprunt: '2024-02-01',
    dateRetourPrevue: '2024-03-01',
    statut: 'RETARD',
  },
  {
    id: '3',
    livreId: '2',
    livreTitre: 'The Pragmatic Programmer',
    adherentId: 'adherent1',
    dateEmprunt: '2023-12-20',
    dateRetourPrevue: '2024-01-20',
    dateRetourEffective: '2024-01-25',
    statut: 'RETOURNE',
  },
]

export const mockReservations: Reservation[] = [
  {
    id: '1',
    livreId: '8',
    livreTitre: 'The Art of Computer Programming',
    adherentId: 'adherent1',
    dateReservation: '2024-02-20',
    statut: 'EN_ATTENTE',
  },
]

export const mockAmendes: Amende[] = [
  {
    id: '1',
    adherentId: 'adherent1',
    montant: 5.0,
    raison: 'Retard de retour - 1984',
    dateCreaion: '2024-03-05',
    statut: 'IMPAYEE',
  },
]

// Helper functions
export function getLivreById(id: string): Livre | undefined {
  return mockLivres.find(livre => livre.id === id)
}

export function getEmpruntsByAdherent(adherentId: string): Emprunt[] {
  return mockEmprunts.filter(e => e.adherentId === adherentId)
}

export function getReservationsByAdherent(adherentId: string): Reservation[] {
  return mockReservations.filter(r => r.adherentId === adherentId)
}

export function getAmendesByAdherent(adherentId: string): Amende[] {
  return mockAmendes.filter(a => a.adherentId === adherentId)
}

export function getCategories(): string[] {
  return Array.from(new Set(mockLivres.map(l => l.categorie)))
}
