import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-5 select-none">⚠</div>
            <h1 className="text-xl font-semibold text-brand-cream mb-2 tracking-tight">
              Bir şeyler ters gitti
            </h1>
            <p className="text-brand-muted mb-6 text-sm">
              Uygulama beklenmeyen bir hatayla karşılaştı.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Yeniden dene
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
