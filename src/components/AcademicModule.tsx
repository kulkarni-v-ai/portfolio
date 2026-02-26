import { Course, CourseCategory } from '@/data/courses';
import FloatingModule from './FloatingModule';
import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { soundManager } from '@/lib/sounds';

const categoryColors: Record<CourseCategory, { accent: string, glow: string, border: string }> = {
    'Core CS': { accent: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', border: 'border-blue-500/30' },
    'Machine Learning / AI': { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)', border: 'border-purple-500/30' },
    'Systems': { accent: '#10b881', glow: 'rgba(16, 185, 129, 0.3)', border: 'border-emerald-500/30' },
    'Networking': { accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', border: 'border-amber-500/30' },
    'Programming': { accent: '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)', border: 'border-rose-500/30' },
    'Electives': { accent: '#14b8a6', glow: 'rgba(20, 184, 166, 0.3)', border: 'border-teal-500/30' },
};

interface AcademicModuleProps {
    course: Course;
    index: number;
    totalCourses: number;
}

export default function AcademicModule({ course, index, totalCourses }: AcademicModuleProps) {
    const startTransition = useStore(state => state.startTransition);

    const [position, orbitSpeed] = useMemo(() => {
        const angle = (index / totalCourses) * Math.PI * 2;
        const radius = index % 2 === 0 ? 30 : 38;
        const height = (Math.random() - 0.5) * 25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const speed = index % 2 === 0 ? 0.08 : 0.05;
        return [[x, height, z] as [number, number, number], speed];
    }, [index, totalCourses]);

    const style = categoryColors[course.category];

    const handleClick = () => {
        soundManager.init();
        soundManager.playClick();
        startTransition(`/blog/${course.slug}`);
    };

    const handleHover = () => {
        soundManager.init();
        soundManager.playHover();
    };

    return (
        <FloatingModule
            position={position}
            orbitRadius={Math.abs(position[0]) + 2}
            orbitSpeed={orbitSpeed}
            ui={
                <div
                    onClick={handleClick}
                    onMouseEnter={handleHover}
                    className="relative w-64 p-4 rounded-lg bg-black/80 backdrop-blur-2xl border border-white/10 group cursor-pointer select-none card-hover-flip"
                    style={{ boxShadow: `0 0 30px rgba(0, 0, 0, 0.5), 0 0 1px ${style.accent}44` }}
                >
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: style.accent }} />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: style.accent }} />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: style.accent }} />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: style.accent }} />

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 rounded-full" style={{ backgroundColor: style.accent }} />
                                <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/40">{course.category}</span>
                            </div>
                            <span className="text-[8px] font-mono text-white/20 tracking-widest">{course.id}</span>
                        </div>

                        <div>
                            <h3 className="text-[15px] font-bold text-white tracking-tight leading-tight group-hover:text-white uppercase" style={{ fontFamily: 'var(--font-funky)' }}>
                                {course.title}
                            </h3>
                            <div className="h-0.5 w-0 group-hover:w-full transition-all duration-700 mt-1" style={{ backgroundColor: style.accent }} />
                        </div>

                        <p className="text-[12px] text-white/50 leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-base)' }}>
                            {course.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            {course.skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-white/30">{skill}</span>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 pt-1 border-t border-white/5">
                            <span className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: style.accent }}>Read More</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover:translate-x-1 duration-300">
                                <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke={style.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-10 group-hover:opacity-40" style={{ color: style.accent }} />
                </div>
            }
        />
    );
}
