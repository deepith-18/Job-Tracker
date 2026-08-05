export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'OA/Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Wishlist', 'Applied', 'OA/Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn',
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
  'Referral',
  'Company Site',
  'Cold Apply',
  'Indeed',
  'Glassdoor',
  'Recruiter Contact',
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

