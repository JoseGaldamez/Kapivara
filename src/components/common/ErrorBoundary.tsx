import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    message: string;
    stack: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        message: '',
        stack: ''
    };

    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            message: error.message || 'Unexpected rendering error',
            stack: error.stack || ''
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('UI render crashed:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex items-center justify-center p-6">
                    <div className="max-w-xl rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-gray-800 p-6">
                        <h1 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Something went wrong</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Please restart the application. If the problem persists, contact support.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}


