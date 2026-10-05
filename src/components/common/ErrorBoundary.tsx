import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Database, ChevronDown } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[JobOrbit ErrorBoundary caught an unhandled exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleResetCache = () => {
    try {
      // Clear non-auth temporary keys if corrupted
      Object.keys(localStorage).forEach((key) => {
        if (!key.startsWith('firebase:authUser')) {
          localStorage.removeItem(key);
        }
      });
      window.location.href = '/dashboard';
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'var(--page)',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'var(--t1)',
          }}
        >
          <div
            style={{
              maxWidth: 580,
              width: '100%',
              background: 'var(--card)',
              border: '1.5px solid var(--border)',
              borderRadius: 20,
              padding: 32,
              boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} strokeWidth={2.2} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                  }}
                >
                  System Resilience Isolated
                </span>
                <h1 style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)', margin: '4px 0 0 0' }}>
                  Workspace Runtime Recovery
                </h1>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              An unexpected client runtime exception occurred in this view. The global resilience layer prevented an application crash, and your cloud and database records remain safe and synchronized.
            </p>

            {/* Recovery Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '9px 18px',
                  borderRadius: 10,
                }}
              >
                <RefreshCw size={14} />
                <span>Reload View</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                <Home size={14} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="btn btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '9px 18px',
                  borderRadius: 10,
                  color: 'var(--t3)',
                }}
                title="Clears non-auth temporary keys and reloads"
              >
                <Database size={14} />
                <span>Clean Cache</span>
              </button>
            </div>

            {/* Collapsible Technical Diagnostics */}
            {this.state.error && (
              <details
                style={{
                  background: 'var(--page)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  padding: '10px 14px',
                  fontSize: 12,
                  color: 'var(--t3)',
                  cursor: 'pointer',
                }}
              >
                <summary style={{ fontWeight: 700, outline: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ChevronDown size={14} />
                  <span>Technical Diagnostics & Stack Trace</span>
                </summary>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        background: 'var(--card)',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        overflowX: 'auto',
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: 'var(--t2)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
