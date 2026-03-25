'use client'

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-muted rounded-lg animate-shimmer" />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="h-64 bg-muted rounded-lg animate-shimmer" />
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded-lg animate-shimmer" />
      ))}
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse-subtle">Chargement...</p>
    </div>
  )
}
