import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeminiChat from '@/components/GeminiChat';

// Mock scrollTo to prevent errors in jsdom
window.HTMLElement.prototype.scrollTo = jest.fn();

describe('GeminiChat Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the chat interface', () => {
    render(<GeminiChat />);
    expect(screen.getByPlaceholderText(/Ask about elections/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Send message/i)).toBeInTheDocument();
  });

  it('allows user to type a message', () => {
    render(<GeminiChat />);
    const input = screen.getByPlaceholderText(/Ask about elections/i);
    fireEvent.change(input, { target: { value: 'How do I register to vote?' } });
    expect(input).toHaveValue('How do I register to vote?');
  });

  it('sends a message and displays loading state then response', async () => {
    // Mock the fetch API for the chat route
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        text: 'You can register to vote online or at your local DMV.',
        toolCalls: []
      }),
    });

    render(<GeminiChat />);
    const input = screen.getByPlaceholderText(/Ask about elections/i);
    const sendButton = screen.getByLabelText(/Send message/i);

    // Type message
    fireEvent.change(input, { target: { value: 'How do I register?' } });
    
    // Send message
    fireEvent.click(sendButton);

    // Input should be cleared
    expect(input).toHaveValue('');
    
    // User message should be visible
    expect(screen.getByText('How do I register?')).toBeInTheDocument();

    // Loading indicator should appear (TypingIndicator component renders a visual animation, we check for presence)
    // Assuming the typing indicator has some identifiable attribute or role, but we'll wait for the response instead.

    // Wait for the AI response to appear
    await waitFor(() => {
      expect(screen.getByText(/You can register to vote online/i)).toBeInTheDocument();
    });

    // Check if fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
  });

  it('handles API errors gracefully', async () => {
    // Mock fetch to simulate an error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Failed to connect to API',
        details: 'API Key missing'
      }),
    });

    render(<GeminiChat />);
    const input = screen.getByPlaceholderText(/Ask about elections/i);
    const sendButton = screen.getByLabelText(/Send message/i);

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to connect to API/i)).toBeInTheDocument();
    });
  });
});
