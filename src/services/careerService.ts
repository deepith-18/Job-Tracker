import type {
  CareerStatus,
  OfferDetails,
  EmploymentDetails,
  CareerStateData,
} from '../types/career';
import { getDefaultJobSearchEnabled } from '../types/career';

/**
 * Prepares an update object when transitioning to a new career status.
 * Automatically aligns jobSearchEnabled to default if not explicitly provided,
 * and tracks appropriate pause/resume timestamps.
 */
export const buildCareerStatusTransition = (
  newStatus: CareerStatus,
  currentData: Partial<CareerStateData>,
  explicitSearchEnabled?: boolean,
  offerDetails?: OfferDetails,
  employmentDetails?: EmploymentDetails
): Partial<CareerStateData> => {
  const targetSearchEnabled =
    typeof explicitSearchEnabled === 'boolean'
      ? explicitSearchEnabled
      : getDefaultJobSearchEnabled(newStatus);

  const nowIso = new Date().toISOString();
  const wasEnabled = currentData.jobSearchEnabled ?? true;

  const update: Partial<CareerStateData> = {
    careerStatus: newStatus,
    jobSearchEnabled: targetSearchEnabled,
    careerStatusUpdatedAt: nowIso,
  };

  if (offerDetails !== undefined) {
    update.offerDetails = offerDetails;
  }
  if (employmentDetails !== undefined) {
    update.employmentDetails = employmentDetails;
  }

  // Update timestamps when search status changes
  if (wasEnabled && !targetSearchEnabled) {
    update.jobSearchPausedAt = nowIso;
  } else if (!wasEnabled && targetSearchEnabled) {
    update.jobSearchResumedAt = nowIso;
  }

  return update;
};

/**
 * Validates that an offer details entry has at least basic required fields
 */
export const isValidOfferDetails = (details?: OfferDetails): boolean => {
  if (!details) return true; // optional
  return Boolean(details.company?.trim());
};

/**
 * Validates that an employment details entry has at least company name
 */
export const isValidEmploymentDetails = (details?: EmploymentDetails): boolean => {
  if (!details) return true; // optional
  return Boolean(details.company?.trim());
};

