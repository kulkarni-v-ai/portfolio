export type ClusterCategory = 'Hackathon' | 'Club' | 'Leadership' | 'Event';

export interface CoCurricular {
    id: string;
    slug: string;
    title: string;
    role: string;
    category: ClusterCategory;
    description: string;
    blogContent?: string;
}

export const coCurricularData: CoCurricular[] = [
    {
        id: 'hack-01',
        slug: 'global-ai-hackathon',
        title: 'Global AI Hackathon',
        role: 'Winner - Best Innovation',
        category: 'Hackathon',
        description: 'Developed a decentralized agentic system for anti-gravity simulation.',
        blogContent: `## Global AI Hackathon

Won "Best Innovation" for building a decentralized multi-agent system that simulates anti-gravity environments using reinforcement learning.

### Highlights
- **48-hour** intensive build sprint
- Built with Python, PyTorch, and custom physics engine
- Multi-agent cooperation using emergent behavior patterns
- Live demo impressed judges with real-time simulation`,
    },
    {
        id: 'club-01',
        slug: 'robotics-society',
        title: 'Robotics Society',
        role: 'Technical Lead',
        category: 'Club',
        description: 'Leading a team of 50+ students in building autonomous drone swarms.',
        blogContent: `## Robotics Society

Leading the technical direction of autonomous drone swarm research with 50+ team members.

### Achievements
- Designed swarm communication protocol using mesh networking
- Built custom flight controllers with STM32 microcontrollers
- Won regional robotics competition two years running
- Published paper on emergent swarm behavior`,
    },
    {
        id: 'lead-01',
        slug: 'ieee-student-branch',
        title: 'IEEE Student Branch',
        role: 'Chairperson',
        category: 'Leadership',
        description: 'Oversaw technical workshops and international conferences for 200+ members.',
        blogContent: `## IEEE Student Branch

Served as Chairperson overseeing all technical activities for 200+ members.

### Impact
- Organized 15+ technical workshops per semester
- Hosted an international conference with 500+ attendees
- Established industry partnerships with 8 tech companies
- Grew active membership by 150%`,
    },
    {
        id: 'event-01',
        slug: 'technexus-2025',
        title: 'TechNexus 2025',
        role: 'Organizer',
        category: 'Event',
        description: 'Coordinated the University\'s flagship technical festival with 5k+ attendees.',
        blogContent: `## TechNexus 2025

Coordinated the university's flagship tech festival — the largest student-organized event with 5,000+ attendees.

### Responsibilities
- Managed a team of 100+ volunteers
- Secured sponsorships totaling $50,000+
- Organized 30+ events including hackathons, talks, and workshops
- Coordinated with 20+ industry speakers`,
    },
];
