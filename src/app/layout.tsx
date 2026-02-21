import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Superintelligence Anti-Gravity Lab',
  description:
    'A recruiter-friendly portfolio presented as a calm, intelligent AI system floating in deep space.',
  keywords: ['AI', 'portfolio', 'WebGL', 'Three.js', 'Next.js', 'full-stack'],
  authors: [{ name: 'Anti-Gravity Lab' }],
  openGraph: {
    title: 'AI Superintelligence Anti-Gravity Lab',
    description: 'Calm. Analytical. Flying through deep space.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
