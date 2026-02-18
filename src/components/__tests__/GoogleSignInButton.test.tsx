import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import GoogleSignInButton from '../auth/GoogleSignInButton';

describe('GoogleSignInButton', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('renders disabled fallback button when no client ID', () => {
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
    render(<GoogleSignInButton onSuccess={jest.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Sign in with Google');
  });

  it('renders custom text on fallback button', () => {
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
    render(<GoogleSignInButton onSuccess={jest.fn()} text="Login with Google" />);
    expect(screen.getByText('Login with Google')).toBeInTheDocument();
  });

  it('calls onError when client ID is missing', () => {
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const onError = jest.fn();
    render(<GoogleSignInButton onSuccess={jest.fn()} onError={onError} />);
    expect(onError).toHaveBeenCalledWith('Missing REACT_APP_GOOGLE_CLIENT_ID');
  });

  it('renders div container when client ID is present', () => {
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'test-client-id';
    const { container } = render(<GoogleSignInButton onSuccess={jest.fn()} />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('applies custom className to fallback button', () => {
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
    render(<GoogleSignInButton onSuccess={jest.fn()} className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });
});
