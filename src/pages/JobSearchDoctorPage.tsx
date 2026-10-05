import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { JobSearchDoctor } from '../components/analytics/JobSearchDoctor';
import { useApplications } from '../hooks/useApplications';

export const JobSearchDoctorPage: React.FC = () => {
  const { applications } = useApplications();

  return (
    <AppShell>
      <div className="ph" style={{ paddingBottom: 16 }}>
        <h1 className="page-title">AI Job Search Doctor & Application Post-Mortem</h1>
        <p className="page-sub">
          Pinpoint why applications stall, diagnose your exact screening bottlenecks, and execute data-backed prescriptions to land interviews.
        </p>
      </div>

      <div className="pb">
        <JobSearchDoctor applications={applications} />
      </div>
    </AppShell>
  );
};
