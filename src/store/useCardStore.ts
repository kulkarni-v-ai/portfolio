import { create } from 'zustand';
import { Course, coursesData, CourseCategory } from '@/data/courses';
import { CoCurricular, coCurricularData, ClusterCategory } from '@/data/cocurricular';

interface CardStore {
    courses: Course[];
    coCurriculars: CoCurricular[];
    isInitialized: boolean;

    initialize: () => void;
    addCourse: (course: Course) => void;
    deleteCourse: (id: string) => void;
    addCoCurricular: (item: CoCurricular) => void;
    deleteCoCurricular: (id: string) => void;
}

const COURSES_KEY = 'vanyx-courses';
const COCURRICULAR_KEY = 'vanyx-cocurriculars';

export const useCardStore = create<CardStore>((set, get) => ({
    courses: [],
    coCurriculars: [],
    isInitialized: false,

    initialize: () => {
        if (get().isInitialized) return;

        if (typeof window === 'undefined') {
            set({ courses: coursesData, coCurriculars: coCurricularData, isInitialized: true });
            return;
        }

        const storedCourses = localStorage.getItem(COURSES_KEY);
        const storedCoCurriculars = localStorage.getItem(COCURRICULAR_KEY);

        set({
            courses: storedCourses ? JSON.parse(storedCourses) : coursesData,
            coCurriculars: storedCoCurriculars ? JSON.parse(storedCoCurriculars) : coCurricularData,
            isInitialized: true,
        });
    },

    addCourse: (course) => {
        const updated = [...get().courses, course];
        set({ courses: updated });
        if (typeof window !== 'undefined') localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
    },

    deleteCourse: (id) => {
        const updated = get().courses.filter((c) => c.id !== id);
        set({ courses: updated });
        if (typeof window !== 'undefined') localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
    },

    addCoCurricular: (item) => {
        const updated = [...get().coCurriculars, item];
        set({ coCurriculars: updated });
        if (typeof window !== 'undefined') localStorage.setItem(COCURRICULAR_KEY, JSON.stringify(updated));
    },

    deleteCoCurricular: (id) => {
        const updated = get().coCurriculars.filter((c) => c.id !== id);
        set({ coCurriculars: updated });
        if (typeof window !== 'undefined') localStorage.setItem(COCURRICULAR_KEY, JSON.stringify(updated));
    },
}));
