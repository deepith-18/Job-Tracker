export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'OA/Assessment'
  | 'Interview'
  | 'Offer'
  | 'Ghosted'
  | 'Rejected'
  | 'Withdrawn';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Wishlist', 'Applied', 'OA/Assessment', 'Interview', 'Offer', 'Ghosted', 'Rejected', 'Withdrawn',
];

// Linear journey steps (non-terminal)
export const JOURNEY_STEPS: ApplicationStatus[] = [
  'Wishlist', 'Applied', 'OA/Assessment', 'Interview', 'Offer',
];

export const REJECTION_REASONS = [
  'Weak DSA', 'SQL gaps', 'System Design', 'Communication',
  'OOP / Design Patterns', 'Networking / OS', 'Resume', 'Confidence',
  'Wrong fit', 'Other',
];

export const COMMON_SOURCES = [
  'LinkedIn',
  'Indeed',
  'Company Site',
  'Glassdoor',
  'Greenhouse',
  'Lever',
  'Workday',
  'Ashby',
  'ZipRecruiter',
  'Wellfound',
  'Referral',
  'Cold Apply',
  'Recruiter Contact',
  'Browser Extension',
  'Other',
];

export interface Application {
  id: string;
  uid: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: Date | null;
  deadline: Date | null;
  jobLink: string;
  notes: string;
  interviewNotes: string;
  source: string;
  rating: number;           // 1-5, dream factor
  rejectionReasons: string[];
  interviewDates?: (Date | string)[];
  firstResponseDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationFormData = Omit<Application, 'id' | 'uid' | 'createdAt' | 'updatedAt'>;

export type SortKey = 'updatedAt' | 'deadline' | 'status' | 'company' | 'rating';
export type ViewMode = 'kanban' | 'table' | 'cards';

export type DateRangeOption = 'all' | '7d' | '30d' | '90d' | 'year';
export type RoleTypeOption = 'all' | 'Software Engineer' | 'Frontend' | 'Backend' | 'Full Stack' | 'Product' | 'Data' | 'Design' | 'Other';

export interface AnalyticsFilter {
  dateRange: DateRangeOption;
  source: string;
  roleType: string;
  status: ApplicationStatus | 'All';
}

export type CodingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'go'
  | 'sql'
  | 'rust';

export interface InterviewCodeQuestion {
  id: string;
  uid?: string;
  title: string;
  company: string;
  round: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  language: CodingLanguage;
  code: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  approach: string;
  followUps?: string;
  isStarred: boolean;
  dateAdded: string;
  applicationId?: string;
}

export type QuestionCategoryType =
  | 'Theory & Concepts'
  | 'Coding & DSA'
  | 'System Design'
  | 'Behavioral & Leadership'
  | 'General';

export type RejectionCategory =
  | 'Theory Gap'
  | 'Edge Case Failure'
  | 'Complexity Suboptimal'
  | 'Communication & Tradeoffs'
  | 'System Architecture Flaw'
  | 'Behavioral Alignment';

export interface QuestionRejectionLearning {
  identifiedMistake: string;
  whatToLearn: string;
  category: RejectionCategory;
  correctiveAction: string[];
}

export interface ParsedRoundQuestion {
  id: string;
  questionNumber: number;
  question: string;
  type: QuestionCategoryType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  keyConcepts: string[];
  answer: string;
  codeSnippet?: string;
  codeLanguage?: CodingLanguage;
  timeComplexity?: string;
  spaceComplexity?: string;
  followUps?: string[];
  isStarred?: boolean;
  rejectionLearning?: QuestionRejectionLearning;
}

export interface InterviewRoundSection {
  roundNumber: number;
  roundTitle: string;
  roundType: 'Screening' | 'Technical / DSA' | 'Theory & Core CS' | 'System Design' | 'Behavioral / HR';
  roundNotes: string;
  interviewerRole?: string;
  commonPitfalls?: string[];
  roundTakeaway?: string;
  questions: ParsedRoundQuestion[];
}

export interface CompanyRoundDocument {
  id: string;
  fileName: string;
  company: string;
  role: string;
  interviewDate?: string;
  overview: string;
  status?: 'Rejected' | 'Offer' | 'In Progress' | 'Debrief';
  totalRounds: number;
  totalQuestions: number;
  theoryQuestionsCount: number;
  codingQuestionsCount: number;
  rawMarkdown: string;
  rounds: InterviewRoundSection[];
  overallRejectionAnalysis?: {
    primaryMistakes: string[];
    growthAreas: string[];
    actionableRoadmap: string[];
  };
  isEmpty?: boolean;
}



