'use client';

import React from 'react';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          gap={2}
          p={3}
        >
          <ErrorIcon color="error" sx={{ fontSize: 60 }} />
          <Typography variant="h5" color="error">
            發生錯誤
          </Typography>
          <Typography color="text.secondary">
            {this.state.error?.message || '系統發生錯誤，請稍後再試'}
          </Typography>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={this.handleRetry}>
            重新載入
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
