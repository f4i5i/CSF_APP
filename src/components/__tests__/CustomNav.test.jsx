import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CustomNav from '../Calendar/CustomNav';

describe('CustomNav', () => {
  it('renders two navigation buttons', () => {
    render(<CustomNav onPreviousClick={jest.fn()} onNextClick={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('calls onPreviousClick', async () => {
    const user = userEvent.setup();
    const onPrev = jest.fn();
    render(<CustomNav onPreviousClick={onPrev} onNextClick={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNextClick', async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    render(<CustomNav onPreviousClick={jest.fn()} onNextClick={onNext} />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('applies hover styling', () => {
    render(<CustomNav onPreviousClick={jest.fn()} onNextClick={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.className).toContain('hover:bg-gray-100');
    });
  });
});
