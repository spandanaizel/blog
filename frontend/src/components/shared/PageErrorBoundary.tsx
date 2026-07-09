import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render errors scoped to a single page (inside the router's Suspense
 * boundary). Unlike GlobalErrorBoundary, "Try again" just resets local state
 * and re-renders the subtree instead of reloading the whole app.
 */
export class PageErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Page-level render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">This page hit a snag</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try again, or head back home if it keeps happening.</p>
          </div>
          <Button onClick={() => this.setState({ hasError: false })}>
            <RotateCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
