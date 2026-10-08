import { Flashcard } from '../types';

export const INITIAL_FLASHCARDS: Flashcard[] = [
  // Math Flashcards
  {
    id: 'fc-m1',
    subject: 'Math',
    topic: 'Calculus',
    front: 'What is the Product Rule for differentiation?',
    back: 'd/dx [f(x) · g(x)] = f\'(x)g(x) + f(x)g\'(x)',
    hint: 'Derivative of first times second plus first times derivative of second.',
    mastery: 'new'
  },
  {
    id: 'fc-m2',
    subject: 'Math',
    topic: 'Calculus',
    front: 'What is the Chain Rule for composite functions?',
    back: 'd/dx [f(g(x))] = f\'(g(x)) · g\'(x)',
    hint: 'Differentiate outer keeping inner intact, then multiply by derivative of inner.',
    mastery: 'learning'
  },
  {
    id: 'fc-m3',
    subject: 'Math',
    topic: 'Geometry & Trig',
    front: 'What is Euler\'s formula for polyhedra?',
    back: 'V - E + F = 2 (Vertices - Edges + Faces = 2)',
    hint: 'Applies to any convex 3D polyhedron.',
    mastery: 'new'
  },
  {
    id: 'fc-m4',
    subject: 'Math',
    topic: 'Algebra',
    front: 'What is the Quadratic Formula for ax² + bx + c = 0?',
    back: 'x = (-b ± √(b² - 4ac)) / (2a)',
    hint: 'b² - 4ac is called the discriminant.',
    mastery: 'mastered'
  },

  // Science Flashcards
  {
    id: 'fc-s1',
    subject: 'Science',
    topic: 'Physics',
    front: 'Newton\'s Second Law of Motion',
    back: 'F = m · a (Net force equals mass times acceleration)',
    hint: 'Measured in Newtons (kg·m/s²).',
    mastery: 'mastered'
  },
  {
    id: 'fc-s2',
    subject: 'Science',
    topic: 'Chemistry',
    front: 'What is Avogadro\'s Number and what does it represent?',
    back: '6.022 × 10²³ particles per mole of substance.',
    hint: 'Relates macroscopic mass to microscopic atom counts.',
    mastery: 'learning'
  },
  {
    id: 'fc-s3',
    subject: 'Science',
    topic: 'Biology',
    front: 'What is the central dogma of molecular biology?',
    back: 'DNA → (Transcription) → RNA → (Translation) → Protein',
    hint: 'Directional flow of genetic genetic information.',
    mastery: 'learning'
  },
  {
    id: 'fc-s4',
    subject: 'Science',
    topic: 'Physics',
    front: 'What is Snell\'s Law for optical refraction?',
    back: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)',
    hint: 'Relates refractive indices and angles of incidence and refraction.',
    mastery: 'new'
  },

  // Computer Science Flashcards
  {
    id: 'fc-cs1',
    subject: 'Computer Science',
    topic: 'Data Structures',
    front: 'What is a Hash Collision and how is it resolved?',
    back: 'When two distinct keys produce the same hash index. Handled via Separate Chaining (linked lists) or Open Addressing (linear/quadratic probing).',
    hint: 'Two keys hashing to the same slot.',
    mastery: 'learning'
  },
  {
    id: 'fc-cs2',
    subject: 'Computer Science',
    topic: 'Algorithms',
    front: 'What is the Big-O time complexity of Binary Search?',
    back: 'O(log n) time complexity, requiring a sorted array/collection.',
    hint: 'Halves the search space each step.',
    mastery: 'mastered'
  },
  {
    id: 'fc-cs3',
    subject: 'Computer Science',
    topic: 'Web Development',
    front: 'What is the purpose of CORS (Cross-Origin Resource Sharing)?',
    back: 'A browser security mechanism that uses HTTP headers to tell browsers whether requests from other origins are permitted to access resources.',
    hint: 'Security restriction enforced by web browsers.',
    mastery: 'new'
  },
  {
    id: 'fc-cs4',
    subject: 'Computer Science',
    topic: 'Databases & SQL',
    front: 'What is the difference between SQL and NoSQL?',
    back: 'SQL: Relational, structured schema, ACID compliance, table-based. NoSQL: Non-relational, flexible schema (document, key-value, graph), high horizontal scalability.',
    hint: 'Relational tables vs document/graph/key-value models.',
    mastery: 'learning'
  },

  // English Flashcards
  {
    id: 'fc-e1',
    subject: 'English',
    topic: 'Literary Devices',
    front: 'What is a Synecdoche vs Metonymy?',
    back: 'Synecdoche: A part represents the whole (e.g. "all hands on deck"). Metonymy: An associated concept represents the thing (e.g. "The White House announced").',
    hint: 'Part-for-whole vs association-for-whole.',
    mastery: 'learning'
  },
  {
    id: 'fc-e2',
    subject: 'English',
    topic: 'Vocabulary & Etymology',
    front: 'What does "Ubiquitous" mean?',
    back: 'Present, appearing, or found everywhere; omnipresent.',
    hint: 'Derived from Latin "ubique" meaning everywhere.',
    mastery: 'mastered'
  },
  {
    id: 'fc-e3',
    subject: 'English',
    topic: 'Grammar & Syntax',
    front: 'What is an active voice vs passive voice sentence?',
    back: 'Active: The subject performs the action ("The dog bit the ball"). Passive: The subject receives the action ("The ball was bitten by the dog").',
    hint: 'Actor leading sentence vs target leading sentence.',
    mastery: 'mastered'
  },

  // History Flashcards
  {
    id: 'fc-h1',
    subject: 'History',
    topic: 'Industrial Revolution',
    front: 'What invention by James Watt in 1776 became the driving engine of industrialization?',
    back: 'The separate condenser steam engine, vastly improving fuel efficiency and mechanical power output.',
    hint: 'Mechanical power replacing human and animal labor.',
    mastery: 'learning'
  },
  {
    id: 'fc-h2',
    subject: 'History',
    topic: 'Ancient Civilizations',
    front: 'What was the Rosetta Stone and why was its discovery monumental?',
    back: 'A granodiorite stele with the same decree carved in Ancient Greek, Demotic, and Hieroglyphic, unlocking decipherment of Egyptian hieroglyphs by Champollion in 1822.',
    hint: 'Found in 1799 in Egypt, containing three script versions.',
    mastery: 'mastered'
  },
  {
    id: 'fc-h3',
    subject: 'History',
    topic: 'World Wars',
    front: 'What was the Manhattan Project?',
    back: 'The secret World War II research and development program led by the US (with UK and Canada) that produced the first nuclear weapons.',
    hint: 'Directed by J. Robert Oppenheimer and General Leslie Groves.',
    mastery: 'learning'
  },

  // General Knowledge Flashcards
  {
    id: 'fc-gk1',
    subject: 'General Knowledge',
    topic: 'Astronomy & Space',
    front: 'What is the Event Horizon of a black hole?',
    back: 'The boundary threshold around a black hole beyond which no matter or electromagnetic radiation (light) can escape the gravitational pull.',
    hint: 'The point of no return.',
    mastery: 'mastered'
  },
  {
    id: 'fc-gk2',
    subject: 'General Knowledge',
    topic: 'Geography',
    front: 'What is the longest river in the world by consensus?',
    back: 'The Nile River (~6,650 km / 4,132 miles) in northeast Africa, closely followed by the Amazon River.',
    hint: 'Flows north through 11 African countries.',
    mastery: 'learning'
  }
];
