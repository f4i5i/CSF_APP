import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import ExportButton from '../Clients/ExportButton';

describe('ExportButton', () => {
  it('renders export button', () => {
    render(<ExportButton />);
    expect(screen.getByText(/export/i)).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<ExportButton />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  it('can be clicked without crashing', async () => {
    const user = userEvent.setup();
    render(<ExportButton />);
    await user.click(screen.getByRole('button'));
    // Should not throw
    expect(true).toBe(true);
  });
});
