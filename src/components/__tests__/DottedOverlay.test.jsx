import React from 'react';
import { render } from '../../__tests__/utils/test-utils';
import DottedOverlay from '../DottedOverlay';

describe('DottedOverlay', () => {
  it('renders without crashing', () => {
    const { container } = render(<DottedOverlay />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders svg dot pattern', () => {
    const { container } = render(<DottedOverlay />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct positioning styles', () => {
    const { container } = render(<DottedOverlay />);
    const overlay = container.firstChild;
    expect(overlay.className).toContain('absolute');
  });
});
