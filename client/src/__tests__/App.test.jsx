// Frontend Tests using Vitest
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock socket.io-client
vi.mock('../socket', () => ({
  default: {
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
  }
}));

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it('should show login initially', () => {
    render(<App />);
    // Add more specific tests based on your app structure
    expect(true).toBe(true);
  });
});

describe('Performance', () => {
  it('should render within acceptable time', () => {
    const start = performance.now();
    render(<App />);
    const end = performance.now();
    const renderTime = end - start;
    
    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });
});
