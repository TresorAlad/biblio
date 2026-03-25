import type {
  Adherent,
  Amende,
  AuthUser,
  Categorie,
  Emprunt,
  Livre,
  Reservation,
  UserRole,
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(init?.headers || {})
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = text
    try {
      const json = JSON.parse(text)
      message = json.detail || json.message || text
    } catch {}
    throw new Error(message || `Erreur API (${res.status})`)
  }
  return (await res.json()) as T
}

function toAuthUser(u: any): AuthUser {
  return {
    id: String(u.id),
    nom: u.nom,
    prenom: u.prenom,
    email: u.email,
    quota: u.quota,
    role: u.role as UserRole,
  }
}

function toLivre(l: any): Livre {
  return {
    id: String(l.id),
    titre: l.titre,
    auteur: l.auteur,
    isbn: l.isbn || '',
    categorie: l.categorie || '',
    exemplairesDisponibles: l.exemplaires_disponibles ?? l.exemplairesDisponibles ?? 0,
    exemplairesTotal: l.exemplaires_total ?? l.exemplairesTotal ?? 0,
    description: l.description || '',
    anneePublication: l.annee_publication ?? l.anneePublication ?? 0,
    image: l.image_url || undefined,
  }
}

function toEmprunt(e: any): Emprunt {
  return {
    id: String(e.id),
    livreId: String(e.livre_id),
    livreTitre: e.livre_titre,
    adherentId: String(e.adherent_id),
    dateEmprunt: e.date_emprunt,
    dateRetourPrevue: e.date_retour_prevue,
    dateRetourEffective: e.date_retour || undefined,
    statut: e.statut,
    estEnRetard: Boolean(e.est_en_retard),
  }
}

function toReservation(r: any): Reservation {
  return {
    id: String(r.id),
    livreId: String(r.livre_id),
    livreTitre: r.livre_titre,
    adherentId: String(r.adherent_id),
    dateReservation: r.date_reservation,
    statut: r.statut,
  }
}

function toAmende(p: any): Amende {
  return {
    id: String(p.id),
    adherentId: String(p.adherent_id),
    empruntId: String(p.emprunt_id),
    montant: Number(p.montant),
    nombreJourRetard: p.nb_jours_retard,
    dateCreation: p.created_at,
    statut: p.statut,
  }
}

export const api = {
  async login(email: string, password: string) {
    const data = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const user = toAuthUser(data.user)
    storeAuth(data.access_token, user)
    return user
  },

  async register(nomComplet: string, email: string, password: string, role: UserRole) {
    const [prenom, ...rest] = nomComplet.trim().split(' ')
    const nom = rest.join(' ') || prenom
    const data = await apiFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nom, prenom, email, password, role }),
    })
    const user = toAuthUser(data.user)
    storeAuth(data.access_token, user)
    return user
  },

  async me() {
    const u = await apiFetch<any>('/auth/me')
    const user = toAuthUser(u)
    const token = getStoredToken()
    if (token) storeAuth(token, user)
    return user
  },

  async listCategories(): Promise<Categorie[]> {
    return await apiFetch<Categorie[]>('/categories')
  },

  async listLivres(params?: { search?: string; categorieId?: number }): Promise<Livre[]> {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.categorieId) q.set('categorie_id', String(params.categorieId))
    const data = await apiFetch<any[]>(`/livres${q.toString() ? `?${q.toString()}` : ''}`)
    return data.map(toLivre)
  },

  async createEmprunt(livreId: string, adherentId?: string) {
    const body: any = { livre_id: Number(livreId), adherent_id: Number(adherentId || 0), duree_jours: 30 }
    const e = await apiFetch<any>('/emprunts', { method: 'POST', body: JSON.stringify(body) })
    return toEmprunt(e)
  },

  async listEmprunts(params?: { adherentId?: string }): Promise<Emprunt[]> {
    const q = new URLSearchParams()
    if (params?.adherentId) q.set('adherent_id', params.adherentId)
    const data = await apiFetch<any[]>(`/emprunts${q.toString() ? `?${q.toString()}` : ''}`)
    return data.map(toEmprunt)
  },

  async retourEmprunt(empruntId: string) {
    const e = await apiFetch<any>(`/emprunts/${empruntId}/retour`, { method: 'POST' })
    return toEmprunt(e)
  },

  async createReservation(livreId: string) {
    const r = await apiFetch<any>('/reservations', { method: 'POST', body: JSON.stringify({ livre_id: Number(livreId) }) })
    return toReservation(r)
  },

  async listReservations(params?: { adherentId?: string }): Promise<Reservation[]> {
    const q = new URLSearchParams()
    if (params?.adherentId) q.set('adherent_id', params.adherentId)
    const data = await apiFetch<any[]>(`/reservations${q.toString() ? `?${q.toString()}` : ''}`)
    return data.map(toReservation)
  },

  async annulerReservation(reservationId: string) {
    const r = await apiFetch<any>(`/reservations/${reservationId}/annuler`, { method: 'POST' })
    return toReservation(r)
  },

  async notifierReservation(reservationId: string) {
    const r = await apiFetch<any>(`/reservations/${reservationId}/notifier`, { method: 'POST' })
    return toReservation(r)
  },

  async emprunterDepuisReservation(reservationId: string) {
    return await apiFetch<any>(`/reservations/${reservationId}/emprunter`, { method: 'POST' })
  },

  async listAmendes(params?: { adherentId?: string }): Promise<Amende[]> {
    const q = new URLSearchParams()
    if (params?.adherentId) q.set('adherent_id', params.adherentId)
    const data = await apiFetch<any[]>(`/penalites${q.toString() ? `?${q.toString()}` : ''}`)
    return data.map(toAmende)
  },

  async payerAmende(amendeId: string) {
    const p = await apiFetch<any>(`/penalites/${amendeId}/payer`, { method: 'POST' })
    return toAmende(p)
  },

  async listAdherents(): Promise<Adherent[]> {
    const data = await apiFetch<any[]>('/adherents')
    return data.map((a) => ({
      id: String(a.id),
      nom: a.nom,
      prenom: a.prenom,
      email: a.email,
      quota: a.quota,
      empruntsActifs: a.emprunts_actifs ?? a.empruntsActifs ?? 0,
    }))
  },
}

