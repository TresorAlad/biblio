 'use client'
 
 import { useEffect, useMemo, useState } from 'react'
 import { api } from '@/lib/api'
 import type { Livre, Emprunt, Amende } from '@/lib/types'
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { BarChart3, Download, TrendingUp, BookOpen, AlertCircle } from 'lucide-react'
 import { CardSkeleton } from '@/components/loading-skeleton'
 
 export default function RapportsPage() {
   const [livres, setLivres] = useState<Livre[]>([])
   const [emprunts, setEmprunts] = useState<Emprunt[]>([])
   const [amendes, setAmendes] = useState<Amende[]>([])
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
     let cancelled = false
     ;(async () => {
       setLoading(true)
       try {
         const [l, e, a] = await Promise.all([api.listLivres(), api.listEmprunts(), api.listAmendes()])
         if (cancelled) return
         setLivres(l)
         setEmprunts(e)
         setAmendes(a)
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
 
   const livresDisponibles = useMemo(
     () => livres.filter(l => l.exemplairesDisponibles > 0).length,
     [livres],
   )
   const empruntActifs = useMemo(
     () => emprunts.filter(e => e.statut === 'ACTIF').length,
     [emprunts],
   )
   const empruntRetard = useMemo(
     () => emprunts.filter(e => e.statut === 'RETARD').length,
     [emprunts],
   )
   const amendesImpayees = useMemo(
     () => amendes.filter(a => a.statut === 'IMPAYEE').length,
     [amendes],
   )
   const montantAmendes = useMemo(
     () => amendes.filter(a => a.statut === 'IMPAYEE').reduce((sum, a) => sum + a.montant, 0),
     [amendes],
   )
 
   const downloadReport = (format: 'pdf' | 'csv' | 'excel') => {
     alert(`Rapport ${format.toUpperCase()} (mock) généré côté client.`)
   }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rapports et Statistiques</h1>
        <p className="text-muted-foreground mt-2">
          Analysez l'activité de votre bibliothèque
        </p>
      </div>

      {/* Download options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Télécharger les rapports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => downloadReport('pdf')}
              variant="outline"
              className="h-auto p-4 flex-col"
            >
              <BarChart3 className="mb-2" size={24} />
              <span className="text-sm font-medium">Rapport PDF</span>
              <span className="text-xs text-muted-foreground">Complet et formaté</span>
            </Button>
            <Button
              onClick={() => downloadReport('csv')}
              variant="outline"
              className="h-auto p-4 flex-col"
            >
              <TrendingUp className="mb-2" size={24} />
              <span className="text-sm font-medium">Export CSV</span>
              <span className="text-xs text-muted-foreground">Pour tableur</span>
            </Button>
            <Button
              onClick={() => downloadReport('excel')}
              variant="outline"
              className="h-auto p-4 flex-col"
            >
              <BookOpen className="mb-2" size={24} />
              <span className="text-sm font-medium">Excel</span>
              <span className="text-xs text-muted-foreground">Format Microsoft</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Métriques Clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Circulation</CardTitle>
              <TrendingUp className="text-primary" size={20} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <CardSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {livres.length === 0
                      ? '0%'
                      : `${Math.round((empruntActifs / livres.length) * 100)}%`}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {empruntActifs} livres empruntés sur {livres.length}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
              <BookOpen className="text-primary" size={20} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <CardSkeleton />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {livres.length === 0
                      ? '0%'
                      : `${Math.round((livresDisponibles / livres.length) * 100)}%`}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {livresDisponibles} livres disponibles
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className={empruntRetard > 0 ? 'border-destructive' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retards</CardTitle>
              <AlertCircle className={empruntRetard > 0 ? 'text-destructive' : 'text-muted-foreground'} size={20} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <CardSkeleton />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${empruntRetard > 0 ? 'text-destructive' : ''}`}>
                    {empruntRetard}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Emprunts en retard
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity report */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Générale</CardTitle>
          <CardDescription>Résumé de l'activité du mois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Total Livres</p>
                <p className="text-2xl font-bold text-foreground">{livres.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Emprunts Actifs</p>
                <p className="text-2xl font-bold text-primary">{empruntActifs}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Emprunts Retournés</p>
                <p className="text-2xl font-bold text-foreground">
                  {emprunts.filter(e => e.statut === 'RETOURNE').length}
                </p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Amendes</p>
                <p className="text-2xl font-bold text-destructive">{amendesImpayees}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories report */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution par Catégorie</CardTitle>
          <CardDescription>Nombre de livres par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="space-y-3">
              {Array.from(new Set(livres.map(l => l.categorie))).map(categorie => {
                const count = livres.filter(l => l.categorie === categorie).length
                const percentage = (count / livres.length) * 100

                return (
                  <div key={categorie}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{categorie}</span>
                      <span className="text-sm text-muted-foreground">{count} livres</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial report */}
      <Card className={amendesImpayees > 0 ? 'border-destructive' : ''}>
        <CardHeader>
          <CardTitle>Rapport Financier</CardTitle>
          <CardDescription>Amendes et pénalités</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Amendes Impayées</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-destructive">{amendesImpayees}</p>
                    <p className="text-sm text-muted-foreground mt-1">dossiers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-destructive">
                      {montantAmendes.toFixed(2)}€
                    </p>
                    <p className="text-xs text-muted-foreground">à recouvrer</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Amendes Payées</p>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {amendes.filter(a => a.statut === 'PAYEE').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {amendes
                      .filter(a => a.statut === 'PAYEE')
                      .reduce((s, a) => s + a.montant, 0)
                      .toFixed(2)}
                    € collectés
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {empruntRetard > 0 && (
              <li className="flex gap-3 p-3 bg-destructive/10 rounded-lg text-sm">
                <AlertCircle className="text-destructive flex-shrink-0" size={18} />
                <span>
                  Il y a <strong>{empruntRetard}</strong> emprunt(s) en retard. Pensez à envoyer des rappels.
                </span>
              </li>
            )}
            {amendesImpayees > 0 && (
              <li className="flex gap-3 p-3 bg-destructive/10 rounded-lg text-sm">
                <AlertCircle className="text-destructive flex-shrink-0" size={18} />
                <span>
                  <strong>{amendesImpayees}</strong> amende(s) impayée(s) pour un montant de <strong>{montantAmendes}€</strong>.
                </span>
              </li>
            )}
            {livresDisponibles < 5 && (
              <li className="flex gap-3 p-3 bg-primary/10 rounded-lg text-sm">
                <TrendingUp className="text-primary flex-shrink-0" size={18} />
                <span>
                  Le stock de livres disponibles est faible. Pensez à évaluer l'acquisition de nouveaux exemplaires.
                </span>
              </li>
            )}
            {empruntRetard === 0 && amendesImpayees === 0 && (
              <li className="flex gap-3 p-3 bg-green-100 rounded-lg text-sm">
                <span className="text-green-700">✓ Tout est en ordre ! La gestion de votre bibliothèque fonctionne bien.</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
