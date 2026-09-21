import { Component } from 'react';
import ErrorFallback from './ErrorFallback';

/**
 * ErrorBoundary — Catches unhandled render-time errors in the React component tree.
 *
 * Wrap any part of your app (or the entire app in main.jsx) to prevent
 * a single component crash from taking down the whole page.
 *
 * Props:
 *   - fallback (optional): Custom fallback component to render on error
 *   - onError  (optional): Callback when an error is caught
 *   - children: The component tree to protect
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Dev-mode logging
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
