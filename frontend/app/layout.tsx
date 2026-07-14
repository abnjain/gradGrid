import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GradGrid - Education ERP',
  description: 'Complete education management platform',
  generator: 'Next.js',
  authors: [{ name: 'GradGrid Team' }],
  keywords: 'education, erp, management, school',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
