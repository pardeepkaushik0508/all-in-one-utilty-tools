import { Component } from 'react';

export default class ToolErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'This tool crashed unexpectedly.' };
  }

  componentDidCatch(error, info) {
    console.error('Tool error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-heading">Something went wrong in this tool</p>
          <p className="text-sm text-muted">{this.state.message}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
