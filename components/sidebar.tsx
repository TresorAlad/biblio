'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Button } from '@/components/ui/button'
import { 
  Home, Book, BookOpen, User, LogOut, BarChart3, Users, AlertCircle,
  Menu, X, Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const baseHref = user.role === 'ADHERENT' ? '/adherent' : '/bibliothecaire'

  const menuItems = user.role === 'ADHERENT' ? [
    { href: `${baseHref}`, label: 'Tableau de bord', icon: Home },
    { href: `${baseHref}/catalogue`, label: 'Le Catalogue', icon: Book },
    { href: `${baseHref}/mes-emprunts`, label: 'Mes Emprunts', icon: BookOpen },
    { href: `${baseHref}/reservations`, label: 'Mes Réservations', icon: AlertCircle },
    { href: `${baseHref}/mon-compte`, label: 'Profil & Compte', icon: User },
  ] : [
    { href: `${baseHref}`, label: 'Statistiques', icon: BarChart3 },
    { href: `${baseHref}/livres`, label: 'Inventaire Livres', icon: Book },
    { href: `${baseHref}/adherents`, label: 'Membres', icon: Users },
    { href: `${baseHref}/emprunts`, label: 'Gestion Flux', icon: BookOpen },
    { href: `${baseHref}/reservations`, label: 'File d\'attente', icon: AlertCircle },
    { href: `${baseHref}/amendes`, label: 'Pénalités', icon: AlertCircle },
    { href: `${baseHref}/rapports`, label: 'Performance', icon: BarChart3 },
  ]

  return (
    <>
      {/* Mobile Header Overlay */}
      <div className="lg:hidden fixed top-0 w-full z-40 glass border-b border-border/40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="text-emerald-500" size={24} />
          <span className="font-bold text-lg">BibliO</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {/* Sidebar container */}
        <motion.aside
          initial={false}
          animate={{ x: isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -320 }}
          className={cn(
            'fixed left-0 top-0 h-screen w-72 bg-card/80 backdrop-blur-xl border-r border-border/40 flex flex-col z-50 lg:translate-x-0 shadow-2xl lg:shadow-none'
          )}
        >
          {/* Header */}
          <div className="p-8 pb-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                <Book className="text-white" size={22} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Bibli<span className="text-emerald-500">O</span>
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== baseHref && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                      : 'text-muted-foreground hover:bg-emerald-500/5 hover:text-foreground'
                  )}
                >
                  <Icon size={20} className={cn('transition-transform duration-200', isActive ? 'scale-110' : 'group-hover:scale-110')} />
                  <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info and footer */}
          <div className="p-6 mt-auto border-t border-border/40 bg-emerald-500/[0.02]">
            <div className="mb-6 p-4 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold uppercase">
                  {user.nom[0]}{user.prenom[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate leading-none mb-1">{user.prenom} {user.nom}</p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-semibold">{user.role}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mb-1">{user.email}</p>
            </div>

            <Button
              onClick={() => logout()}
              variant="ghost"
              className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </Button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
