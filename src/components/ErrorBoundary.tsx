import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.name ? ` – ${this.props.name}` : ""}]`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      // Per-widget error (has name) → small inline box
      if (this.props.name) {
        return (
          <div className="flex h-[350px] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-destructive">
                Loi: {this.props.name}
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {this.state.error?.message ?? "Unknown error"}
              </p>
            </div>
          </div>
        );
      }

      // Root-level error → full-page display
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111827",
            color: "#f9fafb",
            fontFamily: "Inter, system-ui, sans-serif",
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Something went wrong
            </h1>
            <pre
              style={{
                background: "#1f2937",
                padding: "1rem",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                textAlign: "left",
                maxHeight: 300,
                overflow: "auto",
                marginBottom: "1.5rem",
              }}
            >
              {this.state.error?.message}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
