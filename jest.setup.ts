import '@testing-library/jest-dom'

// Mock matchMedia which is not present in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Geolocation API
Object.defineProperty(global.navigator, 'geolocation', {
  configurable: true,
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM methods
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollTo = jest.fn();

// Mock modules that cause ESM issues
jest.mock('remark-gfm', () => jest.fn());
jest.mock('react-markdown', () => {
  const React = require('react');
  return function MockReactMarkdown(props: any) {
    return React.createElement('div', { className: 'react-markdown-mock' }, props.children);
  };
});
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
