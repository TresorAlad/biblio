'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Adherent } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, Eye, Pencil, Trash2, Search, Filter } from 'lucide-react'

export default function AdherentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [adherents, setAdherents] = useState<Adherent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await api.listAdherents()
        if (!cancelled) setAdherents(data)
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

  const filtered = adherents.filter(adherent => {
    const matchSearch = 
      `${adherent.prenom} ${adherent.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adherent.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Adhérents</h1>
          <p className="text-muted-foreground mt-2">
            {loading
              ? 'Chargement…'
              : `Gérez les adhérents de la bibliothèque (${adherents.length} total)`}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 gap-2 whitespace-nowrap"
        >
          <Plus size={18} />
          Ajouter Adhérent
        </Button>
      </div>

      {/* Add form modal */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un Nouvel Adhérent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium block mb-2">Nom</label>
                <Input placeholder="Nom complet" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Email</label>
                <Input placeholder="email@university.edu" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Type</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg">
                  <option>Étudiant</option>
                  <option>Enseignant</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Numéro de carte</label>
                <Input placeholder="2024-XXXXX" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-primary hover:bg-primary/90">
                Enregistrer
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
                placeholder="Rechercher par nom ou email..."
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

          {/* Filtres de type désactivés pour l’instant (non stockés en DB) */}
        </CardContent>
      </Card>

      {/* Members table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filtered.length === 0 ? 'Aucun adhérent' : `${filtered.length} adhérent(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun adhérent ne correspond à votre recherche
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-center py-3 px-4 font-semibold">Emprunts</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(adherent => (
                    <tr
                      key={adherent.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {adherent.prenom} {adherent.nom}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{adherent.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          {adherent.empruntsActifs}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                          >
                            <Pencil size={16} />
                          </Button>
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
