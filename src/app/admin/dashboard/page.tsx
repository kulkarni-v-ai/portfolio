'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCardStore } from '@/store/useCardStore';
import { CourseCategory } from '@/data/courses';
import { ClusterCategory } from '@/data/cocurricular';

const courseCategories: CourseCategory[] = ['Core CS', 'Machine Learning / AI', 'Networking', 'Systems', 'Programming', 'Electives'];
const clusterCategories: ClusterCategory[] = ['Hackathon', 'Club', 'Leadership', 'Event'];

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminDashboard() {
    const router = useRouter();
    const { courses, coCurriculars, initialize, addCourse, deleteCourse, addCoCurricular, deleteCoCurricular } = useCardStore();
    const [activeTab, setActiveTab] = useState<'courses' | 'activities'>('courses');
    const [showAddForm, setShowAddForm] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    // Auth check
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAdmin = sessionStorage.getItem('vanyx-admin');
            if (isAdmin !== 'true') {
                router.push('/admin');
            } else {
                setAuthenticated(true);
            }
        }
    }, [router]);

    // Initialize card store
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Course Form State
    const [courseForm, setCourseForm] = useState({
        title: '', description: '', category: 'Core CS' as CourseCategory,
        skills: '', blogContent: '',
    });

    // CoCurricular Form State
    const [activityForm, setActivityForm] = useState({
        title: '', role: '', category: 'Hackathon' as ClusterCategory,
        description: '', blogContent: '',
    });

    const handleAddCourse = () => {
        if (!courseForm.title || !courseForm.description) return;
        const id = `c-${Date.now()}`;
        addCourse({
            id,
            slug: slugify(courseForm.title),
            title: courseForm.title,
            description: courseForm.description,
            category: courseForm.category,
            skills: courseForm.skills.split(',').map(s => s.trim()).filter(Boolean),
            blogContent: courseForm.blogContent || undefined,
        });
        setCourseForm({ title: '', description: '', category: 'Core CS', skills: '', blogContent: '' });
        setShowAddForm(false);
    };

    const handleAddActivity = () => {
        if (!activityForm.title || !activityForm.role) return;
        const id = `a-${Date.now()}`;
        addCoCurricular({
            id,
            slug: slugify(activityForm.title),
            title: activityForm.title,
            role: activityForm.role,
            category: activityForm.category,
            description: activityForm.description,
            blogContent: activityForm.blogContent || undefined,
        });
        setActivityForm({ title: '', role: '', category: 'Hackathon', description: '', blogContent: '' });
        setShowAddForm(false);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('vanyx-admin');
        router.push('/admin');
    };

    if (!authenticated) return null;

    return (
        <main className="relative min-h-screen bg-[#050505] text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(79,195,247,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(79,195,247,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-funky)' }}>
                                VAN<span className="text-blue-500">YX</span>
                            </h1>
                            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-cyan-400/60 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                Admin
                            </span>
                        </div>
                        <p className="text-[10px] font-mono text-white/20 tracking-wider">Card Management Terminal</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/" className="text-[10px] font-mono text-white/30 hover:text-white/60 uppercase tracking-[0.2em] transition-colors">
                            View Site
                        </a>
                        <button
                            onClick={handleLogout}
                            className="text-[10px] font-mono text-red-400/60 hover:text-red-400 uppercase tracking-[0.2em] transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-8 border-b border-white/5 pb-4">
                    <button
                        onClick={() => { setActiveTab('courses'); setShowAddForm(false); }}
                        className={`px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] rounded-t transition-all ${activeTab === 'courses'
                                ? 'bg-cyan-500/15 border border-b-0 border-cyan-500/30 text-cyan-300'
                                : 'text-white/30 hover:text-white/60'
                            }`}
                    >
                        Courses ({courses.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('activities'); setShowAddForm(false); }}
                        className={`px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] rounded-t transition-all ${activeTab === 'activities'
                                ? 'bg-cyan-500/15 border border-b-0 border-cyan-500/30 text-cyan-300'
                                : 'text-white/30 hover:text-white/60'
                            }`}
                    >
                        Activities ({coCurriculars.length})
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
                    >
                        {showAddForm ? '✕ Cancel' : '+ Add New'}
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="mb-8 p-6 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400/60 mb-6">
                            New {activeTab === 'courses' ? 'Course' : 'Activity'}
                        </h3>

                        {activeTab === 'courses' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Title *</label>
                                    <input
                                        value={courseForm.title}
                                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15"
                                        placeholder="e.g. Machine Learning 101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Category</label>
                                    <select
                                        value={courseForm.category}
                                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as CourseCategory })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40"
                                    >
                                        {courseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Description *</label>
                                    <input
                                        value={courseForm.description}
                                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15"
                                        placeholder="Brief description of the course"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Skills (comma-separated)</label>
                                    <input
                                        value={courseForm.skills}
                                        onChange={(e) => setCourseForm({ ...courseForm, skills: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15"
                                        placeholder="Python, TensorFlow, Math"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Blog Content (Markdown)</label>
                                    <textarea
                                        value={courseForm.blogContent}
                                        onChange={(e) => setCourseForm({ ...courseForm, blogContent: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15 h-24 resize-y"
                                        placeholder="## Course Blog\nWrite markdown here..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        onClick={handleAddCourse}
                                        disabled={!courseForm.title || !courseForm.description}
                                        className="px-6 py-2 text-[10px] font-mono uppercase tracking-[0.2em] rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Add Course
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Title *</label>
                                    <input
                                        value={activityForm.title}
                                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15"
                                        placeholder="e.g. AI Hackathon 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Role *</label>
                                    <input
                                        value={activityForm.role}
                                        onChange={(e) => setActivityForm({ ...activityForm, role: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15"
                                        placeholder="e.g. Team Lead"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Category</label>
                                    <select
                                        value={activityForm.category}
                                        onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value as ClusterCategory })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40"
                                    >
                                        {clusterCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Description</label>
                                    <input
                                        value={activityForm.description}
                                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15"
                                        placeholder="Brief description"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Blog Content (Markdown)</label>
                                    <textarea
                                        value={activityForm.blogContent}
                                        onChange={(e) => setActivityForm({ ...activityForm, blogContent: e.target.value })}
                                        className="w-full bg-black/80 border border-white/10 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/15 h-24 resize-y"
                                        placeholder="## Activity Blog\nWrite markdown here..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        onClick={handleAddActivity}
                                        disabled={!activityForm.title || !activityForm.role}
                                        className="px-6 py-2 text-[10px] font-mono uppercase tracking-[0.2em] rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Add Activity
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Cards List */}
                {activeTab === 'courses' && (
                    <div className="space-y-3">
                        {courses.length === 0 && (
                            <p className="text-center text-white/20 text-sm font-mono py-12">No courses yet. Click "+ Add New" to create one.</p>
                        )}
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="flex items-center gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                            >
                                <div className="w-1 h-10 rounded-full bg-blue-500/40" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight truncate" style={{ fontFamily: 'var(--font-funky)' }}>
                                        {course.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider">{course.category}</span>
                                        <span className="text-[8px] font-mono text-white/15">•</span>
                                        <span className="text-[8px] font-mono text-white/20">{course.id}</span>
                                        <span className="text-[8px] font-mono text-white/15">•</span>
                                        <span className="text-[8px] font-mono text-white/20">/{course.slug}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {course.skills.slice(0, 2).map(s => (
                                        <span key={s} className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/30 hidden md:inline">{s}</span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => deleteCourse(course.id)}
                                    className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'activities' && (
                    <div className="space-y-3">
                        {coCurriculars.length === 0 && (
                            <p className="text-center text-white/20 text-sm font-mono py-12">No activities yet. Click "+ Add New" to create one.</p>
                        )}
                        {coCurriculars.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                            >
                                <div className="w-1 h-10 rounded-full bg-purple-500/40" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight truncate" style={{ fontFamily: 'var(--font-funky)' }}>
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider">{item.category}</span>
                                        <span className="text-[8px] font-mono text-white/15">•</span>
                                        <span className="text-[8px] font-mono text-white/20">{item.role}</span>
                                        <span className="text-[8px] font-mono text-white/15">•</span>
                                        <span className="text-[8px] font-mono text-white/20">/{item.slug}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteCoCurricular(item.id)}
                                    className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-16 pt-6 border-t border-white/5 text-center">
                    <p className="text-[8px] font-mono text-white/10 uppercase tracking-[0.3em]">
                        VANYX Admin Terminal // Changes persist via localStorage
                    </p>
                </div>
            </div>
        </main>
    );
}
