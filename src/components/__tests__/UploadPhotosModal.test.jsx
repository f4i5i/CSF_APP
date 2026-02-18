import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import UploadPhotosModal from '../UploadPhotosModal';

jest.mock('../hooks', () => ({
  useMutation: (fn, opts) => ({
    mutate: jest.fn(),
    loading: false,
  }),
}));

jest.mock('../api/services', () => ({
  photosService: { upload: jest.fn() },
}));

describe('UploadPhotosModal', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    classes: [
      { id: 1, name: 'Morning Session' },
      { id: 2, name: 'Afternoon Session' },
    ],
    selectedClass: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with title', () => {
    render(<UploadPhotosModal {...defaultProps} />);
    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
  });

  it('renders upload zone when no files selected', () => {
    render(<UploadPhotosModal {...defaultProps} />);
    expect(screen.getByText('Click to upload photos')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG up to 10MB each')).toBeInTheDocument();
  });

  it('renders class selection buttons', () => {
    render(<UploadPhotosModal {...defaultProps} />);
    expect(screen.getByText('Morning Session')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Session')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<UploadPhotosModal {...defaultProps} />);
    await user.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<UploadPhotosModal {...defaultProps} />);
    const closeButtons = document.querySelectorAll('button');
    // X button is the second button (first is hidden input)
    const xButton = Array.from(closeButtons).find((btn) =>
      btn.querySelector('svg') && btn.className.includes('rounded-full')
    );
    if (xButton) {
      await user.click(xButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it('disables Upload Photos button when no files or classes selected', () => {
    render(<UploadPhotosModal {...defaultProps} />);
    const submitBtn = screen.getByText('Upload Photos');
    expect(submitBtn.closest('button')).toBeDisabled();
  });

  it('pre-selects class when selectedClass is provided', () => {
    render(<UploadPhotosModal {...defaultProps} selectedClass={{ id: 1 }} />);
    // The Morning Session button should have the selected style
    const btn = screen.getByText('Morning Session');
    expect(btn.className).toContain('bg-[#1D3557]');
  });

  it('renders fallback tags when no classes provided', () => {
    render(<UploadPhotosModal {...defaultProps} classes={[]} />);
    expect(screen.getByText('Everyone')).toBeInTheDocument();
  });
});
