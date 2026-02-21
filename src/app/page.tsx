'use client'

// ─── Phase 1 Starter Page ────────────────────────────────────────────────────
// This is the minimal black system boot screen.
// WebGL canvas and scroll-driven sections will be layered in Phase 3+.
//
// What you see on screen:
//   • Pure black background (#000)
//   • Centered system title in Space Grotesk light weight
//   • Mono status line blinking below
//   • Subtle grid overlay (CSS only, no JS)
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* ── Grid overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(79,195,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,195,247,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Radial vignette ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, #000 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 2rem',
          maxWidth: '900px',
        }}
      >
        {/* System label */}
        <p
          className="text-label"
          style={{ marginBottom: '1.5rem', letterSpacing: '0.3em' }}
        >
          SYSTEM · BOOT · v0.1
        </p>

        {/* Main title */}
        <h1
          className="text-display glow-cold"
          style={{
            fontWeight: 300,
            color: '#e8f4f8',
            marginBottom: '1.5rem',
            lineHeight: 1.05,
          }}
        >
          AI Superintelligence
          <br />
          <span style={{ color: '#4fc3f7' }}>Anti-Gravity</span> Lab
        </h1>

        {/* Subtitle */}
        <p
          className="text-label"
          style={{ color: '#3d6478', marginBottom: '3rem' }}
        >
          Scroll to initialize · System online
        </p>

        {/* Status bar */}
        <div
          className="text-mono glow-box"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 1.25rem',
            border: '1px solid rgba(79,195,247,0.15)',
            borderRadius: '4px',
            backgroundColor: 'rgba(79,195,247,0.03)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: '#7fb3c8',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#4fc3f7',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          GRAVITY FIELD NOMINAL · INTELLIGENCE CORE IDLE
        </div>
      </div>

      {/* ── Pulse keyframe ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>
    </main>
  )
}
