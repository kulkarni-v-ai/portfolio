'use client';

import { useState, useEffect, useCallback } from 'react';

interface BlogEditorProps {
    slug: string;
    initialContent?: string;
}

export default function BlogEditor({ slug, initialContent = '' }: BlogEditorProps) {
    const storageKey = `vanyx-blog-${slug}`;
    const [content, setContent] = useState('');
    const [mode, setMode] = useState<'preview' | 'edit'>('preview');
    const [saved, setSaved] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check admin session
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsAdmin(sessionStorage.getItem('vanyx-admin') === 'true');
        }
    }, []);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setContent(stored);
        } else if (initialContent) {
            setContent(initialContent);
        }
    }, [storageKey, initialContent]);

    const handleSave = useCallback(() => {
        localStorage.setItem(storageKey, content);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [storageKey, content]);

    // Simple markdown-to-HTML renderer
    const renderMarkdown = (md: string): string => {
        let html = md
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white/90 mb-2 mt-6" style="font-family: var(--font-funky)">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mb-3 mt-8" style="font-family: var(--font-funky)">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4 mt-8" style="font-family: var(--font-funky)">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white/90 font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-white/70 italic">$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono text-cyan-300/80">$1</code>')
            .replace(/^- (.*$)/gim, '<li class="text-white/50 text-sm ml-4 list-disc list-inside leading-relaxed">$1</li>')
            .replace(/^(?!<[hlu]|<li)(.*$)/gim, (match) => {
                if (match.trim() === '') return '<br/>';
                return `<p class="text-white/50 text-sm leading-relaxed mb-2" style="font-family: var(--font-base)">${match}</p>`;
            });
        return html;
    };

    return (
        <div className="mt-12">
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-funky)' }}>
                        Blog Content
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMode('preview')}
                        className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] rounded border transition-all duration-300 ${mode === 'preview'
                                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                : 'border-white/10 text-white/30 hover:text-white/60'
                            }`}
                    >
                        Preview
                    </button>
                    {/* Show Edit button only when admin is logged in */}
                    {isAdmin && (
                        <button
                            onClick={() => setMode('edit')}
                            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] rounded border transition-all duration-300 ${mode === 'edit'
                                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                    : 'border-white/10 text-white/30 hover:text-white/60'
                                }`}
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Edit Mode (admin only) */}
            {mode === 'edit' && isAdmin && (
                <div className="space-y-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-96 bg-black/60 border border-white/10 rounded-lg p-6 text-sm text-white/70 font-mono leading-relaxed resize-y focus:outline-none focus:border-cyan-500/40 transition-colors placeholder:text-white/20"
                        placeholder="Write your blog content here using markdown..."
                        style={{ fontFamily: 'var(--font-base)' }}
                    />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-300 hover:bg-cyan-500/30 transition-all duration-300"
                        >
                            Save Content
                        </button>
                        {saved && (
                            <span className="text-[10px] font-mono text-emerald-400 animate-pulse tracking-wider">
                                ✓ SAVED TO LOCAL STORAGE
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Mode */}
            {(mode === 'preview' || !isAdmin) && (
                <div className="bg-black/40 border border-white/5 rounded-lg p-8 min-h-[200px]">
                    {content ? (
                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-white/20 text-sm font-mono">
                                {isAdmin ? 'No content yet. Switch to Edit mode to start writing.' : 'No content available yet.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
