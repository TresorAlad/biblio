'use client'

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`animate-slideInDown ${className}`}>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  className?: string
}

export function StatsGrid({ children, className = '' }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  )
}

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ children, className = '', delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <div
      className={`stagger-item animate-slideInUp ${hover ? 'hover-lift' : ''} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

export function ListItemAnimated({ 
  children, 
  className = '', 
  index = 0,
  hover = true 
}: { 
  children: React.ReactNode
  className?: string
  index?: number
  hover?: boolean
}) {
  return (
    <div
      className={`stagger-item animate-slideInUp transition-smooth ${hover ? 'hover:shadow-md hover:bg-muted/50' : ''} ${className}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {children}
    </div>
  )
}
