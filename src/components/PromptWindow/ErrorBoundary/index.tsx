import { Component, ErrorInfo, ReactNode } from 'react';
import { InfoDisplay } from '../../../elements';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for chat components
 * Catches rendering errors in child components and displays fallback UI
 */
export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chat component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <InfoDisplay
          type="error"
          message="Failed to display content. Please refresh the page."
          showTitle={false}
        />
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;
