import { useMemo } from 'react';
import { useUserSettings } from './useUserSettings';
import type {
  CareerStatus,
  OfferDetails,
  EmploymentDetails,
  CareerStateData,
} from '../types/career';
import { getDefaultJobSearchEnabled } from '../types/career';

export const useCareerStatus = () => {
  const { settings, loading, updateSettings } = useUserSettings();

  const careerStatus: CareerStatus = (settings?.careerStatus as CareerStatus) || 'SEARCHING';

  const jobSearchEnabled: boolean = useMemo(() => {
    if (typeof settings?.jobSearchEnabled === 'boolean') {
      return settings.jobSearchEnabled;
    }
    return getDefaultJobSearchEnabled(careerStatus);
  }, [settings?.jobSearchEnabled, careerStatus]);

  const offerDetails = settings?.offerDetails;
  const employmentDetails = settings?.employmentDetails;

  /**
   * Set a new career status.
   * By default, updates jobSearchEnabled to default behavior:
   * SEARCHING: true
   * OFFER_RECEIVED: true
   * OFFER_ACCEPTED: false
   * WORKING: false
   * NOT_SEARCHING: false
   * Allows explicit override if passed.
   */
  const setCareerStatus = async (
    newStatus: CareerStatus,
    options?: {
      offerDetails?: OfferDetails;
      employmentDetails?: EmploymentDetails;
      explicitJobSearchEnabled?: boolean;
    }
  ) => {
    const targetSearchEnabled =
      typeof options?.explicitJobSearchEnabled === 'boolean'
        ? options.explicitJobSearchEnabled
        : getDefaultJobSearchEnabled(newStatus);

    const nowIso = new Date().toISOString();
    const wasEnabled = jobSearchEnabled;

    const payload: Partial<CareerStateData> = {
      careerStatus: newStatus,
      jobSearchEnabled: targetSearchEnabled,
      careerStatusUpdatedAt: nowIso,
    };

    if (options?.offerDetails !== undefined) {
      payload.offerDetails = options.offerDetails;
    }
    if (options?.employmentDetails !== undefined) {
      payload.employmentDetails = options.employmentDetails;
    }

    if (wasEnabled && !targetSearchEnabled) {
      payload.jobSearchPausedAt = nowIso;
    } else if (!wasEnabled && targetSearchEnabled) {
      payload.jobSearchResumedAt = nowIso;
    }

    await updateSettings(payload);
  };

  /**
   * Manually toggle job search regardless of career status
   */
  const toggleJobSearch = async (enabled: boolean) => {
    const nowIso = new Date().toISOString();
    const payload: Partial<CareerStateData> = {
      jobSearchEnabled: enabled,
    };
    if (enabled) {
      payload.jobSearchResumedAt = nowIso;
    } else {
      payload.jobSearchPausedAt = nowIso;
    }
    await updateSettings(payload);
  };

  /**
   * Job switching support:
   * "Start Looking for New Opportunities"
   * Sets jobSearchEnabled to true, keeps careerStatus as WORKING,
   * preserves employment details, records timestamp.
   */
  const startLookingForOpportunities = async () => {
    const nowIso = new Date().toISOString();
    await updateSettings({
      jobSearchEnabled: true,
      jobSearchResumedAt: nowIso,
    });
  };

  const updateOfferDetails = async (details: OfferDetails) => {
    await updateSettings({
      offerDetails: details,
    });
  };

  const updateEmploymentDetails = async (details: EmploymentDetails) => {
    await updateSettings({
      employmentDetails: details,
    });
  };

  return {
    careerStatus,
    jobSearchEnabled,
    offerDetails,
    employmentDetails,
    careerStatusUpdatedAt: settings?.careerStatusUpdatedAt,
    jobSearchPausedAt: settings?.jobSearchPausedAt,
    jobSearchResumedAt: settings?.jobSearchResumedAt,
    loading,
    setCareerStatus,
    toggleJobSearch,
    startLookingForOpportunities,
    updateOfferDetails,
    updateEmploymentDetails,
  };
};

