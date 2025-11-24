"use client";
import React from 'react';
import { Card, Button, Alert } from 'flowbite-react';
import { HiExclamationCircle, HiRefresh, HiDownload } from 'react-icons/hi';

// Lazy load logger to avoid server-side issues
let logger = null;
if (typeof window !== 'undefined') {
  logger = require('@/lib/logger');
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    if (logger && typeof window !== 'undefined') {
      try {
        logger.error('React Error Boundary caught error', error, {
          componentStack: errorInfo.componentStack,
          page: window.location.pathname
        });
      } catch (logError) {
        console.error('Error logging to logger:', logError);
      }
    } else {
      console.error('React Error Boundary caught error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  handleDownloadLogs = () => {
    if (logger && typeof window !== 'undefined') {
      try {
        logger.downloadLogs();
      } catch (logError) {
        console.error('Error downloading logs:', logError);
      }
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <HiExclamationCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                An unexpected error occurred. The error has been logged.
              </p>
            </div>

            <div className="flex gap-3 justify-center mb-6">
              <Button color="blue" onClick={this.handleReset} className="flex items-center gap-2">
                <HiRefresh className="h-4 w-4" />
                Reload Page
              </Button>
              <Button color="gray" onClick={this.handleDownloadLogs} className="flex items-center gap-2">
                <HiDownload className="h-4 w-4" />
                Download Error Logs
              </Button>
            </div>

            <Card className="mt-6 text-left">
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Error:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {this.state.error?.toString()}
                  </p>
                </div>
                {this.state.errorInfo && (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Component Stack:</p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto max-h-72">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
