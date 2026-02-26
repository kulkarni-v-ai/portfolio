'use client';

import { notFound } from 'next/navigation';
import { use, useEffect } from 'react';
import { useCardStore } from '@/store/useCardStore';
import { useStore } from '@/store/useStore';
import BlogEditor from '@/components/BlogEditor';

// Category color mapping
const categoryColors: Record<string, string> = {
    'Core CS': '#3b82f6',
    'Machine Learning / AI': '#a855f7',
    'Systems': '#10b881',
    'Networking': '#f59e0b',
    'Programming': '#f43f5e',
    'Electives': '#14b8a6',
    'Hackathon': '#ff00ff',
    'Club': '#ffff00',
    'Leadership': '#00ffff',
    'Event': '#ff4d00',
};

export default function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const startTransition = useStore((s) => s.startTransition);
    const initialize = useCardStore((s) => s.initialize);
    const courses = useCardStore((s) => s.courses);
    const coCurriculars = useCardStore((s) => s.coCurriculars);

    useEffect(() => { initialize(); }, [initialize]);

    // Find the matching item from the dynamic store
    const course = courses.find((c) => c.slug === slug);
    const coCurricular = coCurriculars.find((c) => c.slug === slug);
    const item = course || coCurricular;

    if (!item) {
        notFound();
    }

    const isCourse = !!course;
    const accentColor = categoryColors[isCourse ? course!.category : coCurricular!.category] || '#00b4ff';
    const category = isCourse ? course!.category : coCurricular!.category;

    const handleBack = () => {
        startTransition('/');
    };

    return (
        <main className="relative min-h-screen bg-[#050505] text-white z-40">
            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(79,195,247,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(79,195,247,0.02)_1px,transparent_1px)] bg-[size:50px_50px] md:bg-[size:100px_100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24">
                {/* Back Navigation */}
                <button
                    onClick={handleBack}
                    className="group flex items-center gap-3 mb-12 text-white/30 hover:text-white/80 transition-all duration-500"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-1 duration-300">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Back to VANYX</span>
                </button>

                {/* Header */}
                <div className="mb-12">
                    {/* Category Badge */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}88` }} />
                        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40">
                            {category}
                        </span>
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] font-mono text-white/20">{item.id}</span>
                    </div>

                    {/* Title */}
                    <h1
                        className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-[0.9] mb-6"
                        style={{ fontFamily: 'var(--font-funky)' }}
                    >
                        {item.title}
                    </h1>

                    {/* Accent line */}
                    <div className="w-24 h-1 rounded-full mb-8" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

                    {/* Description */}
                    <p className="text-base md:text-lg text-white/40 leading-relaxed max-w-2xl" style={{ fontFamily: 'var(--font-base)' }}>
                        {item.description}
                    </p>
                </div>

                {/* Course-specific info */}
                {isCourse && course && (
                    <div className="mb-12">
                        <div className="mb-8">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30 mb-4">Core Skills</h3>
                            <div className="flex flex-wrap gap-3">
                                {course.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-4 py-2 text-[11px] font-mono uppercase tracking-wider rounded border bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white/90"
                                        style={{ borderColor: `${accentColor}33` }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Co-curricular specific info */}
                {!isCourse && coCurricular && (
                    <div className="mb-12 p-6 rounded-lg border border-white/5 bg-white/[0.02]">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30 mb-3">Role</h3>
                        <p className="text-lg font-semibold text-white/70 border-l-2 pl-4" style={{ borderColor: accentColor, fontFamily: 'var(--font-base)' }}>
                            {coCurricular.role}
                        </p>
                    </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-white/5" />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor, opacity: 0.4 }} />
                    <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Blog Editor */}
                <BlogEditor slug={slug} initialContent={item.blogContent || ''} />

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.3em]">
                        VANYX // {category}
                    </span>
                    <button
                        onClick={handleBack}
                        className="text-[10px] font-mono text-white/20 hover:text-white/60 uppercase tracking-[0.3em] transition-colors"
                    >
                        Return to Core →
                    </button>
                </div>
            </div>
        </main>
    );
}
