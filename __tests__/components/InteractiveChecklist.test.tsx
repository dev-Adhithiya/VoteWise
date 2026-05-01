import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveChecklist from '@/components/InteractiveChecklist';

describe('InteractiveChecklist Component', () => {
  it('renders US checklist by default', () => {
    render(<InteractiveChecklist region="US" />);
    expect(screen.getByText(/Voter Readiness Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm voter registration status/i)).toBeInTheDocument();
  });

  it('renders UK checklist when region is UK', () => {
    render(<InteractiveChecklist region="UK" />);
    expect(screen.getByText(/Confirm you are on the electoral register/i)).toBeInTheDocument();
    expect(screen.getByText(/Obtain accepted Photo ID/i)).toBeInTheDocument();
  });

  it('toggles checklist items when clicked', () => {
    render(<InteractiveChecklist region="US" />);
    const firstItem = screen.getByText(/Confirm voter registration status/i);
    
    // Initially not checked (doesn't have line-through class)
    expect(firstItem.className).not.toContain('line-through');
    
    // Click to check
    fireEvent.click(firstItem);
    expect(firstItem.className).toContain('line-through');
    
    // Click to uncheck
    fireEvent.click(firstItem);
    expect(firstItem.className).not.toContain('line-through');
  });
});
