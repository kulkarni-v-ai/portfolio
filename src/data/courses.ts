export type CourseCategory =
    | 'Core CS'
    | 'Machine Learning / AI'
    | 'Networking'
    | 'Systems'
    | 'Programming'
    | 'Electives';

export interface Course {
    id: string;
    title: string;
    description: string;
    category: CourseCategory;
    grade?: string;
    skills: string[];
}

export const coursesData: Course[] = [
    // Core CS
    {
        id: 'cs101',
        title: 'Data Structures & Algorithms',
        description: 'Advanced study of algorithmic complexity, trees, graphs, and dynamic programming.',
        category: 'Core CS',
        skills: ['O(n) Analysis', 'Graph Theory', 'Optimization'],
    },
    {
        id: 'cs102',
        title: 'Theory of Computation',
        description: 'Automata theory, formal languages, Turing machines, and computability validation.',
        category: 'Core CS',
        skills: ['State Machines', 'Turing Completeness', 'Logic'],
    },

    // Machine Learning / AI
    {
        id: 'ml201',
        title: 'Deep Learning Architectures',
        description: 'Design and implementation of CNNs, RNNs, Transformers, and GANs.',
        category: 'Machine Learning / AI',
        skills: ['PyTorch', 'Neural Networks', 'Transformers'],
    },
    {
        id: 'ml202',
        title: 'Reinforcement Learning',
        description: 'Markov decision processes, Q-learning, and policy gradient methods.',
        category: 'Machine Learning / AI',
        skills: ['MDPs', 'Q-Learning', 'OpenAI Gym'],
    },

    // Systems
    {
        id: 'sys301',
        title: 'Operating Systems Design',
        description: 'Kernel architecture, memory management, and concurrent processing patterns.',
        category: 'Systems',
        skills: ['C', 'Concurrency', 'Memory Management'],
    },
    {
        id: 'sys302',
        title: 'Distributed Systems',
        description: 'Consensus algorithms, fault tolerance, and large-scale system architecture.',
        category: 'Systems',
        skills: ['Raft/Paxos', 'RPC', 'Fault Tolerance'],
    },

    // Networking
    {
        id: 'net401',
        title: 'Computer Networks',
        description: 'TCP/IP stack, routing protocols, and high-performance network programming.',
        category: 'Networking',
        skills: ['TCP/IP', 'BGP', 'Socket Programming'],
    },

    // Programming
    {
        id: 'prg501',
        title: 'Advanced Compilers',
        description: 'Lexical analysis, parsing algorithms, and code generation/optimization.',
        category: 'Programming',
        skills: ['ASTs', 'LLVM', 'Optimization'],
    },

    // Electives
    {
        id: 'ele601',
        title: 'Quantum Computing Fundamentals',
        description: 'Qubits, quantum gates, entanglement, and foundational quantum algorithms.',
        category: 'Electives',
        skills: ['Qiskit', 'Linear Algebra', 'Shor\'s Algorithm'],
    },
];
