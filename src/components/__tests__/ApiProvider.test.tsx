import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApiProvider } from '../providers/ApiProvider';

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="devtools" />,
}));

jest.mock('../../api/client/query-client', () => ({
  queryClient: {},
}));

describe('ApiProvider', () => {
  it('renders children inside QueryClientProvider', () => {
    render(
      <ApiProvider>
        <div>App Content</div>
      </ApiProvider>
    );
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('renders devtools in development', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

    render(
      <ApiProvider>
        <div>Content</div>
      </ApiProvider>
    );
    expect(screen.getByTestId('devtools')).toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
  });
});
