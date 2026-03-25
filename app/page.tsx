'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/app/auth-context'
import { Button } from '@/components/ui/button'
import { Book, Users, Zap, CheckCircle2, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push(user.role === 'ADHERENT' ? '/adherent' : '/bibliothecaire')
    }
  }, [user, router])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)]" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] -z-10 rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] -z-10 rounded-full bg-teal-500/5 blur-[100px] animate-pulse" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Book className="text-white" size={22} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Bibli<span className="text-emerald-500">O</span>
            </h1>
          </motion.div>
          
          <motion.div
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
          >
            <Link href="/auth">
              <Button className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-emerald-500/20 transition-all font-medium">
                Se connecter
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          className="text-center space-y-8 mb-24"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-2">
            <Zap size={14} className="fill-current" />
            <span>Nouveau: Interface Ultra-Rapide</span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            Gérez votre savoir <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">avec élégance</span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            La solution de gestion de bibliothèque universitaire la plus intuitive. 
            Découvrez une plateforme pensée pour les passionnés du savoir.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 gap-2 h-14 text-base font-semibold shadow-lg shadow-emerald-500/20 group">
                Commencer maintenant
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base hover:bg-secondary transition-colors border-border/60">
              Voir la démo
            </Button>
          </motion.div>
        </motion.div>

        {/* Features grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {[ 
            { icon: <Book />, title: "Catalogue Premium", desc: "Explorez des milliers d'ouvrages avec une recherche fulgurante." },
            { icon: <ShieldCheck />, title: "Sécurité Totale", desc: "Vos transactions et données sont protégées par un cryptage robuste." },
            { icon: <Zap />, title: "Fluidité Maximale", desc: "Réservations en un clic et notifications intelligentes." }
          ].map((f, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              className="bg-card hover:bg-card/80 p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
            >
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <div className="text-emerald-600">{f.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Roles details */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold flex items-center gap-3">
              <GraduationCap className="text-emerald-500" size={32} />
              Côté Adhérent
            </h3>
            <p className="text-muted-foreground text-lg">
              Une expérience fluide pour les étudiants et chercheurs. 
              Accédez à vos ressources n'importe où, n'importe quand.
            </p>
            <div className="space-y-4">
              {["Catalogue interactif", "Suivi des emprunts", "Amendes payables en ligne", "Notifications de retour"].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-emerald-900/5 dark:bg-emerald-500/10 rounded-[3rem] p-12 border border-emerald-500/10 relative"
          >
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
             <h3 className="text-3xl font-bold mb-8">Espace Staff</h3>
             <p className="text-muted-foreground mb-8">Gérez toute la bibliothèque à partir d'un tableau de bord centralisé et intelligent.</p>
             <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-emerald-600 font-bold group">
                Découvrir l'espace pro
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </Button>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-12 mt-20 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Book size={20} className="text-emerald-500" />
            <span className="font-bold">BibliO v2.0</span>
          </div>
          <p className="text-muted-foreground text-sm">&copy; 2024 BibliO Group. Elevating knowledge through design.</p>
        </div>
      </footer>
    </div>
  )
}
