import type { Metadata } from 'next'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import SceneWrapper from '@/components/SceneWrapper'
import RocketTransition from '@/components/RocketTransition'
import MiniOrb from '@/components/MiniOrb'
import GestureController from '@/components/GestureController'

export const metadata: Metadata = {
  title: 'VANYX',
  description:
    'VANYX — A premium portfolio exploring the intersection of distributed systems, neural architectures, and smooth analytical motion.',
  keywords: ['VANYX', 'AI', 'portfolio', 'WebGL', 'Three.js', 'Next.js', 'full-stack'],
  authors: [{ name: 'VANYX' }],
  openGraph: {
    title: 'VANYX',
    description: 'VANYX — Calm. Analytical. Flying through deep space.',
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
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <SceneWrapper />
        <RocketTransition />
        <MiniOrb />
        <GestureController />
      </body>
    </html>
  )
}
