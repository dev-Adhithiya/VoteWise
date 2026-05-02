import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { auth } from '@/lib/auth';

// Mock NextAuth auth function
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn().mockReturnValue({ status: 200, headers: new Map() }),
    json: jest.fn().mockImplementation((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
  },
}));

describe('Middleware Route Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (pathname: string) => {
    return {
      nextUrl: { pathname },
      headers: new Map(),
    } as unknown as NextRequest;
  };

  it('allows public routes without authentication', async () => {
    const req = createRequest('/');
    const res = await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(auth).not.toHaveBeenCalled();
  });

  it('allows /api/health as a public route', async () => {
    const req = createRequest('/api/health');
    const res = await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(auth).not.toHaveBeenCalled();
  });

  it('blocks protected API routes when unauthenticated', async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    const req = createRequest('/api/calendar');
    
    const res = await middleware(req);
    
    expect(auth).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: expect.stringContaining('Unauthorized') },
      { status: 401 }
    );
  });

  it('allows protected API routes when authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com', id: '123' },
      accessToken: 'fake-token',
    });
    const req = createRequest('/api/tasks');
    
    const res = await middleware(req);
    
    expect(auth).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalledWith(expect.objectContaining({
      request: expect.objectContaining({
        headers: expect.any(Object),
      }),
    }));
  });

  it('ignores non-API, non-public routes (defaults to next)', async () => {
    const req = createRequest('/some-random-page');
    const res = await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
