import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import ContainerBox from '../ContainerBox';

describe('ContainerBox', () => {
  it('renders children content', () => {
    render(<ContainerBox><p>Hello World</p></ContainerBox>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    const { container } = render(<ContainerBox><p>Content</p></ContainerBox>);
    const box = container.firstChild;
    expect(box).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ContainerBox className="my-custom"><p>Content</p></ContainerBox>
    );
    expect(container.innerHTML).toContain('my-custom');
  });

  it('renders multiple children', () => {
    render(
      <ContainerBox>
        <p>First</p>
        <p>Second</p>
      </ContainerBox>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
