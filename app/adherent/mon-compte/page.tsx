 'use client'
 
 import { useAuth } from '@/app/auth-context'
 import { api } from '@/lib/api'
 import type { Amende } from '@/lib/types'
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { User, Mail, Phone, MapPin, AlertCircle, Edit2 } from 'lucide-react'
 import { useEffect, useMemo, useState } from 'react'
 
 export default function MonComptePage() {
   const { user } = useAuth()
   const [isEditing, setIsEditing] = useState(false)
   const [amendes, setAmendes] = useState<Amende[]>([])
   const [loadingAmendes, setLoadingAmendes] = useState(true)
 
   if (!user) return null
 
   useEffect(() => {
     let cancelled = false
     ;(async () => {
       setLoadingAmendes(true)
       try {
         const data = await api.listAmendes({ adherentId: user.id })
         if (cancelled) return
         setAmendes(data)
       } catch (error) {
         console.error(error)
       } finally {
         if (!cancelled) setLoadingAmendes(false)
       }
     })()
     return () => {
       cancelled = true
     }
   }, [user.id])
 
   const amendesImpayees = useMemo(
     () => amendes.filter(a => a.statut === 'IMPAYEE'),
     [amendes],
   )
   const montantTotal = useMemo(
     () => amendesImpayees.reduce((sum, a) => sum + a.montant, 0),
     [amendesImpayees],
   )
   const fullName = `${user.prenom} ${user.nom}`.trim()
 
   const [formData, setFormData] = useState({
     name: fullName,
     email: user.email,
     phone: '+33 6 12 34 56 78',
     address: '123 Rue de la Paix, Paris, 75000',
   })

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target
     setFormData(prev => ({ ...prev, [name]: value }))
   }
 
   const handleSave = () => {
     setIsEditing(false)
     alert('Profil mis à jour avec succès (mock côté client uniquement)')
   }
 
   return (
     <div className="p-6 space-y-6">
       {/* Header */}
       <div>
         <h1 className="text-3xl font-bold text-foreground">Mon Compte</h1>
         <p className="text-muted-foreground mt-2">Gérez votre profil et vos paramètres</p>
       </div>

      {/* Profile information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>Vos données de compte</CardDescription>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit2 size={16} />
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <User size={16} />
                Nom
              </label>
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Mail size={16} />
                Email
              </label>
              {isEditing ? (
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Phone size={16} />
                Téléphone
              </label>
              {isEditing ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <MapPin size={16} />
                Adresse
              </label>
              {isEditing ? (
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                <p className="text-foreground font-medium">{formData.address}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 w-full"
            >
              Enregistrer les modifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Card information */}
      <Card>
        <CardHeader>
          <CardTitle>Carte d\'Adhérent</CardTitle>
          <CardDescription>Vos identifiants d\'adhésion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">Numéro de Carte</p>
                <p className="text-2xl font-mono font-bold text-primary">2024-000{user.id.slice(0, 4)}</p>
            <div className="flex justify-between mt-4 pt-4 border-t border-primary/20">
              <div>
                <p className="text-xs text-muted-foreground">Titulaire</p>
                <p className="font-medium text-foreground">{fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valide jusqu\'au</p>
                <p className="font-medium text-foreground">12/2026</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fines and fees */}
      {amendes.length > 0 && (
        <Card className={amendesImpayees.length > 0 ? 'border-destructive' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={20} className={amendesImpayees.length > 0 ? 'text-destructive' : 'text-muted-foreground'} />
              Amendes et Pénalités
            </CardTitle>
            <CardDescription>
              {loadingAmendes
                ? 'Chargement des amendes…'
                : amendesImpayees.length === 0
                  ? 'Aucune amende en attente'
                  : `${amendesImpayees.length} amende(s) à régler`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {amendes.length > 0 && (
              <div className="space-y-3">
                {amendes.map(amende => (
                  <div
                    key={amende.id}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      amende.statut === 'IMPAYEE'
                        ? 'bg-destructive/10 border border-destructive/20'
                        : 'bg-muted'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Pénalité de retard (emprunt #{amende.empruntId})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(amende.dateCreation).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${amende.statut === 'IMPAYEE' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {amende.montant}€
                      </p>
                      <p className={`text-xs ${amende.statut === 'IMPAYEE' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {amende.statut === 'IMPAYEE' ? 'À payer' : 'Payé'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {amendesImpayees.length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">Total à payer:</span>
                  <span className="text-2xl font-bold text-destructive">{montantTotal.toFixed(2)}€</span>
                </div>
                <Button className="w-full bg-destructive hover:bg-destructive/90">
                  Régler les amendes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du Compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Changer le mot de passe
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Notifications par email
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Préférences de confidentialité
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
