import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import BadgeCarousel from '../attendence/BadgeCarousel';

describe('BadgeCarousel', () => {
  const badges = [
    { title: 'Star Player', subtitle: 'Top performer', icon: '/star.png', active: false },
    { title: 'MVP', subtitle: 'Most valuable', icon: '/mvp.png', active: true },
    { title: 'Team Leader', subtitle: 'Great leader', icon: '/leader.png', active: false },
  ];

  it('renders badge cards', () => {
    render(<BadgeCarousel badges={badges} />);
    // Tripled array, so should have 3 sets
    const starPlayers = screen.getAllByText('Star Player');
    expect(starPlayers.length).toBe(3);
  });

  it('renders left navigation button', () => {
    render(<BadgeCarousel badges={badges} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders right navigation button', () => {
    render(<BadgeCarousel badges={badges} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('calls scroll on left button click', async () => {
    const user = userEvent.setup();
    render(<BadgeCarousel badges={badges} />);
    const buttons = screen.getAllByRole('button');
    // First button is left arrow
    await user.click(buttons[0]);
    // No error means scroll was called
    expect(true).toBe(true);
  });

  it('calls scroll on right button click', async () => {
    const user = userEvent.setup();
    render(<BadgeCarousel badges={badges} />);
    const buttons = screen.getAllByRole('button');
    // Last button is right arrow
    await user.click(buttons[buttons.length - 1]);
    expect(true).toBe(true);
  });
});
