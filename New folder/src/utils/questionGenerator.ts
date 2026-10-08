import { Question, Subject, Difficulty } from '../types';

export interface TemplateDefinition {
  id: string;
  name: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  description: string;
  generate: () => Question;
}

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Random integer between min and max inclusive
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const QUESTION_TEMPLATES: TemplateDefinition[] = [
  // 1. Math: Quadratic Equation Factoring
  {
    id: 'tpl-math-quadratic',
    name: 'Quadratic Equation Roots',
    subject: 'Math',
    topic: 'Algebra',
    difficulty: 'Medium',
    description: 'Generates quadratic equations x² + bx + c = 0 with integer roots.',
    generate: () => {
      const r1 = randomInt(-7, 7) || 2;
      let r2 = randomInt(-7, 7) || 3;
      if (r1 === r2) r2 += 1;

      // (x - r1)(x - r2) = x² - (r1+r2)x + r1*r2 = 0
      const b = -(r1 + r2);
      const c = r1 * r2;
      const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
      const eqStr = `x² ${bSign}x ${cSign} = 0`;

      const correctStr = `x = ${r1} and x = ${r2}`;
      const distractor1 = `x = ${-r1} and x = ${-r2}`;
      const distractor2 = `x = ${r1 + 1} and x = ${r2 - 1}`;
      const distractor3 = `x = ${r1 * 2} and x = ${r2}`;

      const options = shuffle([correctStr, distractor1, distractor2, distractor3]);

      return {
        id: `gen-quad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'Math',
        topic: 'Algebra',
        difficulty: 'Medium',
        type: 'mcq',
        question: `Find the real roots of the quadratic equation: ${eqStr}`,
        options,
        correctAnswer: correctStr,
        explanation: `Factor the equation as (x - ${r1})(x - ${r2}) = 0. Setting each factor to 0 gives roots x = ${r1} and x = ${r2}.`,
        formula: `(x - (${r1}))(x - (${r2})) = 0 \\implies x_1 = ${r1}, \\, x_2 = ${r2}`
      };
    }
  },

  // 2. Math: Polynomial Derivative
  {
    id: 'tpl-math-derivative',
    name: 'Polynomial Differentiation',
    subject: 'Math',
    topic: 'Calculus',
    difficulty: 'Medium',
    description: 'Generates polynomial functions and calculates the first derivative.',
    generate: () => {
      const a = randomInt(2, 6);
      const n = randomInt(3, 5);
      const b = randomInt(2, 8);
      const c = randomInt(1, 9);

      const f_x = `${a}x^${n} - ${b}x + ${c}`;
      const d_coef = a * n;
      const d_exp = n - 1;
      const correctStr = `${d_coef}x^${d_exp} - ${b}`;

      const distractor1 = `${d_coef}x^${n} - ${b}`;
      const distractor2 = `${a * (n - 1)}x^${d_exp} - ${b}`;
      const distractor3 = `${d_coef}x^${d_exp} + ${c}`;

      const options = shuffle([correctStr, distractor1, distractor2, distractor3]);

      return {
        id: `gen-deriv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'Math',
        topic: 'Calculus',
        difficulty: 'Medium',
        type: 'mcq',
        question: `Find the derivative f'(x) for f(x) = ${f_x}`,
        options,
        correctAnswer: correctStr,
        explanation: `Using the power rule d/dx[a·x^n] = a·n·x^(n-1): d/dx[${a}x^${n}] = ${d_coef}x^${d_exp}, d/dx[-${b}x] = -${b}, and constant d/dx[${c}] = 0.`,
        formula: `f'(x) = ${d_coef}x^{${d_exp}} - ${b}`
      };
    }
  },

  // 3. CS: Binary to Decimal Conversion
  {
    id: 'tpl-cs-binary',
    name: 'Binary to Decimal Conversion',
    subject: 'Computer Science',
    topic: 'Data Structures',
    difficulty: 'Easy',
    description: 'Generates 6-to-8 bit binary strings and converts to base-10 decimal.',
    generate: () => {
      const decValue = randomInt(18, 127);
      const binaryStr = decValue.toString(2).padStart(8, '0');

      const correctStr = `${decValue}`;
      const distractor1 = `${decValue + randomInt(2, 6)}`;
      const distractor2 = `${Math.max(1, decValue - randomInt(2, 5))}`;
      const distractor3 = `${decValue + 16}`;

      const options = shuffle(Array.from(new Set([correctStr, distractor1, distractor2, distractor3])));
      while (options.length < 4) {
        options.push(`${decValue + options.length * 3}`);
      }

      return {
        id: `gen-bin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'Computer Science',
        topic: 'Data Structures',
        difficulty: 'Easy',
        type: 'mcq',
        question: `Convert the 8-bit binary number ${binaryStr}₂ into its decimal (base-10) equivalent:`,
        options,
        correctAnswer: correctStr,
        explanation: `Multiply each bit by 2^position from right to left (2⁰ to 2⁷). Summing active bit weights gives: ${decValue}.`,
        codeSnippet: `// Binary representation\n0b${binaryStr} === ${decValue}`
      };
    }
  },

  // 4. CS: Loop Time Complexity
  {
    id: 'tpl-cs-complexity',
    name: 'Algorithm Loop Complexity',
    subject: 'Computer Science',
    topic: 'Algorithms',
    difficulty: 'Medium',
    description: 'Generates algorithmic loop constructs and tests Big-O runtime knowledge.',
    generate: () => {
      const patterns = [
        {
          code: 'for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    count++;\n  }\n}',
          ans: 'O(n²)',
          distractors: ['O(n)', 'O(n log n)', 'O(log n)'],
          exp: 'Two nested loops each iterating from 0 to n result in n × n operations, which is quadratic time O(n²).'
        },
        {
          code: 'let i = 1;\nwhile (i < n) {\n  i = i * 2;\n}',
          ans: 'O(log n)',
          distractors: ['O(n)', 'O(n²)', 'O(1)'],
          exp: 'The loop variable doubles on each iteration (1, 2, 4, 8, ...), requiring log₂(n) steps to reach n.'
        },
        {
          code: 'for (let i = 0; i < n; i++) {\n  let j = 1;\n  while (j < n) {\n    j = j * 2;\n  }\n}',
          ans: 'O(n log n)',
          distractors: ['O(n²)', 'O(log n)', 'O(n³)'],
          exp: 'The outer loop executes n times. The inner while loop runs in logarithmic time O(log n). Total time is O(n log n).'
        }
      ];

      const chosen = patterns[randomInt(0, patterns.length - 1)];
      const options = shuffle([chosen.ans, ...chosen.distractors]);

      return {
        id: `gen-comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'Computer Science',
        topic: 'Algorithms',
        difficulty: 'Medium',
        type: 'mcq',
        question: 'What is the worst-case asymptotic time complexity of the following code snippet?',
        options,
        correctAnswer: chosen.ans,
        explanation: chosen.exp,
        codeSnippet: chosen.code
      };
    }
  },

  // 5. Science: Kinetic Energy Calculation
  {
    id: 'tpl-sci-ke',
    name: 'Kinetic Energy Calculation',
    subject: 'Science',
    topic: 'Physics',
    difficulty: 'Easy',
    description: 'Generates mass and velocity values and computes kinetic energy in Joules.',
    generate: () => {
      const mass = randomInt(2, 10);
      const velocity = randomInt(3, 12);
      const ke = 0.5 * mass * Math.pow(velocity, 2);

      const correctStr = `${ke} J`;
      const distractor1 = `${mass * velocity} J`;
      const distractor2 = `${ke * 2} J`;
      const distractor3 = `${0.5 * mass * velocity} J`;

      const options = shuffle([correctStr, distractor1, distractor2, distractor3]);

      return {
        id: `gen-ke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'Science',
        topic: 'Physics',
        difficulty: 'Easy',
        type: 'mcq',
        question: `Calculate the kinetic energy of an object with a mass of ${mass} kg travelling at a velocity of ${velocity} m/s:`,
        options,
        correctAnswer: correctStr,
        explanation: `Using E_k = 0.5 × m × v²: E_k = 0.5 × ${mass} kg × (${velocity} m/s)² = 0.5 × ${mass} × ${velocity * velocity} = ${ke} Joules.`,
        formula: `E_k = \\frac{1}{2} m v^2 = \\frac{1}{2}(${mass})(${velocity}^2) = ${ke}\\,\\text{J}`
      };
    }
  },

  // 6. Science: Ohm's Law Resistance
  {
    id: 'tpl-sci-ohms',
    name: "Ohm's Law Circuit Calculation",
    subject: 'Science',
    topic: 'Physics',
    difficulty: 'Medium',
    description: "Computes Voltage, Current, or Resistance using Ohm's law V = I · R.",
    generate: () => {
      const resistance = randomInt(4, 25);
      const current = randomInt(2, 8);
      const voltage = resistance * current;

      const correctStr = `${resistance} Ω`;
      const distractor1 = `${resistance + 5} Ω`;
      const distractor2 = `${Math.round(voltage / 2)} Ω`;
      const distractor3 = `${voltage * current} Ω`;

      const options = shuffle([correctStr, distractor1, distractor2, distractor3]);

      return {
        id: `gen-ohms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'Science',
        topic: 'Physics',
        difficulty: 'Medium',
        type: 'mcq',
        question: `An electrical circuit has a voltage supply of ${voltage} V with a measured current flow of ${current} A. What is the circuit resistance?`,
        options,
        correctAnswer: correctStr,
        explanation: `By Ohm's Law V = I × R, rearrange for R = V / I. Here, R = ${voltage} V / ${current} A = ${resistance} Ω.`,
        formula: `R = \\frac{V}{I} = \\frac{${voltage}\\,\\text{V}}{${current}\\,\\text{A}} = ${resistance}\\,\\Omega`
      };
    }
  },

  // 7. English: Vocabulary Antonyms
  {
    id: 'tpl-eng-antonym',
    name: 'Vocabulary Antonym Pairs',
    subject: 'English',
    topic: 'Vocabulary & Etymology',
    difficulty: 'Medium',
    description: 'Generates vocabulary antonym challenges with context.',
    generate: () => {
      const wordBank = [
        { word: 'GREGARIOUS', def: 'sociable, fond of company', antonym: 'Introverted', distractors: ['Voluble', 'Convivial', 'Altruistic'] },
        { word: 'CANDID', def: 'truthful and straightforward; frank', antonym: 'Deceitful', distractors: ['Blunt', 'Direct', 'Sincere'] },
        { word: 'PROLIFIC', def: 'producing much fruit or foliage or many works', antonym: 'Unproductive', distractors: ['Abundant', 'Fertile', 'Fecund'] },
        { word: 'LACONIC', def: 'using very few words; concise', antonym: 'Verbose', distractors: ['Terse', 'Succinct', 'Brief'] },
        { word: 'EPHEMERAL', def: 'lasting for a very short time', antonym: 'Permanent', distractors: ['Transient', 'Fleeting', 'Evanescent'] }
      ];

      const item = wordBank[randomInt(0, wordBank.length - 1)];
      const options = shuffle([item.antonym, ...item.distractors]);

      return {
        id: `gen-ant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'English',
        topic: 'Vocabulary & Etymology',
        difficulty: 'Medium',
        type: 'mcq',
        question: `Select the word that is directly OPPOSITE in meaning (antonym) to: "${item.word}" (${item.def}).`,
        options,
        correctAnswer: item.antonym,
        explanation: `"${item.word}" means ${item.def}. The direct opposite is "${item.antonym}". The other choices are synonyms or unrelated.`
      };
    }
  },

  // 8. General Knowledge: World Geography / Capitals
  {
    id: 'tpl-gk-capitals',
    name: 'World Capitals & Nations',
    subject: 'General Knowledge',
    topic: 'Geography',
    difficulty: 'Easy',
    description: 'Generates geography questions testing capital cities across global nations.',
    generate: () => {
      const geoPairs = [
        { country: 'Australia', capital: 'Canberra', distractors: ['Sydney', 'Melbourne', 'Brisbane'] },
        { country: 'Canada', capital: 'Ottawa', distractors: ['Toronto', 'Vancouver', 'Montreal'] },
        { country: 'Brazil', capital: 'Brasília', distractors: ['Rio de Janeiro', 'São Paulo', 'Salvador'] },
        { country: 'Turkey', capital: 'Ankara', distractors: ['Istanbul', 'Izmir', 'Antalya'] },
        { country: 'Switzerland', capital: 'Bern', distractors: ['Zurich', 'Geneva', 'Basel'] },
        { country: 'New Zealand', capital: 'Wellington', distractors: ['Auckland', 'Christchurch', 'Queenstown'] }
      ];

      const item = geoPairs[randomInt(0, geoPairs.length - 1)];
      const options = shuffle([item.capital, ...item.distractors]);

      return {
        id: `gen-cap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: 'General Knowledge',
        topic: 'Geography',
        difficulty: 'Easy',
        type: 'mcq',
        question: `What is the official capital city of ${item.country}?`,
        options,
        correctAnswer: item.capital,
        explanation: `The capital of ${item.country} is ${item.capital}. Often people mistake larger economic hubs like ${item.distractors[0]} for the administrative capital.`,
      };
    }
  }
];

export function generateCustomQuestions(count: number, subjectFilter?: Subject): Question[] {
  let available = QUESTION_TEMPLATES;
  if (subjectFilter) {
    const filtered = available.filter(t => t.subject === subjectFilter);
    if (filtered.length > 0) available = filtered;
  }

  const generated: Question[] = [];
  for (let i = 0; i < count; i++) {
    const template = available[i % available.length];
    generated.push(template.generate());
  }
  return generated;
}
