import { Course, CourseCategory } from '@/data/courses';
import FloatingModule from './FloatingModule';
import { useMemo } from 'react';

// Define specific glow colors for each academic category
const categoryColors: Record<CourseCategory, { border: string, bg: string, shadow: string, text: string }> = {
    'Core CS': {
        border: 'hover:border-blue-500/50',
        bg: 'hover:bg-blue-900/20',
        shadow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
        text: 'text-blue-400',
    },
    'Machine Learning / AI': {
        border: 'hover:border-purple-500/50',
        bg: 'hover:bg-purple-900/20',
        shadow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
        text: 'text-purple-400',
    },
    'Systems': {
        border: 'hover:border-emerald-500/50',
        bg: 'hover:bg-emerald-900/20',
        shadow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
        text: 'text-emerald-400',
    },
    'Networking': {
        border: 'hover:border-amber-500/50',
        bg: 'hover:bg-amber-900/20',
        shadow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]',
        text: 'text-amber-400',
    },
    'Programming': {
        border: 'hover:border-rose-500/50',
        bg: 'hover:bg-rose-900/20',
        shadow: 'hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]',
        text: 'text-rose-400',
    },
    'Electives': {
        border: 'hover:border-teal-500/50',
        bg: 'hover:bg-teal-900/20',
        shadow: 'hover:shadow-[0_0_40px_rgba(20,184,166,0.3)]',
        text: 'text-teal-400',
    }
};

interface AcademicModuleProps {
    course: Course;
    index: number;
    totalCourses: number;
}

export default function AcademicModule({ course, index, totalCourses }: AcademicModuleProps) {
    // Distribute courses in a 3D ring around the AI Core
    const [position, orbitSpeed] = useMemo(() => {
        const angle = (index / totalCourses) * Math.PI * 2;
        // Dramatically increase spread to fix overlapping
        const radius = index % 2 === 0 ? 14 : 18; // Pushed further out
        const height = (Math.random() - 0.5) * 14; // More vertical spread

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Outer ring orbits slower
        const speed = index % 2 === 0 ? 0.12 : 0.07;

        return [[x, height, z] as [number, number, number], speed];
    }, [index, totalCourses]);

    const style = categoryColors[course.category];

    return (
        <FloatingModule
            position={position}
            orbitRadius={Math.abs(position[0]) + 2}
            orbitSpeed={orbitSpeed}
        >
            <div
                onClick={() => alert(`Engaging Module: ${course.title}\nID: ${course.id}`)}
                className="flex flex-col gap-2 group cursor-pointer active:scale-95 transition-transform"
            >
                <div className="flex justify-between items-start mb-1">
                    <span
                        className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded bg-black/60 border border-white/10 ${style.text}`}
                    >
                        {course.category}
                    </span>
                    <span className="text-[9px] font-mono text-white/20 tracking-[0.2em] uppercase">{course.id}</span>
                </div>

                <h3
                    className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight"
                >
                    {course.title}
                </h3>

                <p
                    className="text-[13px] text-white/50 leading-relaxed line-clamp-2 mt-1 shadow-sm"
                >
                    {course.description}
                </p>

                {/* Hover-reveal Skills Section */}
                <div className="mt-3 pt-3 border-t border-white/5 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-h-24 group-hover:opacity-100">
                    <div
                        className="flex flex-wrap gap-2"
                    >
                        {course.skills.map((skill) => (
                            <span key={skill} className="text-[9px] bg-white/5 px-2 py-1 rounded-sm text-white/40 border border-white/5">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </FloatingModule >
    );
}
