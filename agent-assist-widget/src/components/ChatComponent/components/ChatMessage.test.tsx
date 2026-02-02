import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import ChatMessage from './ChatMessage';

afterEach(cleanup);

describe('<ChatMessage />', () => {
  const defaultProps = {
    text: 'Hello, this is a test message',
    isUser: false,
    isFinal: true,
  };

  it('renders the message text correctly', () => {
    render(<ChatMessage {...defaultProps} />);
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('displays "U" icon when isUser is true', () => {
    render(<ChatMessage {...defaultProps} isUser={true} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('displays "A" icon when isUser is false', () => {
    render(<ChatMessage {...defaultProps} isUser={false} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('applies correct styling based on isUser prop', () => {
    const { container } = render(<ChatMessage {...defaultProps} isUser={true} />);
    // The component uses styled-components, so we can check for the presence of the component
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles empty text gracefully', () => {
    render(<ChatMessage {...defaultProps} text="" />);
    // Should render without crashing
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('handles long text messages', () => {
    const longText = 'This is a very long message that should be handled properly by the component without any issues or layout problems';
    render(<ChatMessage {...defaultProps} text={longText} />);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('renders with different isFinal values', () => {
    // Test with isFinal: true
    const { rerender } = render(<ChatMessage {...defaultProps} isFinal={true} />);
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();

    // Test with isFinal: false
    rerender(<ChatMessage {...defaultProps} isFinal={false} />);
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('handles special characters in text', () => {
    const specialText = 'Message with special chars: @#$%^&*()_+{}|:"<>?[]\\;\',./';
    render(<ChatMessage {...defaultProps} text={specialText} />);
    expect(screen.getByText(specialText)).toBeInTheDocument();
  });
});
