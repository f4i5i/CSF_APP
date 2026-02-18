import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import BadgeCard from '../attendence/BadgeCard';

describe('Attendance BadgeCard', () => {
  const defaultProps = {
    title: 'Perfect Week',
    subtitle: 'Attend 5 days',
    icon: '/badge.png',
    active: false,
  };

  it('renders title', () => {
    render(<BadgeCard {...defaultProps} />);
    expect(screen.getByText('Perfect Week')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<BadgeCard {...defaultProps} />);
    expect(screen.getByText('Attend 5 days')).toBeInTheDocument();
  });

  it('renders icon image', () => {
    render(<BadgeCard {...defaultProps} />);
    const img = screen.getByAltText('Perfect Week');
    expect(img).toHaveAttribute('src', '/badge.png');
  });

  it('applies active border style', () => {
    const { container } = render(<BadgeCard {...defaultProps} active={true} />);
    const card = container.firstChild;
    expect(card.className).toContain('border-2');
    expect(card.className).toContain('border-[#1D3557]');
  });

  it('applies transparent border when not active', () => {
    const { container } = render(<BadgeCard {...defaultProps} active={false} />);
    const card = container.firstChild;
    expect(card.className).toContain('border-transparent');
  });

  it('does not render subtitle when not provided', () => {
    render(<BadgeCard title="Badge" icon="/b.png" active={false} />);
    expect(screen.queryByText('Attend 5 days')).not.toBeInTheDocument();
  });

  it('applies compact styling', () => {
    render(<BadgeCard {...defaultProps} compact={true} />);
    const card = screen.getByText('Perfect Week').closest('div');
    expect(card).toBeInTheDocument();
  });
});
