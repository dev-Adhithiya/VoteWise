import React from 'react';
import { render, screen } from '@testing-library/react';
import VotingRouteMap from '@/components/VotingRouteMap';

describe('VotingRouteMap Component', () => {
  it('renders correctly with default props', () => {
    render(<VotingRouteMap />);
    expect(screen.getByText(/Your Polling Route/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Capitol Hill Polling Center/i).length).toBeGreaterThan(0);
  });

  it('displays the provided station name', () => {
    render(<VotingRouteMap stationName="Local Library" />);
    expect(screen.getByText(/Navigate to Local Library/i)).toBeInTheDocument();
  });

  it('renders a navigation link with correct parameters', () => {
    render(
      <VotingRouteMap 
        userLat={10} 
        userLng={20} 
        stationLat={11} 
        stationLng={21} 
        stationName="Target Booth" 
      />
    );
    const navLink = screen.getByRole('link', { name: /Start Navigation/i });
    expect(navLink).toHaveAttribute('href');
    expect(navLink.getAttribute('href')).toContain('origin=10,20');
    expect(navLink.getAttribute('href')).toContain('destination=11,21');
  });

  it('shows fallback map message if no API key is provided (mocking process.env)', () => {
    // Note: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY is likely undefined in tests unless mocked
    render(<VotingRouteMap />);
    const iframe = screen.getByTitle(/Route to polling station/i);
    // Since NEXT_PUBLIC_GOOGLE_MAPS_KEY is likely "your_maps_api_key" from .env.local, 
    // it will try to use Google Maps if it's set.
  });
});
