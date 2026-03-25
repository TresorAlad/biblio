import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { PageTransition } from '@/components/page-transition'
import { Preloader } from '@/components/preloader'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from './auth-context'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const _outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'BibliO - Gestion de Bibliothèque Universitaire',
  description: 'Système de gestion de bibliothèque universitaire',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${_inter.variable} ${_outfit.variable}`}>
       <body className="font-sans antialiased bg-background text-foreground scroll-smooth">
        <AuthProvider>
          <Preloader />
          <PageTransition>
            {children}
          </PageTransition>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
