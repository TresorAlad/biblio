 'use client'
 
 import { useEffect, useMemo, useState } from 'react'
 import { api } from '@/lib/api'
 import type { Amende } from '@/lib/types'
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { AlertCircle, DollarSign, Plus, CheckCircle, Trash2, Search } from 'lucide-react'
 import { TableSkeleton } from '@/components/loading-skeleton'
 
 export default function AmendesPage() {
   const [searchTerm, setSearchTerm] = useState('')
   const [filterStatus, setFilterStatus] = useState<'ALL' | 'IMPAYEE' | 'PAYEE'>('ALL')
   const [showForm, setShowForm] = useState(false)
   const [amendes, setAmendes] = useState<Amende[]>([])
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
     let cancelled = false
     ;(async () => {
       setLoading(true)
       try {
         const data = await api.listAmendes()
         if (cancelled) return
         setAmendes(data)
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
       amendes.filter(amende => {
         const matchSearch =
           String(amende.empruntId).includes(searchTerm) ||
           amende.adherentId.toLowerCase().includes(searchTerm.toLowerCase())
 
         const matchStatus = filterStatus === 'ALL' || amende.statut === filterStatus
 
         return matchSearch && matchStatus
       }),
     [amendes, searchTerm, filterStatus],
   )
 
   const stats = useMemo(
     () => ({
       total: amendes.length,
       impayees: amendes.filter(a => a.statut === 'IMPAYEE').length,
       payees: amendes.filter(a => a.statut === 'PAYEE').length,
       montantTotal: amendes
         .filter(a => a.statut === 'IMPAYEE')
         .reduce((sum, a) => sum + a.montant, 0),
     }),
     [amendes],
   )

   const handlePayer = async (amendeId: string) => {
     try {
       await api.payerAmende(amendeId)
       setAmendes(await api.listAmendes())
     } catch (error) {
       alert(error instanceof Error ? error.message : 'Erreur lors du paiement')
     }
   }
 
   return (
     <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Amendes</h1>
          <p className="text-muted-foreground mt-2">
            {loading
              ? 'Chargement des amendes et pénalités…'
              : `Suivi des amendes et pénalités (${stats.total} total)`}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 gap-2 whitespace-nowrap"
        >
          <Plus size={18} />
          Ajouter Amende
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amendes</CardTitle>
            <AlertCircle className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? <TableSkeleton /> : <div className="text-2xl font-bold">{stats.total}</div>}
          </CardContent>
        </Card>

        <Card className={stats.impayees > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impayées</CardTitle>
            <AlertCircle className={stats.impayees > 0 ? 'text-destructive' : 'text-muted-foreground'} size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : (
              <div className={`text-2xl font-bold ${stats.impayees > 0 ? 'text-destructive' : ''}`}>
                {stats.impayees}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
            <CheckCircle className="text-green-600" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats.payees}</div>
            )}
          </CardContent>
        </Card>

        <Card className={stats.montantTotal > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className={stats.montantTotal > 0 ? 'text-destructive' : 'text-muted-foreground'} size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : (
              <div className={`text-2xl font-bold ${stats.montantTotal > 0 ? 'text-destructive' : ''}`}>
                {stats.montantTotal.toFixed(2)}€
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une Amende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium block mb-2">Adhérent</label>
                <Input placeholder="Sélectionner un adhérent" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Montant (€)</label>
                <Input type="number" placeholder="5.00" step="0.01" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-2">Raison</label>
                <Input placeholder="Ex: Retard de retour - 1984" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-primary hover:bg-primary/90">
                Créer
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Annuler
              </Button>
            </div>
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
                placeholder="Rechercher par raison ou adhérent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'IMPAYEE', 'PAYEE'] as const).map(status => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? 'default' : 'outline'}
                className={filterStatus === status ? 'bg-primary hover:bg-primary/90' : ''}
                size="sm"
              >
                {status === 'ALL' ? 'Tous' : status === 'IMPAYEE' ? 'Impayées' : 'Payées'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fines table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading
              ? 'Chargement des amendes…'
              : filtered.length === 0
                ? 'Aucune amende'
                : `${filtered.length} amende(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune amende ne correspond à votre recherche
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Adhérent</th>
                    <th className="text-left py-3 px-4 font-semibold">Emprunt</th>
                    <th className="text-center py-3 px-4 font-semibold">Montant</th>
                    <th className="text-center py-3 px-4 font-semibold">Date</th>
                    <th className="text-center py-3 px-4 font-semibold">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(amende => (
                    <tr
                      key={amende.id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        amende.statut === 'IMPAYEE' ? 'bg-destructive/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{amende.adherentId}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">Emprunt #{amende.empruntId}</td>
                      <td
                        className={`py-3 px-4 text-center font-bold ${
                          amende.statut === 'IMPAYEE' ? 'text-destructive' : 'text-foreground'
                        }`}
                      >
                        {amende.montant.toFixed(2)}€
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground text-xs">
                        {new Date(amende.dateCreation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            amende.statut === 'IMPAYEE'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {amende.statut === 'IMPAYEE' ? 'Impayée' : 'Payée'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {amende.statut === 'IMPAYEE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              onClick={() => handlePayer(amende.id)}
                            >
                              Marquer payé
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 size={16} />
                          </Button>
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
