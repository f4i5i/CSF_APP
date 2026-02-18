import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Pagination from '../Clients/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Prev and Next buttons', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders page numbers', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} page={2} />);
    const pageBtn = screen.getByText('2');
    expect(pageBtn.className).toContain('bg-[#1D3557]');
    expect(pageBtn.className).toContain('text-white');
  });

  it('calls onPageChange when page number clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} />);
    await user.click(screen.getByText('3'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with prev page on Prev click', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={3} />);
    await user.click(screen.getByText('Prev'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page on Next click', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={3} />);
    await user.click(screen.getByText('Next'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables Prev on first page', () => {
    render(<Pagination {...defaultProps} page={1} />);
    const prevBtn = screen.getByText('Prev');
    expect(prevBtn.closest('button')).toBeDisabled();
  });

  it('disables Next on last page', () => {
    render(<Pagination {...defaultProps} page={5} />);
    const nextBtn = screen.getByText('Next');
    expect(nextBtn.closest('button')).toBeDisabled();
  });

  it('shows ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} totalPages={10} page={5} />);
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });
});
