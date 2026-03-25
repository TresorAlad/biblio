'use client'

import { useAuth } from '@/app/auth-context'
import { api } from '@/lib/api'
import type { Livre, Reservation } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, BookOpen, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function ReservationsPage() {
  const { user } = useAuth()
  
  if (!user) return null

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [livres, setLivres] = useState<Livre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [r, l] = await Promise.all([api.listReservations(), api.listLivres()])
        if (cancelled) return
        setReservations(r)
        setLivres(l)
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const livreById = useMemo(() => {
    const map = new Map<string, Livre>()
    livres.forEach((l) => map.set(l.id, l))
    return map
  }, [livres])

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'bg-primary/10 text-primary'
      case 'PRET':
        return 'bg-green-100 text-green-700'
      case 'ANNULEE':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'En attente'
      case 'PRET':
        return 'Prêt à récupérer'
      case 'ANNULEE':
        return 'Annulée'
      default:
        return statut
    }
  }

  const getDaysWaiting = (dateReservation: string) => {
    const today = new Date()
    const reservationDate = new Date(dateReservation)
    const diffTime = today.getTime() - reservationDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleCancel = (reservationId: string) => {
    ;(async () => {
      try {
        await api.annulerReservation(reservationId)
        setReservations(await api.listReservations())
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Erreur')
      }
    })()
  }

  const handleBorrow = (reservationId: string) => {
    ;(async () => {
      try {
        await api.emprunterDepuisReservation(reservationId)
        setReservations(await api.listReservations())
        setLivres(await api.listLivres())
        alert('Livre emprunté. Vérifiez votre page "Mes Emprunts"')
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Erreur')
      }
    })()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mes Réservations</h1>
        <p className="text-muted-foreground mt-2">
          {loading ? 'Chargement…' : 'Suivi de vos réservations de livres'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <AlertCircle className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservations.filter(r => r.statut === 'EN_ATTENTE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêt à récupérer</CardTitle>
            <BookOpen className="text-green-600" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reservations.filter(r => r.statut === 'PRET').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations list */}
      {reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {loading ? 'Chargement…' : "Vous n'avez aucune réservation pour le moment"}
            </p>
            <Link href="/adherent/catalogue">
              <Button className="bg-primary hover:bg-primary/90">
                Consulter le catalogue
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map(reservation => {
            const livre = livreById.get(reservation.livreId)
            const daysWaiting = getDaysWaiting(reservation.dateReservation)

            return (
              <Card key={reservation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {reservation.livreTitre}
                      </h3>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Auteur</span>
                          <p className="font-medium text-foreground">
                            {livre?.auteur || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground">Date réservation</span>
                          <p className="font-medium text-foreground">
                            {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground">En attente depuis</span>
                          <p className="font-medium text-foreground">
                            {daysWaiting} jour{daysWaiting > 1 ? 's' : ''}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground">Exemplaires dispo</span>
                          <p className={`font-medium ${livre && livre.exemplairesDisponibles > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {livre?.exemplairesDisponibles || 0}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded ${getStatutColor(reservation.statut)}`}>
                        {getStatutLabel(reservation.statut)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {reservation.statut === 'PRET' && (
                        <Button
                          onClick={() => handleBorrow(reservation.id)}
                          className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                        >
                          Emprunter
                        </Button>
                      )}
                      {reservation.statut !== 'ANNULEE' && (
                        <Button
                          onClick={() => handleCancel(reservation.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info box */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm">Comment fonctionnent les réservations?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Réservez un livre indisponible et nous vous notifierons quand il sera disponible
          </p>
          <p>
            • Vous aurez 2 jours pour récupérer le livre après notification
          </p>
          <p>
            • Vous pouvez annuler votre réservation à tout moment
          </p>
          <p>
            • Les réservations sont gratuites et sans engagement
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
