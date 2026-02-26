export type CourseCategory =
    | 'Core CS'
    | 'Machine Learning / AI'
    | 'Networking'
    | 'Systems'
    | 'Programming'
    | 'Electives';

export interface Course {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: CourseCategory;
    grade?: string;
    skills: string[];
    blogContent?: string;
}

export const coursesData: Course[] = [
    // Core CS
    {
        id: 'cs101',
        slug: 'data-structures-algorithms',
        title: 'Data Structures & Algorithms',
        description: 'Advanced study of algorithmic complexity, trees, graphs, and dynamic programming.',
        category: 'Core CS',
        skills: ['O(n) Analysis', 'Graph Theory', 'Optimization'],
        blogContent: `## Data Structures & Algorithms

This module covers the foundational pillars of computer science — from basic arrays and linked lists to advanced graph traversals and dynamic programming paradigms.

### Key Topics
- **Asymptotic Analysis**: Big-O, Theta, and Omega notations
- **Trees & Heaps**: AVL, Red-Black, B-Trees, Priority Queues
- **Graph Algorithms**: BFS, DFS, Dijkstra, Bellman-Ford, A*
- **Dynamic Programming**: Memoization, tabulation, and optimal substructure

### Projects
Built a custom graph visualization engine capable of rendering real-time pathfinding algorithms.`,
    },
    {
        id: 'cs102',
        slug: 'theory-of-computation',
        title: 'Theory of Computation',
        description: 'Automata theory, formal languages, Turing machines, and computability validation.',
        category: 'Core CS',
        skills: ['State Machines', 'Turing Completeness', 'Logic'],
        blogContent: `## Theory of Computation

Exploring the mathematical boundaries of what machines can and cannot compute.

### Key Topics
- **Finite Automata**: DFA, NFA, and regular expressions
- **Context-Free Grammars**: Pushdown automata, parsing
- **Turing Machines**: Universal computation, halting problem
- **Complexity Classes**: P, NP, NP-Complete, and reductions`,
    },

    // Machine Learning / AI
    {
        id: 'ml201',
        slug: 'deep-learning-architectures',
        title: 'Deep Learning Architectures',
        description: 'Design and implementation of CNNs, RNNs, Transformers, and GANs.',
        category: 'Machine Learning / AI',
        skills: ['PyTorch', 'Neural Networks', 'Transformers'],
        blogContent: `## Deep Learning Architectures

A deep dive into modern neural network architectures and their applications.

### Key Topics
- **CNNs**: Convolutional layers, pooling, ResNets, EfficientNet
- **RNNs & LSTMs**: Sequence modeling, attention mechanisms
- **Transformers**: Self-attention, BERT, GPT architecture
- **GANs**: Generator-discriminator training, StyleGAN

### Projects
Trained a custom Transformer model for code generation using PyTorch.`,
    },
    {
        id: 'ml202',
        slug: 'reinforcement-learning',
        title: 'Reinforcement Learning',
        description: 'Markov decision processes, Q-learning, and policy gradient methods.',
        category: 'Machine Learning / AI',
        skills: ['MDPs', 'Q-Learning', 'OpenAI Gym'],
        blogContent: `## Reinforcement Learning

Teaching agents to make sequential decisions through trial, error, and reward.

### Key Topics
- **MDPs**: States, actions, rewards, transitions
- **Value-Based Methods**: Q-learning, Deep Q-Networks
- **Policy Gradient**: REINFORCE, PPO, A3C
- **Multi-Agent RL**: Cooperative and competitive environments`,
    },

    // Systems
    {
        id: 'sys301',
        slug: 'operating-systems-design',
        title: 'Operating Systems Design',
        description: 'Kernel architecture, memory management, and concurrent processing patterns.',
        category: 'Systems',
        skills: ['C', 'Concurrency', 'Memory Management'],
        blogContent: `## Operating Systems Design

Understanding the heart of every computer — from boot sequences to process scheduling.

### Key Topics
- **Process Management**: Scheduling algorithms, context switching
- **Memory Management**: Paging, segmentation, virtual memory
- **File Systems**: ext4, NTFS, journaling
- **Concurrency**: Mutexes, semaphores, deadlock prevention`,
    },
    {
        id: 'sys302',
        slug: 'distributed-systems',
        title: 'Distributed Systems',
        description: 'Consensus algorithms, fault tolerance, and large-scale system architecture.',
        category: 'Systems',
        skills: ['Raft/Paxos', 'RPC', 'Fault Tolerance'],
        blogContent: `## Distributed Systems

Building reliable systems that span multiple machines and survive failures.

### Key Topics
- **Consensus**: Raft, Paxos, Byzantine fault tolerance
- **Replication**: Primary-backup, chain replication
- **Consistency Models**: Linearizability, eventual consistency
- **Distributed Storage**: DHTs, sharding strategies`,
    },

    // Networking
    {
        id: 'net401',
        slug: 'computer-networks',
        title: 'Computer Networks',
        description: 'TCP/IP stack, routing protocols, and high-performance network programming.',
        category: 'Networking',
        skills: ['TCP/IP', 'BGP', 'Socket Programming'],
        blogContent: `## Computer Networks

How data travels across the planet in milliseconds.

### Key Topics
- **TCP/IP Stack**: Layers, encapsulation, addressing
- **Routing**: OSPF, BGP, software-defined networking
- **Transport**: TCP congestion control, UDP, QUIC
- **Application Layer**: HTTP/2, gRPC, WebSockets`,
    },

    // Programming
    {
        id: 'prg501',
        slug: 'advanced-compilers',
        title: 'Advanced Compilers',
        description: 'Lexical analysis, parsing algorithms, and code generation/optimization.',
        category: 'Programming',
        skills: ['ASTs', 'LLVM', 'Optimization'],
        blogContent: `## Advanced Compilers

Transforming human-readable code into machine-executable instructions.

### Key Topics
- **Lexical Analysis**: Tokenization, regular expressions
- **Parsing**: LL, LR, recursive descent
- **Semantic Analysis**: Type checking, scope resolution
- **Code Generation**: IR, SSA form, LLVM backend`,
    },

    // Electives
    {
        id: 'ele601',
        slug: 'quantum-computing-fundamentals',
        title: 'Quantum Computing Fundamentals',
        description: 'Qubits, quantum gates, entanglement, and foundational quantum algorithms.',
        category: 'Electives',
        skills: ['Qiskit', 'Linear Algebra', 'Shor\'s Algorithm'],
        blogContent: `## Quantum Computing Fundamentals

Harnessing quantum mechanics for computational breakthroughs.

### Key Topics
- **Qubits**: Superposition, measurement, Bloch sphere
- **Quantum Gates**: Hadamard, CNOT, Toffoli
- **Entanglement**: Bell states, quantum teleportation
- **Algorithms**: Shor's factoring, Grover's search`,
    },
];
