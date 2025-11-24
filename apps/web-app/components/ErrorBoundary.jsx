"use client";
import React from 'react';
import { Result, Button, Card, Typography } from 'antd';

// Lazy load logger to avoid server-side issues
let logger = null;
if (typeof window !== 'undefined') {
  logger = require('@/lib/logger');
}

const { Paragraph, Text } = Typography;

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
        <div style={{ padding: '50px' }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An unexpected error occurred. The error has been logged."
            extra={[
              <Button type="primary" key="reset" onClick={this.handleReset}>
                Reload Page
              </Button>,
              <Button key="logs" onClick={this.handleDownloadLogs}>
                Download Error Logs
              </Button>
            ]}
          >
            <Card style={{ marginTop: 24, textAlign: 'left' }}>
              <Paragraph>
                <Text strong>Error:</Text> {this.state.error?.toString()}
              </Paragraph>
              {this.state.errorInfo && (
                <Paragraph>
                  <Text strong>Component Stack:</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 10, 
                    borderRadius: 4,
                    overflow: 'auto',
                    maxHeight: 300
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </Paragraph>
              )}
            </Card>
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

