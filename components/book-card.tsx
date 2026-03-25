'use client'

import type { Livre } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Book, BookOpen, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface BookCardProps {
  livre: Livre
  onBorrow?: () => void
  onReserve?: () => void
}

export function BookCard({ livre, onBorrow, onReserve }: BookCardProps) {
  const isAvailable = livre.exemplairesDisponibles > 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-smooth hover-lift h-full flex flex-col">
      {/* Book image placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b border-border hover:from-primary/30 hover:to-primary/10 transition-colors">
        <Book className="text-primary/40 group-hover:animate-bounce-soft" size={48} />
      </div>

      <CardContent className="flex flex-col flex-1 p-4 space-y-3">
        {/* Title and author */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2">{livre.titre}</h3>
          <p className="text-sm text-muted-foreground">{livre.auteur}</p>
        </div>

        {/* Category and year */}
        <div className="flex items-center justify-between text-xs">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
            {livre.categorie}
          </span>
          <span className="text-muted-foreground">{livre.anneePublication}</span>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <>
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-xs text-primary font-medium">
                {livre.exemplairesDisponibles} disponible{livre.exemplairesDisponibles > 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="text-destructive" size={16} />
              <span className="text-xs text-destructive font-medium">Indisponible</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 mt-auto">
          {isAvailable ? (
            <>
              <Button
                onClick={onBorrow}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs transition-smooth hover-scale active:scale-95"
              >
                <BookOpen size={14} className="mr-1" />
                Emprunter
              </Button>
              <Button
                onClick={onReserve}
                variant="outline"
                className="flex-1 h-8 text-xs transition-smooth hover-scale active:scale-95"
              >
                Réserver
              </Button>
            </>
          ) : (
            <Button
              onClick={onReserve}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs transition-smooth hover-scale active:scale-95"
            >
              <AlertCircle size={14} className="mr-1" />
              Réserver
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
