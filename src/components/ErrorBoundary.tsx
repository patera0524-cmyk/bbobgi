import React from 'react';
import { STORAGE_KEY } from '../types';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown) {
    console.error('App ErrorBoundary caught error:', error);
  }

  handleRecover = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-dvh w-screen flex-col items-center justify-center bg-[#071738] p-6 text-center text-white"
          style={{ backgroundColor: '#071738', color: '#ffffff' }}
        >
          <div className="max-w-md rounded-3xl border border-cyan-300/30 bg-[#0d2252] p-7 shadow-2xl">
            <div className="mb-3 text-4xl">❄️</div>
            <h1 className="text-xl font-bold text-white">
              화면을 불러오는 중 문제가 발생했습니다
            </h1>
            <p className="mt-2 text-sm text-cyan-100/80">
              저장된 데이터를 초기화하고 뽑기 화면을 다시 시작할 수 있습니다.
            </p>
            {this.state.errorMessage && (
              <p className="mt-3 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-rose-200 break-words">
                {this.state.errorMessage}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleRecover}
              className="mt-5 w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              초기화 후 다시 열기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
