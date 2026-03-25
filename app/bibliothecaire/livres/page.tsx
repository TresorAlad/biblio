'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Livre } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Book, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react'

export default function LivresPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [livres, setLivres] = useState<Livre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await api.listLivres()
        if (!cancelled) setLivres(data)
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

  const filtered = livres.filter(livre =>
    livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    livre.auteur.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    // TODO: brancher sur DELETE /livres/:id quand tu seras prêt
    alert('Suppression réelle à brancher sur l’API (DELETE /livres/:id)')
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingId(null)
    alert('Formulaire visuel prêt. La sauvegarde complète côté API est à implémenter.')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion du Catalogue</h1>
          <p className="text-muted-foreground mt-2">
            {loading
              ? 'Chargement…'
              : `Gérez les livres de la bibliothèque (${livres.length} total)`}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90 gap-2 whitespace-nowrap"
        >
          <Plus size={18} />
          Ajouter un Livre
        </Button>
      </div>

      {/* Add/Edit form */}
      {(showForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Modifier le Livre' : 'Ajouter un Nouveau Livre'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium block mb-2">Titre</label>
                <Input placeholder="Titre du livre" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Auteur</label>
                <Input placeholder="Auteur" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">ISBN</label>
                <Input placeholder="ISBN" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Catégorie</label>
                <Input placeholder="Catégorie" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Année de publication</label>
                <Input type="number" placeholder="2024" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Exemplaires total</label>
                <Input type="number" placeholder="5" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-2">Description</label>
                <textarea
                  placeholder="Description du livre"
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
              >
                Enregistrer
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
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
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher par titre ou auteur..."
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
        </CardContent>
      </Card>

      {/* Books table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filtered.length === 0 ? 'Aucun livre' : `${filtered.length} livre(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun livre ne correspond à votre recherche
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Titre</th>
                    <th className="text-left py-3 px-4 font-semibold">Auteur</th>
                    <th className="text-left py-3 px-4 font-semibold">Catégorie</th>
                    <th className="text-center py-3 px-4 font-semibold">Disponibles</th>
                    <th className="text-center py-3 px-4 font-semibold">Total</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(livre => (
                    <tr
                      key={livre.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{livre.titre}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{livre.auteur}</td>
                      <td className="py-3 px-4 text-muted-foreground">{livre.categorie}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          livre.exemplairesDisponibles > 0
                            ? 'bg-primary/10 text-primary'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {livre.exemplairesDisponibles}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {livre.exemplairesTotal}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => handleEdit(livre.id)}
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            onClick={() => handleDelete(livre.id)}
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
