import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <svg width={36} height={36} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin-slow 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth={2.5} />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
