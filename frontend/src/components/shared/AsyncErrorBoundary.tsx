import React from 'react';
import { QueryErrorState } from '@/components/shared/QueryErrorState';

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Called in addition to the internal reset — e.g. queryClient.refetchQueries() for the wrapped widget. */
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * A small, reusable boundary for wrapping a single widget that fetches its own
 * data (a chart, a feed section, a sidebar card) rather than a whole page.
 * "Try again" resets just this subtree, so the rest of the page is unaffected.
 */
export class AsyncErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Async widget render error:', error, info);
  }

  handleRetry = () => {
    this.props.onRetry?.();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <QueryErrorState
          title={this.props.title ?? "Couldn't load this section"}
          description={this.props.description}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
