 'use client'
 
 import { useEffect, useMemo, useState } from 'react'
 import { api } from '@/lib/api'
 import type { Emprunt, Livre, Adherent } from '@/lib/types'
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { BookOpen, Plus, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react'
 import { TableSkeleton } from '@/components/loading-skeleton'
 
 export default function EmpruntPage() {
   const [searchTerm, setSearchTerm] = useState('')
   const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIF' | 'RETARD' | 'RETOURNE'>('ALL')
   const [showForm, setShowForm] = useState(false)
   const [emprunts, setEmprunts] = useState<Emprunt[]>([])
   const [livres, setLivres] = useState<Livre[]>([])
   const [adherents, setAdherents] = useState<Adherent[]>([])
   const [loading, setLoading] = useState(true)
   const [submitting, setSubmitting] = useState(false)
 
   useEffect(() => {
     let cancelled = false
     ;(async () => {
       setLoading(true)
       try {
         const [e, l, a] = await Promise.all([
           api.listEmprunts(),
           api.listLivres(),
           api.listAdherents(),
         ])
         if (cancelled) return
         setEmprunts(e)
         setLivres(l)
         setAdherents(a)
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
 
   const stats = useMemo(
     () => ({
       total: emprunts.length,
       actifs: emprunts.filter(e => e.statut === 'ACTIF').length,
       retard: emprunts.filter(e => e.statut === 'RETARD').length,
       retournes: emprunts.filter(e => e.statut === 'RETOURNE').length,
     }),
     [emprunts],
   )
 
   const filtered = useMemo(
     () =>
       emprunts.filter(emprunt => {
         const matchSearch =
           emprunt.livreTitre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           emprunt.adherentId.toLowerCase().includes(searchTerm.toLowerCase())
 
         const matchStatus = filterStatus === 'ALL' || emprunt.statut === filterStatus
 
         return matchSearch && matchStatus
       }),
     [emprunts, searchTerm, filterStatus],
   )

   const getStatutColor = (statut: string) => {
     switch (statut) {
       case 'ACTIF':
         return 'bg-primary/10 text-primary'
       case 'RETARD':
         return 'bg-destructive/10 text-destructive'
       case 'RETOURNE':
         return 'bg-muted text-muted-foreground'
       default:
         return 'bg-muted text-muted-foreground'
     }
   }
 
   const getStatutLabel = (statut: string) => {
     switch (statut) {
       case 'ACTIF':
         return 'Actif'
       case 'RETARD':
         return 'En retard'
       case 'RETOURNE':
         return 'Retourné'
       default:
         return statut
     }
   }
 
   const handleRetour = async (empruntId: string) => {
     try {
       await api.retourEmprunt(empruntId)
       setEmprunts(await api.listEmprunts())
     } catch (error) {
       alert(error instanceof Error ? error.message : 'Erreur lors du retour')
     }
   }
 
   const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault()
     const formData = new FormData(event.currentTarget)
     const adherentId = formData.get('adherentId') as string
     const livreId = formData.get('livreId') as string
     const duree = Number(formData.get('duree') || 30)
 
     if (!adherentId || !livreId) {
       alert('Veuillez sélectionner un adhérent et un livre')
       return
     }
 
     try {
       setSubmitting(true)
       await api.createEmprunt(livreId, adherentId)
       setEmprunts(await api.listEmprunts())
       setShowForm(false)
     } catch (error) {
       alert(error instanceof Error ? error.message : 'Erreur lors de la création de l’emprunt')
     } finally {
       setSubmitting(false)
     }
   }
 
   return (
     <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Emprunts</h1>
          <p className="text-muted-foreground mt-2">
            {loading ? 'Chargement des emprunts…' : `Suivez et gérez les emprunts (${stats.total} total)`}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 gap-2 whitespace-nowrap"
        >
          <Plus size={18} />
          Créer Emprunt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? <TableSkeleton /> : <div className="text-2xl font-bold">{stats.total}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? <TableSkeleton /> : <div className="text-2xl font-bold">{stats.actifs}</div>}
          </CardContent>
        </Card>

        <Card className={stats.retard > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertCircle className={stats.retard > 0 ? 'text-destructive' : 'text-muted-foreground'} size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : (
              <div className={`text-2xl font-bold ${stats.retard > 0 ? 'text-destructive' : ''}`}>
                {stats.retard}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retournés</CardTitle>
            <CheckCircle className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? <TableSkeleton /> : <div className="text-2xl font-bold">{stats.retournes}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Nouvel Emprunt</CardTitle>
            <CardDescription>Sélectionnez un adhérent, un livre et la durée de l’emprunt.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="text-sm font-medium block mb-2">Adhérent</label>
                    <select
                      name="adherentId"
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Sélectionner un adhérent
                      </option>
                      {adherents.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.prenom} {a.nom} ({a.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Livre</label>
                    <select
                      name="livreId"
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Sélectionner un livre
                      </option>
                      {livres.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.titre} – {l.auteur}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Durée (jours)</label>
                    <Input name="duree" type="number" min={1} defaultValue={30} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={submitting}
                  >
                    {submitting ? 'Création…' : 'Créer'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

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
            {(['ALL', 'ACTIF', 'RETARD', 'RETOURNE'] as const).map(status => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? 'default' : 'outline'}
                className={filterStatus === status ? 'bg-primary hover:bg-primary/90' : ''}
                size="sm"
              >
                {status === 'ALL' ? 'Tous' : status === 'ACTIF' ? 'Actifs' : status === 'RETARD' ? 'En retard' : 'Retournés'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Borrowings table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading
              ? 'Chargement des emprunts…'
              : filtered.length === 0
                ? 'Aucun emprunt'
                : `${filtered.length} emprunt(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun emprunt ne correspond à votre recherche
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Livre</th>
                    <th className="text-left py-3 px-4 font-semibold">Adhérent</th>
                    <th className="text-center py-3 px-4 font-semibold">Emprunté le</th>
                    <th className="text-center py-3 px-4 font-semibold">Retour prévu</th>
                    <th className="text-center py-3 px-4 font-semibold">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emprunt => (
                    <tr
                      key={emprunt.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{emprunt.livreTitre}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{emprunt.adherentId}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">
                        {new Date(emprunt.dateEmprunt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">
                        {new Date(emprunt.dateRetourPrevue).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatutColor(
                            emprunt.statut,
                          )}`}
                        >
                          {getStatutLabel(emprunt.statut)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {emprunt.statut === 'ACTIF' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              onClick={() => handleRetour(emprunt.id)}
                            >
                              Retourner
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
