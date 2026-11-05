import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Compass,
  Building,
  MapPin,
  Play,
  PauseCircle,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { useCareerStatus } from '../../hooks/useCareerStatus';
import { CAREER_STATUS_METADATA } from '../../types/career';
import { useToast } from '../ui/ToastContext';

export const CareerStatusDashboardCard: React.FC = () => {
  const {
    careerStatus,
    jobSearchEnabled,
    offerDetails,
    employmentDetails,
    toggleJobSearch,
    startLookingForOpportunities,
  } = useCareerStatus();
  const { addToast } = useToast();

  const meta = CAREER_STATUS_METADATA[careerStatus] || CAREER_STATUS_METADATA.SEARCHING;

  const handleStartJobSwitching = async () => {
    try {
      await startLookingForOpportunities();
      addToast(
        'Job Search Enabled',
        'You can now apply and track new opportunities while maintaining your current employment profile.',
        'success'
      );
    } catch {
      addToast('Error', 'Failed to enable job search. Please try again.', 'error');
    }
  };

  const handleToggleSearch = async (enable: boolean) => {
    try {
      await toggleJobSearch(enable);
      addToast(
        enable ? 'Job Search Resumed' : 'Job Search Paused',
        enable
          ? 'New application creation and search tracking have been re-enabled.'
          : 'New applications and job reminders have been temporarily paused.',
        'info'
      );
    } catch {
      addToast('Error', 'Failed to update job search state.', 'error');
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        borderLeft: `4px solid ${meta.badgeColor}`,
        background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: meta.badgeBg,
              color: meta.badgeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {careerStatus === 'WORKING' ? (
              <Building size={16} />
            ) : careerStatus === 'OFFER_RECEIVED' || careerStatus === 'OFFER_ACCEPTED' ? (
              <Award size={16} />
            ) : (
              <Compass size={16} />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: meta.badgeBg,
                  color: meta.badgeColor,
                  border: `1px solid ${meta.badgeColor}33`,
                }}
              >
                {meta.label}
              </span>

              {/* Employed-but-searching indicator */}
              {careerStatus === 'WORKING' && jobSearchEnabled && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                  title="Employed and actively exploring new opportunities"
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #10b981',
                    }}
                  />
                  <span>Exploring Opportunities</span>
                </span>
              )}

              {/* Generic Paused Indicator */}
              {!jobSearchEnabled && careerStatus !== 'WORKING' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(100, 116, 139, 0.12)',
                    color: '#64748b',
                  }}
                >
                  <PauseCircle size={11} />
                  <span>Search Paused</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action / Link to Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/profile"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Update Status</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Dynamic Content Based on Career Status */}

      {/* 1. SEARCHING */}
      {careerStatus === 'SEARCHING' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>
            You are actively applying for positions. Pipeline submissions and interview tracking are fully active.
          </div>
          <div>
            {jobSearchEnabled ? (
              <button
                type="button"
                onClick={() => handleToggleSearch(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <PauseCircle size={13} />
                <span>Pause Job Search</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleSearch(true)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <Play size={13} fill="currentColor" />
                <span>Resume Job Search</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. OFFER_RECEIVED */}
      {careerStatus === 'OFFER_RECEIVED' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>
                {offerDetails?.company || 'Company'}
              </div>
              {offerDetails?.role && (
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                  • {offerDetails.role}
                </div>
              )}
              {offerDetails?.offerDate && (
                <div style={{ fontSize: 12, color: 'var(--t3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  <span>Received: {offerDetails.offerDate}</span>
                </div>
              )}
            </div>

            {offerDetails?.deadline && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 9px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <Clock size={13} />
                <span>Deadline: {offerDetails.deadline}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--t2)' }}>
            <span>You can continue applying to other roles while evaluating this offer.</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/offer-calculator" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, padding: '3px 8px' }}>
                Compare Offer
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. OFFER_ACCEPTED */}
      {careerStatus === 'OFFER_ACCEPTED' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>
                {offerDetails?.company || 'Company'}
              </div>
              {offerDetails?.role && (
                <div style={{ fontSize: 13, color: '#0ea5e9', fontWeight: 600 }}>
                  • {offerDetails.role}
                </div>
              )}
              {offerDetails?.employmentType && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'var(--page)',
                    border: '1px solid var(--border)',
                    color: 'var(--t2)',
                  }}
                >
                  {offerDetails.employmentType}
                </span>
              )}
            </div>

            {offerDetails?.expectedJoiningDate && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 9px',
                  borderRadius: 8,
                  background: 'rgba(14, 165, 233, 0.1)',
                  color: '#0284c7',
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                }}
              >
                <Calendar size={13} />
                <span>Expected Joining: {offerDetails.expectedJoiningDate}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              {jobSearchEnabled
                ? 'Job search is currently active. You may manage new applications.'
                : 'Offer accepted! New applications are paused until joining. You can resume search at any time.'}
            </div>

            <button
              type="button"
              onClick={() => handleToggleSearch(!jobSearchEnabled)}
              className="btn btn-sm btn-ghost"
              style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              {jobSearchEnabled ? <PauseCircle size={13} /> : <Play size={13} fill="currentColor" />}
              <span>{jobSearchEnabled ? 'Pause Applications' : 'Resume Applications'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. WORKING (Currently Employed) */}
      {careerStatus === 'WORKING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>
                {employmentDetails?.company || 'Current Company'}
              </div>
              {employmentDetails?.role && (
                <div style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
                  • {employmentDetails.role}
                </div>
              )}
              {employmentDetails?.employmentType && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'var(--page)',
                    border: '1px solid var(--border)',
                    color: 'var(--t2)',
                  }}
                >
                  {employmentDetails.employmentType}
                </span>
              )}
              {employmentDetails?.workLocation && (
                <div style={{ fontSize: 12, color: 'var(--t3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} />
                  <span>{employmentDetails.workLocation}</span>
                </div>
              )}
              {employmentDetails?.joiningDate && (
                <div style={{ fontSize: 12, color: 'var(--t3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} />
                  <span>Joined: {employmentDetails.joiningDate}</span>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              paddingTop: 4,
            }}
          >
            <div style={{ fontSize: 12.5, color: 'var(--t2)' }}>
              {jobSearchEnabled
                ? 'You are currently employed while actively looking for new opportunities. Application submission is enabled.'
                : 'Job search is currently paused. Looking to explore next career steps without changing your employment history?'}
            </div>

            {/* Job Switching Button */}
            {!jobSearchEnabled ? (
              <button
                type="button"
                onClick={handleStartJobSwitching}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  borderColor: '#047857',
                  color: '#fff',
                  borderRadius: 10,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                }}
              >
                <Sparkles size={14} />
                <span>Start Looking for New Opportunities</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleSearch(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <PauseCircle size={13} />
                <span>Pause Job Search</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. NOT_SEARCHING */}
      {careerStatus === 'NOT_SEARCHING' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>
            Your job search is paused. Application submission and job alert reminders are inactive.
          </div>
          <div>
            <button
              type="button"
              onClick={() => handleToggleSearch(true)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: 12, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Play size={13} fill="currentColor" />
              <span>Resume Job Search</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
