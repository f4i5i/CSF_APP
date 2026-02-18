import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import WaiversAlert from '../WaiversAlert';

describe('WaiversAlert', () => {
  it('returns null when loading', () => {
    const { container } = render(<WaiversAlert loading={true} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when no pending waivers', () => {
    const { container } = render(<WaiversAlert pendingWaivers={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when pendingWaivers is undefined', () => {
    const { container } = render(<WaiversAlert />);
    expect(container.innerHTML).toBe('');
  });

  it('renders alert with single waiver', () => {
    const waivers = [{ id: 1, name: 'Liability Waiver', type: 'liability' }];
    render(<WaiversAlert pendingWaivers={waivers} />);
    expect(screen.getByText('Action Required: Sign Waivers')).toBeInTheDocument();
    expect(screen.getByText(/1 waiver/)).toBeInTheDocument();
    expect(screen.getByText(/needs your signature/)).toBeInTheDocument();
    expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
    expect(screen.getByText('liability')).toBeInTheDocument();
    expect(screen.getByText('Sign Waiver Now')).toBeInTheDocument();
  });

  it('renders alert with multiple waivers', () => {
    const waivers = [
      { id: 1, name: 'Liability Waiver' },
      { id: 2, name: 'Medical Waiver' },
    ];
    render(<WaiversAlert pendingWaivers={waivers} />);
    expect(screen.getByText(/2 waivers/)).toBeInTheDocument();
    expect(screen.getByText(/need your signature/)).toBeInTheDocument();
    expect(screen.getByText('Sign 2 Waivers Now')).toBeInTheDocument();
  });

  it('hides waiver list when more than 3 waivers', () => {
    const waivers = Array.from({ length: 4 }, (_, i) => ({ id: i, name: `Waiver ${i}` }));
    render(<WaiversAlert pendingWaivers={waivers} />);
    expect(screen.queryByText('Waiver 0')).not.toBeInTheDocument();
  });

  it('links to /waivers page', () => {
    const waivers = [{ id: 1, name: 'Test' }];
    render(<WaiversAlert pendingWaivers={waivers} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/waivers');
  });

  it('renders dismiss button', () => {
    const waivers = [{ id: 1, name: 'Test' }];
    render(<WaiversAlert pendingWaivers={waivers} />);
    expect(screen.getByTitle('Dismiss (reminder will return)')).toBeInTheDocument();
  });
});
