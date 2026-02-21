export type ClusterCategory = 'Hackathon' | 'Club' | 'Leadership' | 'Event';

export interface CoCurricular {
    id: string;
    title: string;
    role: string;
    category: ClusterCategory;
    description: string;
}

export const coCurricularData: CoCurricular[] = [
    {
        id: 'hack-01',
        title: 'Global AI Hackathon',
        role: 'Winner - Best Innovation',
        category: 'Hackathon',
        description: 'Developed a decentralized agentic system for anti-gravity simulation.',
    },
    {
        id: 'club-01',
        title: 'Robotics Society',
        role: 'Technical Lead',
        category: 'Club',
        description: 'Leading a team of 50+ students in building autonomous drone swarms.',
    },
    {
        id: 'lead-01',
        title: 'IEEE Student Branch',
        role: 'Chairperson',
        category: 'Leadership',
        description: 'Oversaw technical workshops and international conferences for 200+ members.',
    },
    {
        id: 'event-01',
        title: 'TechNexus 2025',
        role: 'Organizer',
        category: 'Event',
        description: 'Coordinated the University\'s flagship technical festival with 5k+ attendees.',
    },
];
