'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_PASSWORD = 'vanyx2026';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (password === ADMIN_PASSWORD) {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('vanyx-admin', 'true');
                }
                router.push('/admin/dashboard');
            } else {
                setError('ACCESS DENIED — Invalid credentials');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <main className="relative min-h-screen bg-[#050505] flex items-center justify-center px-6">
            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(79,195,247,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(79,195,247,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1
                        className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-3"
                        style={{ fontFamily: 'var(--font-funky)' }}
                    >
                        VAN<span className="text-blue-500">YX</span>
                    </h1>
                    <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-white/30">
                        Admin Terminal
                    </p>
                </div>

                {/* Login Card */}
                <div className="p-8 rounded-xl border border-white/10 bg-black/60 backdrop-blur-3xl"
                    style={{ boxShadow: '0 0 60px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 180, 255, 0.1)' }}>

                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-red-500/60" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                        <div className="w-2 h-2 rounded-full bg-green-500/60" />
                        <span className="text-[9px] font-mono text-white/20 ml-2 tracking-wider">SECURE_AUTH_v2.4</span>
                    </div>

                    {/* Password field */}
                    <div className="mb-6">
                        <label className="block text-[9px] font-mono uppercase tracking-[0.4em] text-white/30 mb-3">
                            Access Code
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            placeholder="Enter admin password..."
                            className="w-full bg-black/80 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/15"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 px-3 py-2 rounded border border-red-500/30 bg-red-500/10">
                            <p className="text-[10px] font-mono text-red-400 tracking-wider">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleLogin}
                        disabled={loading || !password}
                        className="w-full py-3 rounded-lg text-[11px] font-mono uppercase tracking-[0.3em] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-500/50"
                    >
                        {loading ? (
                            <span className="animate-pulse">Authenticating...</span>
                        ) : (
                            'Initialize Session →'
                        )}
                    </button>

                    {/* Hint */}
                    <p className="text-[8px] font-mono text-white/10 text-center mt-6 tracking-wider">
                        DEFAULT: vanyx2026
                    </p>
                </div>

                {/* Back link */}
                <div className="text-center mt-8">
                    <a href="/" className="text-[10px] font-mono text-white/20 hover:text-white/50 uppercase tracking-[0.3em] transition-colors">
                        ← Return to VANYX
                    </a>
                </div>
            </div>
        </main>
    );
}
