import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import StudentCard from '../checkIn/StudentCard';

describe('StudentCard', () => {
  const student = {
    id: 1,
    name: 'Jane Doe',
    grade: '5',
    checked: false,
    img: null,
  };

  it('renders student name', () => {
    render(<StudentCard student={student} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders student grade', () => {
    render(<StudentCard student={student} />);
    expect(screen.getByText('Grade 5')).toBeInTheDocument();
  });

  it('shows Grade N/A for dash grade', () => {
    render(<StudentCard student={{ ...student, grade: '-' }} />);
    expect(screen.getByText('Grade N/A')).toBeInTheDocument();
  });

  it('renders initials when no image', () => {
    render(<StudentCard student={student} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    render(<StudentCard student={{ ...student, img: '/photo.jpg' }} />);
    const img = screen.getByAltText('Jane Doe');
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('shows check icon when checked in', () => {
    const { container } = render(<StudentCard student={{ ...student, checked: true }} />);
    const checkCircle = container.querySelector('.bg-green-500');
    expect(checkCircle).toBeInTheDocument();
  });

  it('shows empty circle when not checked in', () => {
    const { container } = render(<StudentCard student={student} />);
    const emptyCircle = container.querySelector('.border-\\[\\#C9CBD3\\]');
    expect(emptyCircle).toBeInTheDocument();
  });

  it('calls onCheckIn when check button is clicked', async () => {
    const user = userEvent.setup();
    const onCheckIn = jest.fn();
    const { container } = render(<StudentCard student={student} onCheckIn={onCheckIn} />);
    const checkBtn = container.querySelector('.border-\\[\\#C9CBD3\\]');
    await user.click(checkBtn);
    expect(onCheckIn).toHaveBeenCalledWith(student);
  });

  it('calls onOpenModal when card is clicked', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    render(<StudentCard student={student} onOpenModal={onOpen} />);
    await user.click(screen.getByText('Jane Doe'));
    expect(onOpen).toHaveBeenCalledWith(student);
  });

  it('shows wait cursor when checking in', () => {
    const { container } = render(<StudentCard student={student} checkingIn={true} />);
    const checkArea = container.querySelector('.cursor-wait');
    expect(checkArea).toBeInTheDocument();
  });

  it('does not call onCheckIn when checkingIn is true', async () => {
    const user = userEvent.setup();
    const onCheckIn = jest.fn();
    const { container } = render(
      <StudentCard student={student} onCheckIn={onCheckIn} checkingIn={true} />
    );
    const checkBtn = container.querySelector('.cursor-wait');
    await user.click(checkBtn);
    expect(onCheckIn).not.toHaveBeenCalled();
  });
});
