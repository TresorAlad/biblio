'use client'

import { useAuth } from '@/app/auth-context'
import { api } from '@/lib/api'
import type { Emprunt } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, AlertCircle, CheckCircle, Calendar } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export default function MesEmpruntPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<'TOUS' | 'ACTIF' | 'RETARD' | 'RETOURNE'>('TOUS')
  const [emprunts, setEmprunts] = useState<Emprunt[]>([])
  const [loading, setLoading] = useState(true)
  
  if (!user) return null

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await api.listEmprunts()
        if (!cancelled) setEmprunts(data)
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

  const filtered = useMemo(() => {
    return emprunts.filter(e => {
      if (filter === 'TOUS') return true
      return e.statut === filter
    })
  }, [emprunts, filter])

  const stats = {
    total: emprunts.length,
    actifs: emprunts.filter(e => e.statut === 'ACTIF').length,
    retard: emprunts.filter(e => e.statut === 'RETARD').length,
    retournes: emprunts.filter(e => e.statut === 'RETOURNE').length,
  }

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

  const getDaysRemaining = (dateRetour: string) => {
    const today = new Date()
    const returnDate = new Date(dateRetour)
    const diffTime = returnDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-slideInDown">
        <h1 className="text-3xl font-bold text-foreground">Mes Emprunts</h1>
        <p className="text-muted-foreground mt-2">
          {loading ? 'Chargement…' : 'Suivi de vos emprunts et retours'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stagger-item animate-slideInUp hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="stagger-item animate-slideInUp hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="text-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.actifs}</div>
          </CardContent>
        </Card>

        <Card className={`stagger-item animate-slideInUp hover-lift ${stats.retard > 0 ? 'border-destructive' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertCircle className={stats.retard > 0 ? 'text-destructive' : 'text-muted-foreground'} size={20} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.retard > 0 ? 'text-destructive' : ''}`}>
              {stats.retard}
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item animate-slideInUp hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retournés</CardTitle>
            <CheckCircle className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retournes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap animate-fadeIn">
        {(['TOUS', 'ACTIF', 'RETARD', 'RETOURNE'] as const).map(f => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'default' : 'outline'}
            className={filter === f ? 'bg-primary hover:bg-primary/90' : ''}
            size="sm"
          >
            {f === 'TOUS' ? 'Tous' : f === 'ACTIF' ? 'Actifs' : f === 'RETARD' ? 'En retard' : 'Retournés'}
          </Button>
        ))}
      </div>

      {/* Emprunts list */}
      {filtered.length === 0 ? (
        <Card className="animate-scaleIn">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {loading
                ? 'Chargement…'
                : filter === 'TOUS'
                  ? "Vous n'avez aucun emprunt"
                  : `Aucun emprunt ${filter.toLowerCase()}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {filtered.map((emprunt, idx) => {
            const daysRemaining = getDaysRemaining(emprunt.dateRetourPrevue)
            const isOverdue = daysRemaining < 0

            return (
              <Card key={emprunt.id} className={`stagger-item animate-slideInUp transition-smooth hover-lift ${isOverdue && emprunt.statut === 'ACTIF' ? 'border-destructive' : ''}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {emprunt.livreTitre}
                      </h3>

                      {/* Dates and status */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Emprunté</span>
                          <p className="font-medium text-foreground">
                            {new Date(emprunt.dateEmprunt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground">Retour prévu</span>
                          <p className={`font-medium ${isOverdue && emprunt.statut === 'ACTIF' ? 'text-destructive' : 'text-foreground'}`}>
                            {new Date(emprunt.dateRetourPrevue).toLocaleDateString('fr-FR')}
                          </p>
                        </div>

                        {emprunt.dateRetourEffective && (
                          <div>
                            <span className="text-muted-foreground">Retourné</span>
                            <p className="font-medium text-foreground">
                              {new Date(emprunt.dateRetourEffective).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        )}

                        {emprunt.statut === 'ACTIF' && (
                          <div>
                            <span className="text-muted-foreground">Jours restants</span>
                            <p className={`font-medium ${isOverdue ? 'text-destructive' : 'text-primary'}`}>
                              {isOverdue ? `${Math.abs(daysRemaining)} jour(s) en retard` : `${daysRemaining} jour(s)`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded ${getStatutColor(emprunt.statut)}`}>
                        {getStatutLabel(emprunt.statut)}
                      </span>
                    </div>

                    {/* Action button */}
                    {emprunt.statut === 'ACTIF' && (
                      <Button
                        onClick={async () => {
                          try {
                            await api.retourEmprunt(emprunt.id)
                            setEmprunts(await api.listEmprunts())
                          } catch (e) {
                            alert(e instanceof Error ? e.message : 'Erreur')
                          }
                        }}
                        className="whitespace-nowrap transition-smooth hover-scale active:scale-95"
                        variant={isOverdue ? 'destructive' : 'outline'}
                      >
                        {isOverdue ? "Retourner d'urgence" : 'Retourner'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
