import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { JobSearchDoctor } from '../components/analytics/JobSearchDoctor';
import { useApplications } from '../hooks/useApplications';

export const JobSearchDoctorPage: React.FC = () => {
  const { applications } = useApplications();

  return (
    <AppShell>
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">Pipeline Diagnostics & Funnel Audit</h1>
        <p className="page-sub">
          Pinpoint where applications stall, analyze screening bottlenecks, and review stage-by-stage recovery strategies.
        </p>
      </div>

      <div className="pb">
        <JobSearchDoctor applications={applications} />
      </div>
    </AppShell>
  );
};
