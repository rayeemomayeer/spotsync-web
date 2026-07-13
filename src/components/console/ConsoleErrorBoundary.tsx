"use client";

import { Component, type ReactNode } from "react";
import { captureClientError } from "@/lib/observability/client";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ConsoleErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    captureClientError(error, { boundary: "ConsoleErrorBoundary" });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="console-error-fallback" role="alert">
          <h1>Live Console unavailable</h1>
          <p>Something went wrong loading the console. Check that the SpotSync API is running.</p>
          <pre>{this.state.error.message}</pre>
          <button
            type="button"
            className="console-btn console-btn--primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
