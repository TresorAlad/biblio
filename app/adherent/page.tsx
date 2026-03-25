'use client'

import { useAuth } from '@/app/auth-context'
import { api } from '@/lib/api'
import type { Emprunt, Reservation, Livre, Amende } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Book, BookOpen, AlertCircle, CheckCircle, ArrowRight, Zap, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function AdherentDashboard() {
  const { user } = useAuth()

  if (!user) return null

  const [emprunts, setEmprunts] = useState<Emprunt[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [livres, setLivres] = useState<Livre[]>([])
  const [amendes, setAmendes] = useState<Amende[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [e, r, l, p] = await Promise.all([
          api.listEmprunts({ adherentId: user.id }),
          api.listReservations({ adherentId: user.id }),
          api.listLivres(),
          api.listAmendes({ adherentId: user.id }),
        ])
        if (cancelled) return
        setEmprunts(e)
        setReservations(r)
        setLivres(l)
        setAmendes(p)
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user.id])

  const stats = useMemo(() => [
    { 
      label: 'Livres Empruntés', 
      value: emprunts.filter(e => e.statut === 'ACTIF').length, 
      icon: <BookOpen />, 
      color: 'emerald',
      desc: 'En cours de lecture'
    },
    { 
      label: 'En Retard', 
      value: emprunts.filter(e => e.statut === 'RETARD').length, 
      icon: <AlertCircle />, 
      color: 'rose',
      desc: 'Action requise'
    },
    { 
      label: 'Réservations', 
      value: reservations.length, 
      icon: <CheckCircle />, 
      color: 'teal',
      desc: 'File d\'attente'
    },
    { 
      label: 'Nouveaux Livres', 
      value: livres.slice(0, 5).length, 
      icon: <Zap />, 
      color: 'blue',
      desc: 'À découvrir'
    },
  ], [emprunts, reservations, livres])

  const amendesImpayees = amendes.filter(a => a.statut === 'IMPAYEE')
  const fullName = `${user.prenom} ${user.nom}`.trim()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
      {/* Header with Background Accent */}
      <div className="relative group">
        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-700" />
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[11px] uppercase">
            <Sparkles size={14} className="fill-emerald-500/20" />
            <span>Votre Espace Personnel</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Bienvenue, <span className="text-emerald-500">{fullName}</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {loading ? 'Sincronisation de vos bibliothèques en cours...' : 'Gérez vos ressources académiques en toute simplicité.'}
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="border-border/40 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/60 backdrop-blur-sm overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3",
                  stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-600" :
                  stat.color === 'rose' ? "bg-rose-500/10 text-rose-600" :
                  stat.color === 'teal' ? "bg-teal-500/10 text-teal-600" :
                  "bg-blue-500/10 text-blue-600"
                )}>
                  {stat.icon}
                </div>
                {stat.value > 0 && (
                  <div className="text-3xl font-black tracking-tighter opacity-10 group-hover:opacity-20 transition-opacity">
                    {stat.value}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black tracking-tight mb-1">{stat.value}</div>
                <p className="text-xs font-bold text-foreground/80">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
              <div className={cn(
                "h-1 w-full mt-2",
                 stat.color === 'emerald' ? "bg-emerald-500/20" :
                 stat.color === 'rose' ? "bg-rose-500/20" :
                 stat.color === 'teal' ? "bg-teal-500/20" :
                 "bg-blue-500/20"
              )} />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Borrowings & Fines */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Fines Alert if any */}
          {amendesImpayees.length > 0 && (
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="p-1 rounded-3xl bg-gradient-to-r from-rose-500/20 via-rose-500/5 to-transparent border border-rose-500/20"
             >
                <div className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-rose-600 dark:text-rose-400">Attention: Amendes en attente</h4>
                      <p className="text-sm text-muted-foreground">{amendesImpayees.length} amende(s) sont en attente de paiement sur votre compte.</p>
                    </div>
                  </div>
                  <Link href="/adherent/mon-compte">
                    <Button variant="ghost" size="sm" className="text-rose-600 font-bold hover:bg-rose-500/10">
                      Régler <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </Link>
                </div>
             </motion.div>
          )}

          <Card className="border-border/40 shadow-xl shadow-emerald-500/5 bg-card/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-emerald-500/5">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black">Lectures en cours</CardTitle>
                  <CardDescription>Vos emprunts actuellement actifs dans la bibliothèque</CardDescription>
                </div>
                <BookOpen className="text-emerald-500 opacity-20" size={42} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {emprunts.filter(e => e.statut === 'ACTIF').length === 0 ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Book size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-lg">Votre étagère est vide</p>
                    <p className="text-sm text-muted-foreground">Il est temps de trouver votre prochaine aventure académique.</p>
                  </div>
                  <Link href="/adherent/catalogue">
                    <Button className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                      Explorer le catalogue
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {emprunts.filter(e => e.statut === 'ACTIF').map((emprunt, idx) => (
                    <div
                      key={emprunt.id}
                      className="p-6 flex items-center justify-between hover:bg-emerald-500/[0.02] transition-colors group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="hidden sm:flex w-12 h-16 bg-muted rounded-md shadow-sm items-center justify-center text-muted-foreground group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                          <Book size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-lg group-hover:text-emerald-600 transition-colors">{emprunt.livreTitre}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Zap size={10} className="text-amber-500 fill-amber-500" />
                              Dû le: {new Date(emprunt.dateRetourPrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            </span>
                             {emprunt.statut === 'RETARD' && (
                               <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">Retard</span>
                             )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-500/10 hover:text-emerald-600">
                        <ArrowRight size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Actions & Notifications */}
        <motion.div 
           initial={{ x: 20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="space-y-8"
        >
          {/* Quick Actions Card */}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.01] backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Ressources & Outils</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[
                { label: 'Catalogue', icon: <Book />, href: '/adherent/catalogue' },
                { label: 'Emprunts', icon: <BookOpen />, href: '/adherent/mes-emprunts' },
                { label: 'Réserves', icon: <CheckCircle />, href: '/adherent/reservations' },
                { label: 'Paramètres', icon: <User />, href: '/adherent/mon-compte' }
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <Button variant="outline" className="w-full h-auto py-5 flex-col gap-3 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/[0.03] transition-all hover:shadow-lg">
                    <div className="text-emerald-500">{action.icon}</div>
                    <span className="text-[11px] font-black uppercase tracking-wider">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-slate-900 dark:bg-card text-white border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            <CardHeader>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center mb-2">
                <Sparkles size={16} className="text-white" />
              </div>
              <CardTitle className="text-white">Projet v2.5</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">N'oubliez pas que vous pouvez désormais payer vos amendes directement depuis votre espace personnel via Stripe.</p>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl h-12">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
