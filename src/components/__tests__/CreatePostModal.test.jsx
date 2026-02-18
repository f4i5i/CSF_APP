import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CreatePostModal from '../CreatePostModal';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('../api/services', () => ({
  announcementsService: {
    create: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn().mockResolvedValue({}),
    uploadAttachment: jest.fn().mockResolvedValue({}),
  },
}));

describe('CreatePostModal', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    classes: [
      { id: 1, name: 'Class A' },
      { id: 2, name: 'Class B' },
    ],
    selectedClass: null,
    announcement: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create mode title', () => {
    render(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
  });

  it('renders edit mode title', () => {
    render(
      <CreatePostModal
        {...defaultProps}
        announcement={{ id: 1, title: 'Old Title', content: 'Old Content', class_ids: [1] }}
      />
    );
    expect(screen.getByText('Edit Post')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<CreatePostModal {...defaultProps} />);
    expect(screen.getByPlaceholderText('Enter announcement title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter announcement description')).toBeInTheDocument();
    expect(screen.getByText('Attachments')).toBeInTheDocument();
  });

  it('renders class buttons', () => {
    render(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('Class A')).toBeInTheDocument();
    expect(screen.getByText('Class B')).toBeInTheDocument();
  });

  it('renders All Classes button when multiple classes', () => {
    render(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('All Classes')).toBeInTheDocument();
  });

  it('shows character count for description', () => {
    render(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('0/200')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreatePostModal {...defaultProps} />);
    await user.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables Submit when form is invalid', () => {
    render(<CreatePostModal {...defaultProps} />);
    const submitBtn = screen.getByText('Submit');
    expect(submitBtn.closest('button')).toBeDisabled();
  });

  it('shows validation message when no class selected', () => {
    render(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('Please select at least one class')).toBeInTheDocument();
  });

  it('renders Submit button in create mode', () => {
    render(<CreatePostModal {...defaultProps} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders Update button in edit mode', () => {
    render(
      <CreatePostModal
        {...defaultProps}
        announcement={{ id: 1, title: 'Test', content: 'Content', class_ids: [1] }}
      />
    );
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('pre-populates form in edit mode', () => {
    render(
      <CreatePostModal
        {...defaultProps}
        announcement={{ id: 1, title: 'Old Title', content: 'Old Content', class_ids: [1] }}
      />
    );
    expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Old Content')).toBeInTheDocument();
  });

  it('shows "No classes available" when empty classes', () => {
    render(<CreatePostModal {...defaultProps} classes={[]} />);
    expect(screen.getByText('No classes available')).toBeInTheDocument();
  });
});
