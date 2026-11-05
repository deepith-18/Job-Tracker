import React, { useState, useEffect } from 'react';
import {
  Compass,
  Award,
  Building,
  PauseCircle,
  Briefcase,
  Check,
  Sparkles,
} from 'lucide-react';
import { useCareerStatus } from '../../hooks/useCareerStatus';
import {
  CAREER_STATUS_METADATA,
  EMPLOYMENT_TYPES,
  type CareerStatus,
  type EmploymentType,
  type OfferDetails,
  type EmploymentDetails,
} from '../../types/career';
import { useToast } from '../ui/ToastContext';

export const CareerStatusSettingsSection: React.FC = () => {
  const {
    careerStatus,
    jobSearchEnabled,
    offerDetails,
    employmentDetails,
    setCareerStatus,
    startLookingForOpportunities,
  } = useCareerStatus();
  const { addToast } = useToast();

  // Local form state
  const [selectedStatus, setSelectedStatus] = useState<CareerStatus>(careerStatus);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(jobSearchEnabled);

  // Offer fields
  const [offerCompany, setOfferCompany] = useState('');
  const [offerRole, setOfferRole] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [offerDeadline, setOfferDeadline] = useState('');
  const [acceptanceDate, setAcceptanceDate] = useState('');
  const [expectedJoiningDate, setExpectedJoiningDate] = useState('');
  const [offerEmploymentType, setOfferEmploymentType] = useState<EmploymentType>('Full-time');

  // Employment fields
  const [workingCompany, setWorkingCompany] = useState('');
  const [workingRole, setWorkingRole] = useState('');
  const [workingType, setWorkingType] = useState<EmploymentType>('Full-time');
  const [workingJoiningDate, setWorkingJoiningDate] = useState('');
  const [workingLocation, setWorkingLocation] = useState('');

  const [saving, setSaving] = useState(false);

  // Sync when hook values change
  useEffect(() => {
    setSelectedStatus(careerStatus);
    setIsSearchActive(jobSearchEnabled);

    if (offerDetails) {
      setOfferCompany(offerDetails.company || '');
      setOfferRole(offerDetails.role || '');
      setOfferDate(offerDetails.offerDate || '');
      setOfferDeadline(offerDetails.deadline || '');
      setAcceptanceDate(offerDetails.acceptanceDate || '');
      setExpectedJoiningDate(offerDetails.expectedJoiningDate || '');
      if (offerDetails.employmentType) {
        setOfferEmploymentType(offerDetails.employmentType);
      }
    }

    if (employmentDetails) {
      setWorkingCompany(employmentDetails.company || '');
      setWorkingRole(employmentDetails.role || '');
      if (employmentDetails.employmentType) {
        setWorkingType(employmentDetails.employmentType);
      }
      setWorkingJoiningDate(employmentDetails.joiningDate || '');
      setWorkingLocation(employmentDetails.workLocation || '');
    }
  }, [careerStatus, jobSearchEnabled, offerDetails, employmentDetails]);

  // When user clicks a different status tab, auto-adjust the search enabled state by default
  const handleStatusSelect = (status: CareerStatus) => {
    setSelectedStatus(status);
    const defaultSearch = CAREER_STATUS_METADATA[status]?.defaultSearchEnabled ?? true;
    setIsSearchActive(defaultSearch);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      let finalOfferDetails: OfferDetails | undefined = undefined;
      let finalEmploymentDetails: EmploymentDetails | undefined = undefined;

      if (selectedStatus === 'OFFER_RECEIVED') {
        finalOfferDetails = {
          company: offerCompany.trim(),
          role: offerRole.trim(),
          offerDate: offerDate || undefined,
          deadline: offerDeadline || undefined,
        };
      } else if (selectedStatus === 'OFFER_ACCEPTED') {
        finalOfferDetails = {
          company: offerCompany.trim(),
          role: offerRole.trim(),
          acceptanceDate: acceptanceDate || undefined,
          expectedJoiningDate: expectedJoiningDate || undefined,
          employmentType: offerEmploymentType,
        };
      }

      if (selectedStatus === 'WORKING') {
        finalEmploymentDetails = {
          company: workingCompany.trim(),
          role: workingRole.trim(),
          employmentType: workingType,
          joiningDate: workingJoiningDate || undefined,
          workLocation: workingLocation.trim() || undefined,
        };
      }

      await setCareerStatus(selectedStatus, {
        offerDetails: finalOfferDetails || offerDetails,
        employmentDetails: finalEmploymentDetails || employmentDetails,
        explicitJobSearchEnabled: isSearchActive,
      });

      addToast(
        'Career Status Updated',
        `Your status is now ${CAREER_STATUS_METADATA[selectedStatus].label}. Settings synced successfully.`,
        'success'
      );
    } catch {
      addToast('Update Failed', 'Failed to save career status. Please check your connection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleJobSwitchingClick = async () => {
    try {
      await startLookingForOpportunities();
      setIsSearchActive(true);
      addToast(
        'Looking for Opportunities Activated',
        'You remain marked as employed at your company while active job searching is unlocked.',
        'success'
      );
    } catch {
      addToast('Error', 'Failed to enable job search.', 'error');
    }
  };

  const statuses: { id: CareerStatus; label: string; icon: React.FC<{ size?: number }> }[] = [
    { id: 'SEARCHING', label: '1. Searching', icon: Compass },
    { id: 'OFFER_RECEIVED', label: '2. Offer Received', icon: Award },
    { id: 'OFFER_ACCEPTED', label: '3. Offer Accepted', icon: Award },
    { id: 'WORKING', label: '4. Currently Working', icon: Building },
    { id: 'NOT_SEARCHING', label: '5. Search Paused', icon: PauseCircle },
  ];

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase style={{ width: 18, height: 18, color: 'var(--accent)' }} />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              Career Status & Employment Lifecycle
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: '2px 0 0 0' }}>
              Track whether you are searching, evaluating offers, placed, or exploring new opportunities as an employed engineer.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 20,
              background: CAREER_STATUS_METADATA[careerStatus]?.badgeBg,
              color: CAREER_STATUS_METADATA[careerStatus]?.badgeColor,
              border: `1px solid ${CAREER_STATUS_METADATA[careerStatus]?.badgeColor}35`,
            }}
          >
            Current: {CAREER_STATUS_METADATA[careerStatus]?.label}
          </span>
        </div>
      </div>

      {/* ── Status Picker Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {statuses.map((st) => {
          const isSelected = selectedStatus === st.id;
          const meta = CAREER_STATUS_METADATA[st.id];
          const IconComponent = st.icon;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleStatusSelect(st.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 12,
                cursor: 'pointer',
                background: isSelected ? meta.badgeBg : 'var(--page)',
                border: isSelected ? `2px solid ${meta.badgeColor}` : '1px solid var(--border)',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                <div style={{ color: isSelected ? meta.badgeColor : 'var(--t3)' }}>
                  <IconComponent size={18} />
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: meta.badgeColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} strokeWidth={3} />
                  </div>
                )}
              </div>

              <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? 'var(--t1)' : 'var(--t2)' }}>
                {meta.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4, lineHeight: 1.3 }}>
                {meta.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Contextual Details Form Based on Selected Status ── */}
      <div
        style={{
          background: 'var(--page)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
        }}
      >
        {/* Status 1: SEARCHING */}
        {selectedStatus === 'SEARCHING' && (
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
              Active Job Search Pipeline
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: 0, lineHeight: 1.5 }}>
              You are actively pursuing employment. Application creation is unlocked and daily deadline / interview reminders are enabled.
            </p>
          </div>
        )}

        {/* Status 2: OFFER_RECEIVED */}
        {selectedStatus === 'OFFER_RECEIVED' && (
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>
              Offer Received Details (Optional)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div>
                <label className="lbl">Offering Company</label>
                <input
                  className="inp"
                  value={offerCompany}
                  onChange={(e) => setOfferCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Startup"
                />
              </div>

              <div>
                <label className="lbl">Offered Job Role</label>
                <input
                  className="inp"
                  value={offerRole}
                  onChange={(e) => setOfferRole(e.target.value)}
                  placeholder="e.g. Software Engineer, SDE II"
                />
              </div>

              <div>
                <label className="lbl">Offer Received Date</label>
                <input
                  type="date"
                  className="inp"
                  value={offerDate}
                  onChange={(e) => setOfferDate(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl">Offer Response Deadline</label>
                <input
                  type="date"
                  className="inp"
                  value={offerDeadline}
                  onChange={(e) => setOfferDeadline(e.target.value)}
                />
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 10, marginBottom: 0 }}>
              * You can continue applying for other jobs while in this status.
            </p>
          </div>
        )}

        {/* Status 3: OFFER_ACCEPTED */}
        {selectedStatus === 'OFFER_ACCEPTED' && (
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>
              Accepted Offer Details (Optional)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div>
                <label className="lbl">Hiring Company</label>
                <input
                  className="inp"
                  value={offerCompany}
                  onChange={(e) => setOfferCompany(e.target.value)}
                  placeholder="e.g. Stripe, Amazon"
                />
              </div>

              <div>
                <label className="lbl">Accepted Role / Designation</label>
                <input
                  className="inp"
                  value={offerRole}
                  onChange={(e) => setOfferRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                />
              </div>

              <div>
                <label className="lbl">Employment Type</label>
                <select
                  className="inp"
                  value={offerEmploymentType}
                  onChange={(e) => setOfferEmploymentType(e.target.value as EmploymentType)}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="lbl">Offer Acceptance Date</label>
                <input
                  type="date"
                  className="inp"
                  value={acceptanceDate}
                  onChange={(e) => setAcceptanceDate(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl">Expected Joining Date</label>
                <input
                  type="date"
                  className="inp"
                  value={expectedJoiningDate}
                  onChange={(e) => setExpectedJoiningDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 10 }}>
              * Offer acceptance pauses new applications by default. You can resume search at any time below.
            </div>
          </div>
        )}

        {/* Status 4: WORKING */}
        {selectedStatus === 'WORKING' && (
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>
              Current Employment Record (Optional)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div>
                <label className="lbl">Current Company Name</label>
                <input
                  className="inp"
                  value={workingCompany}
                  onChange={(e) => setWorkingCompany(e.target.value)}
                  placeholder="e.g. Meta, Cisco, Databricks"
                />
              </div>

              <div>
                <label className="lbl">Designation / Role</label>
                <input
                  className="inp"
                  value={workingRole}
                  onChange={(e) => setWorkingRole(e.target.value)}
                  placeholder="e.g. Member of Technical Staff"
                />
              </div>

              <div>
                <label className="lbl">Employment Type</label>
                <select
                  className="inp"
                  value={workingType}
                  onChange={(e) => setWorkingType(e.target.value as EmploymentType)}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="lbl">Joining Date</label>
                <input
                  type="date"
                  className="inp"
                  value={workingJoiningDate}
                  onChange={(e) => setWorkingJoiningDate(e.target.value)}
                />
              </div>

              <div>
                <label className="lbl">Work Location</label>
                <input
                  className="inp"
                  value={workingLocation}
                  onChange={(e) => setWorkingLocation(e.target.value)}
                  placeholder="e.g. Seattle, WA (Hybrid) or Remote"
                />
              </div>
            </div>
          </div>
        )}

        {/* Status 5: NOT_SEARCHING */}
        {selectedStatus === 'NOT_SEARCHING' && (
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
              Job Search Paused
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--t2)', margin: 0, lineHeight: 1.5 }}>
              All new application submissions and reminders are put on pause. Your historical records and analytics remain fully preserved.
            </p>
          </div>
        )}
      </div>

      {/* ── Independent Job Search Control & Job Switching ── */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          marginBottom: 20,
          background: isSearchActive ? 'rgba(16, 185, 129, 0.04)' : 'rgba(100, 116, 139, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--t1)' }}>
                Independent Job Search Control
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: isSearchActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                  color: isSearchActive ? '#059669' : '#64748b',
                }}
              >
                {isSearchActive ? 'ENABLED' : 'PAUSED'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--t2)', margin: '4px 0 0 0' }}>
              Control whether new application submissions and reminders are allowed, independently of your career status.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setIsSearchActive(!isSearchActive)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              cursor: 'pointer',
              border: isSearchActive ? '1px solid #10b981' : '1px solid var(--border)',
              background: isSearchActive ? '#10b981' : 'var(--card)',
              color: isSearchActive ? '#fff' : 'var(--t2)',
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
          >
            {isSearchActive ? (
              <>
                <Check size={14} />
                <span>Job Search Active</span>
              </>
            ) : (
              <>
                <PauseCircle size={14} />
                <span>Job Search Paused</span>
              </>
            )}
          </button>
        </div>

        {/* Employed User Job Switching Special Action */}
        {selectedStatus === 'WORKING' && !isSearchActive && (
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#047857' }}>
                Currently Employed & Thinking About Your Next Step?
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 2 }}>
                Keep your current employment details saved while activating application submission and pipeline tracking.
              </div>
            </div>

            <button
              type="button"
              onClick={handleJobSwitchingClick}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 700,
                background: '#059669',
                borderColor: '#047857',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} />
              <span>Start Looking for New Opportunities</span>
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 20px',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {saving ? 'Saving...' : 'Save Career Status'}
        </button>
      </div>
    </div>
  );
};
