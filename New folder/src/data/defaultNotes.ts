import { StudyNote } from '../types';

export const INITIAL_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    title: 'Essential Calculus: Derivatives & Tangent Slopes',
    subject: 'Math',
    topic: 'Calculus',
    content: `# Essential Calculus: Derivatives & Tangent Slopes

## Core Definition
The derivative of a function represents the instantaneous rate of change:
\`\`\`
f'(x) = lim_{h -> 0} [f(x+h) - f(x)] / h
\`\`\`

## High-Frequency Differentiation Rules
1. **Power Rule:** d/dx [x^n] = n · x^(n-1)
2. **Product Rule:** (uv)' = u'v + uv'
3. **Quotient Rule:** (u/v)' = (u'v - uv') / v^2
4. **Chain Rule:** d/dx [f(g(x))] = f'(g(x)) · g'(x)

## Critical Practical Tip
Always look for algebraic simplification **before** blindly applying quotient or product rules. For example, (3x^3 + x)/x simplifies immediately to 3x^2 + 1!`,
    tags: ['Calculus', 'Limits', 'Formulas', 'Math Exam'],
    isPinned: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'note-2',
    title: 'Data Structures Quick Reference: Big-O Cheatsheet',
    subject: 'Computer Science',
    topic: 'Data Structures',
    content: `# Data Structures Quick Reference

## Core Operations Time Complexity

| Data Structure | Access | Search | Insertion | Deletion |
| --- | --- | --- | --- | --- |
| Array | O(1) | O(n) | O(n) | O(n) |
| Stack | O(n) | O(n) | O(1) | O(1) |
| Queue | O(n) | O(n) | O(1) | O(1) |
| Hash Table | O(1)* | O(1)* | O(1)* | O(1)* |
| Binary Search Tree | O(log n) | O(log n) | O(log n) | O(log n) |

*\*Average case assuming minimal hash collisions.*

## When to Choose What
- **Arrays**: Fixed size or sequential random-access lookups.
- **Linked Lists**: Frequent inserts/deletions at heads without shifting elements.
- **Hash Maps**: Instant key-based retrieval O(1).
- **Heaps**: Real-time priority ordering and finding Min/Max in O(1).`,
    tags: ['Algorithms', 'Interview Prep', 'Big-O', 'Data Structures'],
    isPinned: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Thermodynamics & Newton\'s Laws Synthesis',
    subject: 'Science',
    topic: 'Physics',
    content: `# Physics Fundamentals: Mechanics & Thermo

## Newton's Three Laws
- **1st Law (Inertia):** An object remains at rest or in uniform velocity unless acted on by an unbalanced net force.
- **2nd Law (Force):** F = dp/dt = m · a
- **3rd Law (Action/Reaction):** For every action, there is an equal and opposite reaction.

## Laws of Thermodynamics
1. **Zeroth Law:** Thermal equilibrium is transitive (defines Temperature).
2. **First Law:** Energy cannot be created or destroyed; ΔU = Q - W.
3. **Second Law:** Total entropy of an isolated system always increases over time.
4. **Third Law:** As T approaches absolute zero (0 Kelvin), system entropy approaches a minimum constant.`,
    tags: ['Physics', 'Thermodynamics', 'Laws of Motion'],
    isPinned: false,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  }
];
