import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import GooglePlacesAutocomplete from '../ui/GooglePlacesAutocomplete';

describe('GooglePlacesAutocomplete', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('renders fallback input when no API key', () => {
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    render(
      <GooglePlacesAutocomplete value="" onChange={jest.fn()} placeholder="Search..." />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('Location search unavailable - enter address manually')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    render(
      <GooglePlacesAutocomplete value="" onChange={jest.fn()} label="Location" />
    );
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    render(
      <GooglePlacesAutocomplete value="" onChange={jest.fn()} label="Location" required />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange for fallback input', async () => {
    const user = userEvent.setup();
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    const handleChange = jest.fn();
    render(
      <GooglePlacesAutocomplete value="" onChange={handleChange} placeholder="Search..." />
    );
    await user.type(screen.getByPlaceholderText('Search...'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders clear button when value exists (with API key)', () => {
    process.env.REACT_APP_GOOGLE_PLACES_API_KEY = 'test-key';
    render(
      <GooglePlacesAutocomplete value="Some place" onChange={jest.fn()} />
    );
    // Clear button exists in the DOM
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows loading placeholder with API key', () => {
    process.env.REACT_APP_GOOGLE_PLACES_API_KEY = 'test-key';
    render(
      <GooglePlacesAutocomplete value="" onChange={jest.fn()} />
    );
    expect(screen.getByPlaceholderText('Loading...')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    delete process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    render(
      <GooglePlacesAutocomplete value="" onChange={jest.fn()} disabled placeholder="Search..." />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeDisabled();
  });
});
