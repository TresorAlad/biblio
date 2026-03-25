 'use client'
 
 import { useAuth } from '@/app/auth-context'
 import { api } from '@/lib/api'
 import type { Livre, Emprunt, Amende, Adherent } from '@/lib/types'
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Book, Users, BookOpen, AlertCircle, TrendingUp } from 'lucide-react'
 import Link from 'next/link'
 import { useEffect, useMemo, useState } from 'react'
 import { CardSkeleton } from '@/components/loading-skeleton'
 
 export default function BibliothécaireDashboard() {
   const { user } = useAuth()
 
   const [livres, setLivres] = useState<Livre[]>([])
   const [emprunts, setEmprunts] = useState<Emprunt[]>([])
   const [amendes, setAmendes] = useState<Amende[]>([])
   const [adherents, setAdherents] = useState<Adherent[]>([])
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
     let cancelled = false
     ;(async () => {
       setLoading(true)
       try {
         const [l, e, p, a] = await Promise.all([
           api.listLivres(),
           api.listEmprunts(),
           api.listAmendes(),
           api.listAdherents(),
         ])
         if (cancelled) return
         setLivres(l)
         setEmprunts(e)
         setAmendes(p)
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
 
   if (!user) return null
 
   const livresDisponibles = useMemo(
     () => livres.filter(l => l.exemplairesDisponibles > 0).length,
     [livres],
   )
   const empruntActifs = useMemo(
     () => emprunts.filter(e => e.statut === 'ACTIF').length,
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
   const fullName = `${user.prenom} ${user.nom}`.trim()
 
   const recentEmprunts = useMemo(
     () => emprunts.slice(0, 5),
     [emprunts],
   )
 
   return (
     <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Bibliothécaire</h1>
        <p className="text-muted-foreground mt-2">
          {loading ? 'Chargement des données de la bibliothèque…' : `Bienvenue, ${fullName}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total books */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catalogue Total</CardTitle>
            <Book className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="text-2xl font-bold">{livres.length}</div>
                <p className="text-xs text-muted-foreground">{livresDisponibles} disponibles</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active borrowings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emprunts Actifs</CardTitle>
            <BookOpen className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="text-2xl font-bold">{empruntActifs}</div>
                <p className="text-xs text-muted-foreground">En cours</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Unpaid fines */}
        <Card className={amendesImpayees > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amendes Impayées</CardTitle>
            <AlertCircle className={amendesImpayees > 0 ? 'text-destructive' : 'text-primary'} size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className={`text-2xl font-bold ${amendesImpayees > 0 ? 'text-destructive' : ''}`}>
                  {amendesImpayees}
                </div>
                <p className="text-xs text-muted-foreground">{montantAmendes.toFixed(2)}€ à recouvrer</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adhérents</CardTitle>
            <Users className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="text-2xl font-bold">{adherents.length}</div>
                <p className="text-xs text-muted-foreground">Inscrits</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick access cards */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion Rapide</CardTitle>
            <CardDescription>Accédez aux fonctions principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/bibliothecaire/livres" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Book className="mr-2" size={18} />
                Gérer le Catalogue
              </Button>
            </Link>
            <Link href="/bibliothecaire/adherents" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2" size={18} />
                Gérer les Adhérents
              </Button>
            </Link>
            <Link href="/bibliothecaire/emprunts" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2" size={18} />
                Gérer les Emprunts
              </Button>
            </Link>
            <Link href="/bibliothecaire/amendes" className="block">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="mr-2" size={18} />
                Amendes et Pénalités
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Statistics section */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Aperçu des activités</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taux de circulation</span>
                    <span className="font-semibold">
                      {livres.length === 0
                        ? '0%'
                        : `${Math.round((empruntActifs / livres.length) * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width:
                          livres.length === 0
                            ? '0%'
                            : `${(empruntActifs / livres.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Livres disponibles</span>
                    <span className="font-semibold">
                      {livresDisponibles}/{livres.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width:
                          livres.length === 0
                            ? '0%'
                            : `${(livresDisponibles / livres.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activities */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières Activités</CardTitle>
          <CardDescription>
            {loading
              ? 'Chargement des activités récentes…'
              : recentEmprunts.length === 0
                ? 'Aucune activité récente'
                : `${recentEmprunts.length} emprunt(s) récent(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="space-y-4">
              {recentEmprunts.map(emprunt => (
                <div
                  key={emprunt.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <BookOpen className="text-primary" size={18} />
                    <div>
                      <p className="font-medium text-foreground">{emprunt.livreTitre}</p>
                      <p className="text-xs text-muted-foreground">
                        Emprunt: {new Date(emprunt.dateEmprunt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      emprunt.statut === 'ACTIF'
                        ? 'bg-primary/10 text-primary'
                        : emprunt.statut === 'RETARD'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {emprunt.statut === 'ACTIF'
                      ? 'Actif'
                      : emprunt.statut === 'RETARD'
                      ? 'En retard'
                      : 'Retourné'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Link href="/bibliothecaire/livres" className="flex-1">
          <Button className="w-full bg-primary hover:bg-primary/90">
            <TrendingUp className="mr-2" size={18} />
            Ajouter un Livre
          </Button>
        </Link>
        <Link href="/bibliothecaire/adherents" className="flex-1">
          <Button variant="outline" className="w-full">
            Ajouter un Adhérent
          </Button>
        </Link>
      </div>
    </div>
  )
}
