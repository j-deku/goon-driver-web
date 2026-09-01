// src/shared/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error to an external service here if you want.
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render any custom fallback UI
      return (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong:</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "red" }}>
            {this.state.error?.toString()}
          </pre>
          {this.state.errorInfo?.componentStack && (
            <details style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
