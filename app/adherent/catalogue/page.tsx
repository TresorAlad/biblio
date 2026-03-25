'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { Categorie, Livre } from '@/lib/types'
import { BookCard } from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, RotateCcw } from 'lucide-react'

export default function CataloguePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Categorie[]>([])
  const [livres, setLivres] = useState<Livre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [cats, books] = await Promise.all([api.listCategories(), api.listLivres()])
        if (cancelled) return
        setCategories(cats)
        setLivres(books)
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

  // Filter books
  const filteredLivres = useMemo(() => {
    return livres.filter(livre => {
      const matchSearch = 
        livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livre.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livre.isbn.includes(searchTerm)
      
      const matchCategory =
        !selectedCategoryId || categories.find(c => c.id === selectedCategoryId)?.nom === livre.categorie

      return matchSearch && matchCategory
    })
  }, [searchTerm, selectedCategoryId, livres, categories])

  const handleReset = () => {
    setSearchTerm('')
    setSelectedCategoryId(null)
  }

  const handleBorrow = async (livreId: string) => {
    try {
      await api.createEmprunt(livreId)
      // refresh books (stock)
      setLivres(await api.listLivres())
      alert(`Livre emprunté. Vérifiez votre page "Mes Emprunts"`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors de l’emprunt')
    }
  }

  const handleReserve = async (livreId: string) => {
    try {
      await api.createReservation(livreId)
      alert(`Livre réservé. Vous serez notifié quand il sera disponible.`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la réservation')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-slideInDown">
        <h1 className="text-3xl font-bold text-foreground">Catalogue</h1>
        <p className="text-muted-foreground mt-2">
          {loading ? 'Chargement du catalogue…' : `Explorez notre collection de ${livres.length} livres`}
        </p>
      </div>

      {/* Search and filters */}
      <Card className="animate-slideInUp hover-lift">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search size={20} />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="relative animate-fadeIn">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input
              placeholder="Chercher par titre, auteur ou ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-smooth focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category filters */}
          <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter size={16} />
              Catégorie
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedCategoryId(null)}
                variant={!selectedCategoryId ? 'default' : 'outline'}
                className={`transition-smooth hover-scale ${!selectedCategoryId ? 'bg-primary hover:bg-primary/90' : ''}`}
                size="sm"
              >
                Toutes
              </Button>
              {categories.map((category, idx) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                  className={`transition-smooth hover-scale stagger-item animate-scaleIn ${selectedCategoryId === category.id ? 'bg-primary hover:bg-primary/90' : ''}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  size="sm"
                >
                  {category.nom}
                </Button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          {(searchTerm || selectedCategoryId) && (
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={14} className="mr-1" />
              Réinitialiser
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredLivres.length === 0
          ? 'Aucun livre ne correspond à vos critères'
          : `${filteredLivres.length} livre${filteredLivres.length > 1 ? 's' : ''} trouvé${filteredLivres.length > 1 ? 's' : ''}`}
      </div>

      {/* Books grid */}
      {!loading && filteredLivres.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
          {filteredLivres.map((livre, idx) => (
            <div key={livre.id} className="stagger-item animate-scaleIn" style={{ animationDelay: `${idx * 0.05}s` }}>
              <BookCard
                livre={livre}
                onBorrow={() => handleBorrow(livre.id)}
                onReserve={() => handleReserve(livre.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredLivres.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Aucun résultat pour votre recherche</p>
          <Button
            onClick={handleReset}
            className="bg-primary hover:bg-primary/90"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  )
}
