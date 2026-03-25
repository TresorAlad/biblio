 'use client'
 
 import { useEffect, useMemo, useState } from 'react'
 import { api } from '@/lib/api'
 import type { Reservation } from '@/lib/types'
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { AlertCircle, CheckCircle, X, Search, Filter } from 'lucide-react'
 import { TableSkeleton } from '@/components/loading-skeleton'
 
 export default function ReservationsPage() {
   const [searchTerm, setSearchTerm] = useState('')
   const [filterStatus, setFilterStatus] = useState<'ALL' | 'EN_ATTENTE' | 'PRET' | 'ANNULEE'>('ALL')
   const [reservations, setReservations] = useState<Reservation[]>([])
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
     let cancelled = false
     ;(async () => {
       setLoading(true)
       try {
         const r = await api.listReservations()
         if (cancelled) return
         setReservations(r)
       } catch (error) {
         console.error(error)
       } finally {
         if (!cancelled) setLoading(false)
       }
     })()
     return () => {
       cancelled = true
     }
   }, [])
 
   const filtered = useMemo(
     () =>
       reservations.filter(reservation => {
         const matchSearch =
           reservation.livreTitre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           reservation.adherentId.toLowerCase().includes(searchTerm.toLowerCase())
 
         const matchStatus = filterStatus === 'ALL' || reservation.statut === filterStatus
 
         return matchSearch && matchStatus
       }),
     [reservations, searchTerm, filterStatus],
   )
 
   const stats = useMemo(
     () => ({
       total: reservations.length,
       enAttente: reservations.filter(r => r.statut === 'EN_ATTENTE').length,
       pret: reservations.filter(r => r.statut === 'PRET').length,
       annulee: reservations.filter(r => r.statut === 'ANNULEE').length,
     }),
     [reservations],
   )

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
 
   const handleAnnuler = async (reservationId: string) => {
     try {
       await api.annulerReservation(reservationId)
       setReservations(await api.listReservations())
     } catch (error) {
       alert(error instanceof Error ? error.message : 'Erreur lors de l’annulation')
     }
   }
 
   const handleNotifier = async (reservationId: string) => {
     try {
       await api.notifierReservation(reservationId)
       setReservations(await api.listReservations())
     } catch (error) {
       alert(error instanceof Error ? error.message : 'Erreur lors de la notification')
     }
   }
 
   const handleEmprunter = async (reservationId: string) => {
     try {
       await api.emprunterDepuisReservation(reservationId)
       setReservations(await api.listReservations())
       alert('Livre emprunté depuis la réservation.')
     } catch (error) {
       alert(error instanceof Error ? error.message : 'Erreur lors de la conversion en emprunt')
     }
   }
 
   return (
     <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des Réservations</h1>
        <p className="text-muted-foreground mt-2">
          {loading
            ? 'Chargement des réservations…'
            : `Gérez les réservations des adhérents (${stats.total} total)`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertCircle className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? <TableSkeleton /> : <div className="text-2xl font-bold">{stats.total}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <AlertCircle className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? <TableSkeleton /> : <div className="text-2xl font-bold">{stats.enAttente}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts</CardTitle>
            <CheckCircle className="text-green-600" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats.pret}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulées</CardTitle>
            <X className="text-destructive" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : (
              <div className="text-2xl font-bold text-destructive">{stats.annulee}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher par titre ou adhérent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter size={18} />
              Filtres
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'EN_ATTENTE', 'PRET', 'ANNULEE'] as const).map(status => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? 'default' : 'outline'}
                className={filterStatus === status ? 'bg-primary hover:bg-primary/90' : ''}
                size="sm"
              >
                {status === 'ALL' ? 'Tous' : status === 'EN_ATTENTE' ? 'En attente' : status === 'PRET' ? 'Prêts' : 'Annulées'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reservations table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading
              ? 'Chargement des réservations…'
              : filtered.length === 0
                ? 'Aucune réservation'
                : `${filtered.length} réservation(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune réservation ne correspond à votre recherche
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Livre</th>
                    <th className="text-left py-3 px-4 font-semibold">Adhérent</th>
                    <th className="text-center py-3 px-4 font-semibold">Date réservation</th>
                    <th className="text-center py-3 px-4 font-semibold">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(reservation => (
                    <tr
                      key={reservation.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{reservation.livreTitre}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{reservation.adherentId}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">
                        {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatutColor(
                            reservation.statut,
                          )}`}
                        >
                          {getStatutLabel(reservation.statut)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {reservation.statut === 'EN_ATTENTE' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                onClick={() => handleNotifier(reservation.id)}
                              >
                                Notifier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => handleAnnuler(reservation.id)}
                              >
                                Annuler
                              </Button>
                            </>
                          )}
                          {reservation.statut === 'PRET' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleEmprunter(reservation.id)}
                            >
                              Emprunter
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
