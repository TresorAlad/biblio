'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import type { UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Book, Mail, Lock, User, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  const router = useRouter()
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADHERENT')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!formData.email || !formData.password) {
        alert('Veuillez remplir tous les champs')
        return
      }
      const u = await login(formData.email, formData.password)
      router.push(u.role === 'ADHERENT' ? '/adherent' : '/bibliothecaire')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!formData.name || !formData.email || !formData.password) {
        alert('Veuillez remplir tous les champs')
        return
      }
      await register(formData.name, formData.email, formData.password, selectedRole)
      router.push(selectedRole === 'ADHERENT' ? '/adherent' : '/bibliothecaire')
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-emerald-950 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        
        <Link href="/" className="flex items-center gap-3 relative z-10 group w-fit">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
            <Book className="text-white" size={26} />
          </div>
          <span className="text-3xl font-black tracking-tighter">BibliO</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={12} />
               Session Universitaire 2024
            </div>
            <h2 className="text-6xl font-black tracking-tighter leading-none">
              L'excellence <br/> académique <br/> commence ici.
            </h2>
            <p className="text-emerald-100/70 text-lg max-w-md leading-relaxed">
              Rejoignez une communauté de chercheurs et accédez à des millions de ressources numériques et physiques.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div>
              <p className="text-3xl font-black text-emerald-500">2.5M+</p>
              <p className="text-sm text-emerald-100/50 font-medium">Ouvrages indexés</p>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-500">45k+</p>
              <p className="text-sm text-emerald-100/50 font-medium">Utilisateurs actifs</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-emerald-100/40">
           <ShieldCheck size={16} />
           Authentification sécurisée par protocole SSL/AES-256
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex items-center justify-center p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left space-y-2"
          >
            <h3 className="text-3xl font-black tracking-tight text-foreground">
              {isLogin ? 'Bon retour parmi nous' : 'Compte Universitaire'}
            </h3>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Entrez vos identifiants pour accéder à votre bibliothèque.' 
                : 'Commencez votre voyage académique avec BibliO.'}
            </p>
          </motion.div>

          <Card className="border-border/40 shadow-2xl shadow-emerald-500/5 bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
                
                {/* Role Switcher (Registration only) */}
                {!isLogin && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type de Profil</label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-2xl border border-border/40">
                      {(['ADHERENT', 'BIBLIOTHECAIRE'] as UserRole[]).map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={cn(
                            'py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300',
                            selectedRole === role
                              ? 'bg-card text-emerald-600 shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {role === 'ADHERENT' ? 'Étudiant' : 'Staff'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom complet</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" size={18} />
                          <Input
                            name="name"
                            placeholder="ex: Jean Dupont"
                            className="pl-12 h-14 rounded-2xl border-border/60 bg-background/50 focus-visible:ring-emerald-500 transition-all shadow-sm"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                       </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <Input
                        name="email"
                        type="email"
                        placeholder="vous@university.edu"
                        className="pl-12 h-14 rounded-2xl border-border/60 bg-background/50 focus-visible:ring-emerald-500 transition-all shadow-sm"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mot de passe</label>
                      {isLogin && <button type="button" className="text-[10px] text-emerald-600 font-bold hover:underline">Oublié?</button>}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <Input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-12 h-14 rounded-2xl border-border/60 bg-background/50 focus-visible:ring-emerald-500 transition-all shadow-sm"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-500/20 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Authentification...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isLogin ? 'Se connecter' : 'Créer un compte'}
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-border/40 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  {isLogin ? "Vous n'avez pas encore de compte? " : "Vous avez déjà un accès? "}
                  <span className="text-emerald-600 font-bold group-hover:underline">{isLogin ? "S'inscrire" : "Connexion"}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Test Accounts Mini-Info */}
          <div className="p-6 rounded-3xl bg-muted/30 border border-border/20 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                   <Zap size={16} />
                </div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Version Démo Active</div>
             </div>
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-emerald-300" />
                <div className="w-2 h-2 rounded-full bg-emerald-200" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
