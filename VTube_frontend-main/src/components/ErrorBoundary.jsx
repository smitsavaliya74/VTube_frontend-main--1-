import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, integrate with Sentry: Sentry.captureException(error)
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isDevMode = import.meta.env.DEV;
      return (
        <div className="error-boundary-container animate-fade-in">
          <div className="error-boundary-icon">
            <AlertTriangle size={32} />
          </div>
          <h2 className="error-boundary-title">Something went wrong</h2>
          <p className="error-boundary-desc">
            An unexpected error occurred in this section. Your other content is unaffected.
          </p>

          {isDevMode && this.state.error && (
            <details style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
            }}>
              <summary style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
                Developer Details
              </summary>
              <pre style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                marginTop: 8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowY: 'auto',
                maxHeight: 200,
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}

          <div className="error-boundary-actions">
            <button
              className="btn btn-primary"
              onClick={this.handleReset}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <a className="btn btn-secondary" href="/">
              <Home size={16} />
              Go Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
