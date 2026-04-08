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
        <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🍔</div>
            <h1 className="text-2xl font-bold text-white mb-2">Bir seyler ters gitti</h1>
            <p className="text-gray-400 mb-6">Uygulama beklenmeyen bir hatayla karsilasti.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#E23744] text-white rounded-xl font-semibold"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
