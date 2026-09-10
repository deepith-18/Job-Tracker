import type {
  CompanyRoundDocument,
  InterviewRoundSection,
  ParsedRoundQuestion,
  QuestionCategoryType,
  CodingLanguage,
  QuestionRejectionLearning,
  RejectionCategory,
} from '../types';

/**
 * Normalizes coding language identifier
 */
function normalizeLanguage(lang?: string): CodingLanguage {
  if (!lang) return 'python';
  const clean = lang.trim().toLowerCase();
  if (clean.includes('js') || clean.includes('javascript')) return 'javascript';
  if (clean.includes('ts') || clean.includes('typescript')) return 'typescript';
  if (clean.includes('py') || clean.includes('python')) return 'python';
  if (clean.includes('java') && !clean.includes('script')) return 'java';
  if (clean.includes('c++') || clean.includes('cpp')) return 'cpp';
  if (clean.includes('go') || clean.includes('golang')) return 'go';
  if (clean.includes('sql') || clean.includes('postgres') || clean.includes('mysql')) return 'sql';
  if (clean.includes('rust')) return 'rust';
  return 'python';
}

/**
 * Classifies the question into Theory, Coding, System Design, or Behavioral
 */
function detectQuestionType(
  questionTitle: string,
  rawContent: string,
  hasCodeBlock: boolean
): QuestionCategoryType {
  const combined = `${questionTitle} ${rawContent}`.toLowerCase();

  // Explicit label checks
  if (combined.includes('[theory]') || combined.includes('type: theory') || combined.includes('**theory') || combined.includes('theoretical')) {
    return 'Theory & Concepts';
  }
  if (combined.includes('[coding]') || combined.includes('type: coding') || combined.includes('[dsa]') || combined.includes('leetcode')) {
    return 'Coding & DSA';
  }
  if (combined.includes('[system design]') || combined.includes('system design') || combined.includes('high level design') || combined.includes('hld') || combined.includes('architecture')) {
    return 'System Design';
  }
  if (combined.includes('[behavioral]') || combined.includes('behavioral') || combined.includes('star method') || combined.includes('tell me about a time') || combined.includes('googliness')) {
    return 'Behavioral & Leadership';
  }

  // System Design heuristic
  if (
    combined.includes('design a ') ||
    combined.includes('distributed cache') ||
    combined.includes('load balancer') ||
    combined.includes('rate limiter') ||
    combined.includes('microservices') ||
    combined.includes('database sharding')
  ) {
    return 'System Design';
  }

  // Behavioral heuristic
  if (
    combined.includes('conflict with') ||
    combined.includes('disagreed with') ||
    combined.includes('failure or mistake') ||
    combined.includes('leadership principle') ||
    combined.includes('proudest project') ||
    combined.includes('worked with a difficult')
  ) {
    return 'Behavioral & Leadership';
  }

  // Theory heuristic: conceptual, mathematical, algorithmic definitions without code
  const theoryKeywords = [
    'what is',
    'what are',
    'explain how',
    'how does',
    'difference between',
    'vs',
    'why do we',
    'why did you',
    'pros and cons',
    'trade-off',
    'virtual dom',
    'reconciliation',
    'event loop',
    'closure',
    'garbage collection',
    'acid',
    'cap theorem',
    'indexing',
    'b-tree',
    'lsm-tree',
    'concurrency',
    'deadlock',
    'race condition',
    'optimistic locking',
    'tcp handshake',
    'cors',
    'jwt',
    'oauth',
    'solid principles',
    'rest vs graphql',
  ];

  const hasTheoryKeyword = theoryKeywords.some((kw) => combined.includes(kw));

  if (hasTheoryKeyword && (!hasCodeBlock || combined.includes('explain') || combined.includes('concept'))) {
    return 'Theory & Concepts';
  }

  // If there is an explicit code block or coding words
  if (hasCodeBlock || combined.includes('write a function') || combined.includes('implement ') || combined.includes('algorithm') || combined.includes('in-place') || combined.includes('time complexity')) {
    return 'Coding & DSA';
  }

  // Default to Theory if it looks like a question/conceptual discussion, else General
  return hasTheoryKeyword ? 'Theory & Concepts' : 'General';
}

/**
 * Detects difficulty level
 */
function detectDifficulty(text: string): 'Easy' | 'Medium' | 'Hard' {
  const lower = text.toLowerCase();
  if (lower.includes('difficulty: hard') || lower.includes('[hard]')) return 'Hard';
  if (lower.includes('difficulty: easy') || lower.includes('[easy]')) return 'Easy';
  if (lower.includes('difficulty: medium') || lower.includes('[medium]')) return 'Medium';
  if (lower.includes('dp') || lower.includes('dynamic programming') || lower.includes('distributed lock') || lower.includes('raft') || lower.includes('trie')) return 'Hard';
  if (lower.includes('two sum') || lower.includes('palindrome') || lower.includes('reverse string')) return 'Easy';
  return 'Medium';
}

/**
 * Extracts category from question content
 */
function detectCategory(title: string, content: string, type: QuestionCategoryType): string {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes('react') || text.includes('frontend') || text.includes('dom') || text.includes('css') || text.includes('javascript') || text.includes('typescript')) {
    return 'React & Frontend';
  }
  if (text.includes('sql') || text.includes('database') || text.includes('postgres') || text.includes('acid') || text.includes('index') || text.includes('redis')) {
    return 'Database & Caching';
  }
  if (text.includes('distributed') || text.includes('system design') || text.includes('microservice') || text.includes('kafka') || text.includes('sharding')) {
    return 'Distributed Systems & Architecture';
  }
  if (text.includes('array') || text.includes('tree') || text.includes('graph') || text.includes('linked list') || text.includes('dp') || text.includes('pointer')) {
    return 'Data Structures & Algorithms';
  }
  if (text.includes('star') || text.includes('behavioral') || text.includes('conflict') || text.includes('culture') || text.includes('leadership')) {
    return 'Behavioral & Leadership';
  }
  if (text.includes('network') || text.includes('http') || text.includes('tcp') || text.includes('security') || text.includes('auth')) {
    return 'Networking & Security';
  }
  return type === 'Theory & Concepts' ? 'Core CS Fundamentals' : 'Software Engineering';
}

/**
 * Parses individual question block
 */
function parseQuestionBlock(rawBlock: string, questionIndex: number): ParsedRoundQuestion | null {
  const lines = rawBlock.split('\n');
  if (lines.length === 0) return null;

  // First non-empty line is usually the question title
  let titleLine = lines[0].replace(/^###+\s*/, '').replace(/^\*\*Q\d*[:.]?\s*/i, '').replace(/^\d+\.\s*/, '').trim();
  titleLine = titleLine.replace(/^Question\s*\d*[:.]?\s*/i, '').trim();
  titleLine = titleLine.replace(/\*\*/g, '').trim();

  if (!titleLine) return null;

  // Extract Code Blocks
  let codeSnippet: string | undefined;
  let codeLanguage: CodingLanguage = 'python';
  const codeRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/m;
  const codeMatch = rawBlock.match(codeRegex);
  if (codeMatch) {
    codeLanguage = normalizeLanguage(codeMatch[1]);
    codeSnippet = codeMatch[2].trim();
  }

  // Extract Key Concepts
  const keyConcepts: string[] = [];
  const conceptsMatch = rawBlock.match(/\*\*(?:Key Concepts|Concepts|Keywords|Topics):\*\*\s*([^\n]+)/i);
  if (conceptsMatch) {
    const list = conceptsMatch[1].split(/[,;•|]/).map((s) => s.trim().replace(/^[-*]\s*/, '').replace(/`|\*/g, '')).filter(Boolean);
    keyConcepts.push(...list);
  }

  // Extract Complexities
  let timeComplexity: string | undefined;
  let spaceComplexity: string | undefined;
  const tcMatch = rawBlock.match(/(?:Time Complexity|TC):\s*([O0]\([^)]+\)|[^\n,]+)/i);
  if (tcMatch) timeComplexity = tcMatch[1].trim().replace(/\*\*/g, '');
  const scMatch = rawBlock.match(/(?:Space Complexity|SC):\s*([O0]\([^)]+\)|[^\n,]+)/i);
  if (scMatch) spaceComplexity = scMatch[1].trim().replace(/\*\*/g, '');

  // Extract Follow-ups
  const followUps: string[] = [];
  const followUpMatch = rawBlock.match(/\*\*(?:Follow-up[s]?|Interviewer Follow-ups?):\*\*\s*([\s\S]*?)(?=(?:\n###|\n\*\*|$))/i);
  if (followUpMatch) {
    const lines = followUpMatch[1].split('\n').map((l) => l.trim().replace(/^[-*•]\s*/, '').replace(/\*\*/g, '')).filter(Boolean);
    followUps.push(...lines);
  }

  // Extract Answer / Notes / Explanation
  let answer = '';
  const answerSectionMatch = rawBlock.match(/\*\*(?:Answer|Model Answer|Explanation|Notes|Key Takeaway):\*\*([\s\S]*?)(?=(?:\n```|\n\*\*(?:Key Concepts|Follow-up|Time Complexity)|$))/i);
  if (answerSectionMatch) {
    answer = answerSectionMatch[1].trim();
  } else {
    // If no explicit Answer header, use all lines that aren't code blocks or metadata
    const cleanLines = lines.slice(1).filter((l) => !l.startsWith('```') && !l.toLowerCase().includes('time complexity:') && !l.toLowerCase().includes('space complexity:'));
    answer = cleanLines.join('\n').trim();
  }

/**
 * Derives rejection lessons, common mistakes, and improvement checklists
 */
function deriveRejectionLearning(
  _title: string,
  rawBlock: string,
  type: QuestionCategoryType,
  category: string
): QuestionRejectionLearning {
  // Check for explicit fields in the markdown
  const mistakeMatch = rawBlock.match(/\*\*(?:Mistake|Identified Mistake|Rejection Reason|Rejection Trap|Common Mistake|Pitfall):\*\*\s*([^\n]+)/i);
  const learnMatch = rawBlock.match(/\*\*(?:What to Learn|Lesson|Action Item|Improvement|Key Learning|Action Plan):\*\*\s*([^\n]+)/i);

  if (mistakeMatch && learnMatch) {
    let cat: RejectionCategory = 'Theory Gap';
    if (type === 'Coding & DSA') cat = 'Complexity Suboptimal';
    if (type === 'System Design') cat = 'System Architecture Flaw';
    if (type === 'Behavioral & Leadership') cat = 'Behavioral Alignment';

    return {
      identifiedMistake: mistakeMatch[1].trim().replace(/\*\*/g, ''),
      whatToLearn: learnMatch[1].trim().replace(/\*\*/g, ''),
      category: cat,
      correctiveAction: [
        'Practice articulating underlying trade-offs explicitly before answering',
        'Review edge-case matrix and boundary condition handling',
      ],
    };
  }

  // Domain-specific intelligent fallbacks based on question type & category:
  if (type === 'Theory & Concepts') {
    if (category.includes('React') || category.includes('Frontend')) {
      return {
        identifiedMistake: 'Giving shallow surface definitions without explaining internal mechanics (e.g. Fiber reconciliation, batched updates, synthetic events).',
        whatToLearn: 'Master how the engine works under the hood. Be able to contrast Virtual DOM reconciliation O(N) vs linear heuristics, and explain memory/CPU implications of memoization.',
        category: 'Theory Gap',
        correctiveAction: [
          'Diagram the Virtual DOM diffing steps vs actual DOM commit phases',
          'Explain why useCallback/useMemo have memory overhead and when NOT to use them',
          'Highlight real production performance metrics (FPS, LCP, INP) impacted',
        ],
      };
    }
    if (category.includes('Database') || category.includes('SQL')) {
      return {
        identifiedMistake: 'Failing to explain storage engine trade-offs (B-Tree vs LSM-Tree, WAL, read/write amplification) or transaction isolation levels.',
        whatToLearn: 'Study database internals: write-ahead logging, index selectivity, page splitting, and ACID isolation levels (Dirty Reads vs Non-Repeatable vs Phantom Reads).',
        category: 'Theory Gap',
        correctiveAction: [
          'Be prepared to analyze EXPLAIN ANALYZE query plans and index coverage',
          'Articulate when to choose optimistic concurrency control vs pessimistic locks',
          'Detail data consistency trade-offs across distributed nodes',
        ],
      };
    }
    return {
      identifiedMistake: 'Reciting textbook definitions rather than explaining real-world trade-offs, failure modes, and architectural implications.',
      whatToLearn: 'Structure theory answers into 3 parts: 1) Core mechanism, 2) Why it exists / alternative approaches, 3) Production trade-offs and failure modes.',
      category: 'Theory Gap',
      correctiveAction: [
        'Memorize core CS mental models (CAP theorem, Amdahl’s law, memory hierarchy latency numbers)',
        'Reference concrete production scenarios where this concept prevented a system failure',
      ],
    };
  }

  if (type === 'System Design') {
    return {
      identifiedMistake: 'Jumping straight to drawing microservices without clarifying non-functional requirements (throughput, availability SLA, read/write ratio).',
      whatToLearn: 'Follow the 4-step framework: 1) Scope & Back-of-the-envelope math, 2) High-level data flow, 3) Deep-dive into single point of failure (SPOF), 4) Latency & caching strategy.',
      category: 'System Architecture Flaw',
      correctiveAction: [
        'Calculate QPS and storage requirements in the first 5 minutes',
        'Always design for failure: rate limiters, circuit breakers, idempotency keys, and dead-letter queues',
        'Justify why you selected NoSQL vs Relational for each specific data access pattern',
      ],
    };
  }

  if (type === 'Behavioral & Leadership') {
    return {
      identifiedMistake: 'Using generic "we" statements instead of specific personal actions, or failing to quantify the business and engineering result.',
      whatToLearn: 'Strictly anchor your narrative in the STAR method: quantify the Result with concrete metrics (latency reduced by X%, revenue protected by $Y, team delivery accelerated by Z weeks).',
      category: 'Behavioral Alignment',
      correctiveAction: [
        'Prepare 5 versatile stories mapped to core leadership principles (Conflict, Ambiguity, Failure, Customer Obsession)',
        'Demonstrate extreme ownership: acknowledge mistakes candidly and emphasize what systems you put in place to prevent repeat issues',
      ],
    };
  }

  // Coding & DSA
  return {
    identifiedMistake: 'Jumping straight to coding without proving time/space complexity upfront, or failing on edge cases (null inputs, empty bounds, duplicates).',
    whatToLearn: 'Always state time and space complexity upfront. Write down edge cases on the board/editor BEFORE writing a single line of code, and dry-run with a concrete example.',
    category: 'Complexity Suboptimal',
    correctiveAction: [
      'Proactively test with empty array, duplicate elements, large inputs, and negative numbers',
      'Refactor into clean helper functions with self-documenting variable names',
      'Explain space-time trade-offs aloud as you type',
    ],
  };
}

  // Detect Type & Category
  const type = detectQuestionType(titleLine, rawBlock, Boolean(codeSnippet));
  const difficulty = detectDifficulty(rawBlock);
  const category = detectCategory(titleLine, rawBlock, type);

  // Fallback key concepts if none found
  if (keyConcepts.length === 0) {
    if (category) keyConcepts.push(category);
    if (type === 'Theory & Concepts') keyConcepts.push('Theory & Concept');
    if (codeLanguage && codeSnippet) keyConcepts.push(codeLanguage.toUpperCase());
  }

  const rejectionLearning = deriveRejectionLearning(titleLine, rawBlock, type, category);

  return {
    id: `q-${questionIndex}-${Date.now().toString(36)}`,
    questionNumber: questionIndex,
    question: titleLine,
    type,
    difficulty,
    category,
    keyConcepts: Array.from(new Set(keyConcepts)).slice(0, 5),
    answer: answer || 'Comprehensive notes and rationale discussed during the round.',
    codeSnippet,
    codeLanguage,
    timeComplexity,
    spaceComplexity,
    followUps: followUps.length > 0 ? followUps : undefined,
    rejectionLearning,
  };
}

/**
 * Main parser function to convert raw Markdown into structured CompanyRoundDocument
 */
export function parseInterviewMarkdown(
  markdownText: string,
  fileName: string = 'interview_notes.md'
): CompanyRoundDocument {
  const cleanText = markdownText.replace(/\r\n/g, '\n').trim();

  // 1. Detect Company Name & Role
  let company = 'Target Company';
  let role = 'Software Engineer';
  let interviewDate = new Date().toISOString().split('T')[0];

  const firstHeaderMatch = cleanText.match(/^#\s+(.*?)$/m);
  if (firstHeaderMatch) {
    const rawHeader = firstHeaderMatch[1].replace(/[🎯🔥📌💼🚀✨]/g, '').trim();

    // Check for separators: em-dash (—), en-dash (–), hyphen (-), colon (:), pipe (|)
    const sepMatch = rawHeader.match(/\s*([—–|:-])\s*/);
    if (sepMatch && sepMatch.index !== undefined && sepMatch.index > 0) {
      const part1 = rawHeader.slice(0, sepMatch.index).trim();
      const part2 = rawHeader.slice(sepMatch.index + sepMatch[0].length).trim();

      // If part1 looks like company name
      company = part1.replace(/Interview.*$/i, '').trim() || part1;

      // Check if part2 is a role or generic "Interview Questions"
      if (
        part2.toLowerCase().includes('interview question') ||
        part2.toLowerCase().includes('interview notes') ||
        part2.toLowerCase().includes('debrief')
      ) {
        role = 'Software Engineer';
      } else {
        role = part2.replace(/Interview.*$/i, '').trim() || role;
      }
    } else {
      // Clean company from title without separator
      company = rawHeader
        .replace(/\s*Interview\s*(Questions|Debrief|Notes).*$/i, '')
        .trim();
    }
  }

  // Look for metadata fields in markdown (e.g. **Company:** SecPod)
  const companyFieldMatch = cleanText.match(/(?:Company|Employer|Organization):\s*([^\n]+)/i);
  if (companyFieldMatch) company = companyFieldMatch[1].replace(/\*\*/g, '').trim();

  const roleFieldMatch = cleanText.match(/(?:Role|Position|Level|Job Title):\s*([^\n]+)/i);
  if (roleFieldMatch) role = roleFieldMatch[1].replace(/\*\*/g, '').trim();

  const dateFieldMatch = cleanText.match(/(?:Date|Interview Date):\s*([^\n]+)/i);
  if (dateFieldMatch) interviewDate = dateFieldMatch[1].replace(/\*\*/g, '').trim();

  // 2. Split into Sections / Rounds
  // Support ANY markdown level-2 heading (## ...) as a section/round
  // If no ## exists, split by level-3 (### ...) or treat entire doc as a comprehensive section
  let rawSections: string[] = [];
  const hasH2 = /(?:^|\n)##\s+/.test(cleanText);

  if (hasH2) {
    rawSections = cleanText.split(/(?=(?:^|\n)##\s+)/).filter((s) => s.trim().length > 0);
  } else {
    const hasH3 = /(?:^|\n)###\s+/.test(cleanText);
    if (hasH3) {
      rawSections = cleanText.split(/(?=(?:^|\n)###\s+)/).filter((s) => s.trim().length > 0);
    } else {
      rawSections = [cleanText];
    }
  }

  const parsedRounds: InterviewRoundSection[] = [];
  let overallOverview = '';
  let globalQuestionCount = 0;

  // Process each section
  rawSections.forEach((section, index) => {
    const trimmed = section.trim();
    const lines = trimmed.split('\n');
    const firstLine = lines[0] || '';

    // If section 0 starts with # (doc title) and contains preamble text before ## sections
    if (index === 0 && rawSections.length > 1 && !firstLine.startsWith('##') && !firstLine.toLowerCase().includes('round')) {
      overallOverview = trimmed.replace(/^#\s+[^\n]+\n?/, '').slice(0, 500).trim();
      return;
    }

    // Determine round number and clean title
    let roundNum = parsedRounds.length + 1;
    let roundTitle = firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();

    const numMatch = roundTitle.match(/(?:Round\s*(\d+)|(\d+)(?:st|nd|rd|th)\s*Round)/i);
    if (numMatch) {
      const parsedNum = parseInt(numMatch[1] || numMatch[2], 10);
      if (!isNaN(parsedNum)) roundNum = parsedNum;
    }

    if (!roundTitle || roundTitle.length < 3) {
      roundTitle = `Round ${roundNum}: Technical & Theory Assessment`;
    }

    // Determine Round Type
    let roundType: InterviewRoundSection['roundType'] = 'Technical / DSA';
    const lowerTitle = roundTitle.toLowerCase();
    if (lowerTitle.includes('screen') || lowerTitle.includes('phone') || lowerTitle.includes('initial')) {
      roundType = 'Screening';
    } else if (lowerTitle.includes('system design') || lowerTitle.includes('architecture') || lowerTitle.includes('scaling')) {
      roundType = 'System Design';
    } else if (lowerTitle.includes('behavioral') || lowerTitle.includes('manager') || lowerTitle.includes('culture') || lowerTitle.includes('hr') || lowerTitle.includes('leadership')) {
      roundType = 'Behavioral / HR';
    } else if (lowerTitle.includes('theory') || lowerTitle.includes('concept') || lowerTitle.includes('fundamental') || lowerTitle.includes('react') || lowerTitle.includes('database') || lowerTitle.includes('os') || lowerTitle.includes('linux')) {
      roundType = 'Theory & Core CS';
    }

    // Extract questions inside this section
    // Split by ###, ####, **Q..., or numbered items (1. , 2. )
    const questionSplitRegex = /(?=(?:^|\n)(?:###+\s+|(?:\*\*Q\d*[:.]?\s*)|(?:\d+\.\s+(?:\*\*|Q|\w))|(?:Question\s+\d+[:.])))/i;
    const rawQuestionBlocks = trimmed.replace(firstLine, '').split(questionSplitRegex);

    let roundNotes = '';
    const roundQuestions: ParsedRoundQuestion[] = [];

    rawQuestionBlocks.forEach((block, qIdx) => {
      const bTrimmed = block.trim();
      if (!bTrimmed) return;

      // If the first block doesn't start with a question indicator, treat as Round Notes / Intro
      if (qIdx === 0 && !bTrimmed.startsWith('###') && !bTrimmed.match(/^\*\*Q/i) && !bTrimmed.match(/^\d+\.\s/i) && !bTrimmed.match(/^Question/i)) {
        roundNotes = bTrimmed;
        return;
      }

      globalQuestionCount++;
      const parsedQ = parseQuestionBlock(bTrimmed, globalQuestionCount);
      if (parsedQ) {
        roundQuestions.push(parsedQ);
      }
    });

    // Fallback: If no sub-question blocks were split, check for bullet points or numbered lines
    if (roundQuestions.length === 0 && trimmed.length > 30) {
      const itemMatches = trimmed.match(/(?:^|\n)(?:[-*•]|\d+\.)\s+([^\n]+)/g);
      if (itemMatches && itemMatches.length > 0) {
        itemMatches.forEach((item) => {
          const qText = item.replace(/^(?:[-*•]|\d+\.)\s+/, '').replace(/\*\*/g, '').trim();
          if (qText.length > 8) {
            globalQuestionCount++;
            roundQuestions.push({
              id: `q-${globalQuestionCount}-${Date.now().toString(36)}`,
              questionNumber: globalQuestionCount,
              question: qText,
              type: detectQuestionType(qText, '', false),
              difficulty: detectDifficulty(qText),
              category: detectCategory(qText, '', 'Theory & Concepts'),
              keyConcepts: ['Interview Question', 'Discussion'],
              answer: 'Discussed architectural trade-offs, implementation details, and core mechanics with the interviewer.',
            });
          }
        });
      }
    }

    // If still no questions, create a representative card for the section
    if (roundQuestions.length === 0) {
      globalQuestionCount++;
      roundQuestions.push({
        id: `q-${globalQuestionCount}-${Date.now().toString(36)}`,
        questionNumber: globalQuestionCount,
        question: roundTitle,
        type: roundType === 'Theory & Core CS' ? 'Theory & Concepts' : 'General',
        difficulty: 'Medium',
        category: 'Core Engineering',
        keyConcepts: ['Interview Assessment'],
        answer: trimmed.slice(0, 600) || 'Interview evaluation and questions covered in this round.',
      });
    }

    parsedRounds.push({
      roundNumber: roundNum,
      roundTitle,
      roundType,
      roundNotes: roundNotes || 'Comprehensive evaluation covering conceptual depth, problem solving, and trade-offs.',
      questions: roundQuestions,
    });
  });

  // Ultimate guarantee: parsedRounds is NEVER empty
  if (parsedRounds.length === 0) {
    parsedRounds.push({
      roundNumber: 1,
      roundTitle: 'Round 1: Technical & Engineering Assessment',
      roundType: 'Technical / DSA',
      roundNotes: 'Interview debrief and evaluation notes.',
      questions: [
        {
          id: `q-1-${Date.now().toString(36)}`,
          questionNumber: 1,
          question: `${company} Technical Interview Debrief`,
          type: 'Theory & Concepts',
          difficulty: 'Medium',
          category: 'Core CS Fundamentals',
          keyConcepts: ['Interview Debrief', company],
          answer: cleanText.slice(0, 800) || 'Detailed interview notes and debrief.',
        },
      ],
    });
  }

  // Compute question metrics
  let totalQuestions = 0;
  let theoryQuestionsCount = 0;
  let codingQuestionsCount = 0;

  parsedRounds.forEach((r) => {
    totalQuestions += r.questions.length;
    r.questions.forEach((q) => {
      if (q.type === 'Theory & Concepts') theoryQuestionsCount++;
      else if (q.type === 'Coding & DSA') codingQuestionsCount++;
    });
  });

  return {
    id: `doc-${Date.now().toString(36)}`,
    fileName,
    company,
    role,
    interviewDate,
    overview: overallOverview || `Interview notes covering ${parsedRounds.length} consecutive rounds and ${totalQuestions} technical & theory questions.`,
    totalRounds: parsedRounds.length,
    totalQuestions,
    theoryQuestionsCount,
    codingQuestionsCount,
    rawMarkdown: markdownText,
    rounds: parsedRounds,
  };
}
