'use client'

export default function HomePage() {
  return (
    <main className="relative min-h-[500dvh] bg-black">
      {/* ── Fixed laboratory background UI ── */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Global Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,195,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,195,247,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

        {/* Corner HUD markers */}
        <div className="absolute top-10 left-10 text-label opacity-40">
          Core Status: Nominal<br />
          Stability: 99.8%
        </div>
        <div className="absolute bottom-10 right-10 text-label opacity-40 text-right">
          Antigravity Engine v2.4<br />
          ©2026 AI-Lab
        </div>
      </div>

      {/* ── Section 1: Hero ── */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center text-center px-6 z-20 pointer-events-none">
        <div className="max-w-4xl pointer-events-auto bg-black/10 backdrop-blur-[2px] p-8 rounded-3xl">
          <p className="text-label mb-6">Intelligence Core v0.1</p>
          <h1 className="text-display glow-cold mb-8 transition-colors duration-1000 tracking-[-0.05em]">
            AI Superintelligence<br />
            Anti-Gravity <span className="text-blue-500">Lab</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200/40 max-w-2xl mx-auto leading-relaxed font-light">
            A high-fidelity research environment exploring the intersection of distributed systems, neural architectures, and smooth analytical motion.
          </p>
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="w-px h-24 bg-gradient-to-b from-blue-500/50 to-transparent" />
            <span className="text-label text-blue-500/40 lowercase tracking-widest">Scroll to Initialize</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: The Archive (Academic Modules) ── */}
      <section className="relative min-h-[150dvh] flex flex-col items-start justify-center px-12 md:px-24 z-20 py-32 pointer-events-none bg-gradient-to-r from-black/60 via-black/20 to-transparent">
        <div className="sticky top-1/4 max-w-md pointer-events-auto">
          <p className="text-label mb-4">Laboratory Records</p>
          <h2 className="text-heading text-white mb-6">The Academic Archive</h2>
          <p
            style={{ fontFamily: 'var(--font-base)' }}
            className="text-blue-100/30 leading-relaxed font-light mb-8"
          >
            Interact with the floating nodes to explore specific course archives.
            Each module represents a pillar of core CS and AI research conducted within the lab.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-blue-500/50" />
            <span className="text-label text-blue-400/60 lowercase tracking-widest">Active Modules</span>
          </div>
        </div>
      </section>

      {/* ── Section 3: Tech Stack ── */}
      <section className="relative min-h-[100dvh] flex flex-col items-end justify-center px-12 md:px-24 z-20 pointer-events-none bg-gradient-to-l from-black/60 via-black/20 to-transparent">
        <div className="max-w-md text-right sticky top-1/3 pointer-events-auto">
          <p className="text-label mb-4">System Fabric</p>
          <h2 className="text-heading text-white mb-6">Built with Precision</h2>
          <p
            style={{ fontFamily: 'var(--font-base)' }}
            className="text-blue-100/30 leading-relaxed font-light mb-12"
          >
            The lab infrastructure is synthesized using direct neural-link protocols,
            Next.js core framing, and high-frequency shader pipelines.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-4 rounded border border-white/5 bg-white/5 backdrop-blur-md">
              <p className="text-label text-white/40 mb-2">Engines</p>
              <p className="text-sm font-bold text-white tracking-wide uppercase">WEBGL / GLSL / THREE.JS</p>
            </div>
            <div className="p-4 rounded border border-white/5 bg-white/5 backdrop-blur-md">
              <p className="text-label text-white/40 mb-2">Framework</p>
              <p className="text-sm font-bold text-white tracking-wide uppercase">NEXT.JS / TS / TAILWIND</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Final ── */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center z-20 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none text-center">
        <div className="max-w-4xl pointer-events-auto px-6">
          <h2
            style={{ fontFamily: 'var(--font-funky)' }}
            className="text-[10vw] font-black text-white/5 select-none leading-none mb-4"
          >
            CONNECTION
          </h2>
          <p className="text-label text-blue-400 mb-8 lowercase">Establish Uplink</p>
          <a
            href="mailto:lab@antigravity.dev"
            style={{ fontFamily: 'var(--font-base)' }}
            className="text-3xl md:text-5xl font-light text-white hover:text-blue-400 transition-all duration-500 tracking-tight"
          >
            lab@antigravity.dev
          </a>
        </div>
      </section>
    </main>
  )
}
