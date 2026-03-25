'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Sidebar } from '@/components/sidebar'

export default function BibliothécaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    } else if (user.role !== 'BIBLIOTHECAIRE') {
      router.push('/adherent')
    }
  }, [user, router])

  if (!user || user.role !== 'BIBLIOTHECAIRE') {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 lg:pl-64">
        {children}
      </main>
    </div>
  )
}
