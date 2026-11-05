export type CareerStatus =
  | 'SEARCHING'
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'WORKING'
  | 'NOT_SEARCHING';

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Internship'
  | 'Contract'
  | 'Freelance'
  | 'Other';

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Freelance',
  'Other',
];

export interface OfferDetails {
  company: string;
  role: string;
  offerDate?: string;
  deadline?: string;             // Offer response deadline (for OFFER_RECEIVED)
  acceptanceDate?: string;       // For OFFER_ACCEPTED
  expectedJoiningDate?: string;  // For OFFER_ACCEPTED
  employmentType?: EmploymentType;
  compensation?: string;
  notes?: string;
}

export interface EmploymentDetails {
  company: string;
  role: string;                  // Current job role / designation
  employmentType: EmploymentType;
  joiningDate?: string;
  workLocation?: string;         // City / Remote / Hybrid
  department?: string;
  notes?: string;
}

export interface CareerStateData {
  careerStatus: CareerStatus;
  jobSearchEnabled: boolean;
  offerDetails?: OfferDetails;
  employmentDetails?: EmploymentDetails;
  careerStatusUpdatedAt?: string;
  jobSearchPausedAt?: string;
  jobSearchResumedAt?: string;
}

export const CAREER_STATUS_METADATA: Record<
  CareerStatus,
  {
    label: string;
    description: string;
    badgeColor: string;
    badgeBg: string;
    defaultSearchEnabled: boolean;
  }
> = {
  SEARCHING: {
    label: 'Actively Searching',
    description: 'Actively exploring market opportunities and submitting applications.',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    defaultSearchEnabled: true,
  },
  OFFER_RECEIVED: {
    label: 'Offer Received',
    description: 'Received a written job offer and evaluating next career steps.',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    defaultSearchEnabled: true,
  },
  OFFER_ACCEPTED: {
    label: 'Offer Accepted',
    description: 'Accepted an offer and preparing for the upcoming start date.',
    badgeColor: '#0ea5e9',
    badgeBg: 'rgba(14, 165, 233, 0.12)',
    defaultSearchEnabled: false,
  },
  WORKING: {
    label: 'Currently Employed',
    description: 'Actively employed in role; can search for opportunities anytime.',
    badgeColor: '#059669',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    defaultSearchEnabled: false,
  },
  NOT_SEARCHING: {
    label: 'Search Paused',
    description: 'Temporarily taking a break from interviews and job applications.',
    badgeColor: '#64748b',
    badgeBg: 'rgba(100, 116, 139, 0.12)',
    defaultSearchEnabled: false,
  },
};

export const getDefaultJobSearchEnabled = (status: CareerStatus): boolean => {
  return CAREER_STATUS_METADATA[status]?.defaultSearchEnabled ?? true;
};

