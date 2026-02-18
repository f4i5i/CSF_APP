import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import Attachment from '../announcements/Attachment';

jest.mock('../../api/config', () => ({
  getFileUrl: (url) => `http://test.com${url}`,
}));

describe('Attachment', () => {
  it('renders filename for document', () => {
    const file = { file_name: 'report.pdf', file_url: '/files/report.pdf' };
    render(<Attachment file={file} />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('renders filename for image', () => {
    const file = { file_name: 'photo.jpg', file_url: '/files/photo.jpg' };
    render(<Attachment file={file} />);
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
  });

  it('renders image thumbnail for image files', () => {
    const file = { file_name: 'photo.png', file_url: '/files/photo.png' };
    render(<Attachment file={file} />);
    const img = screen.getByAltText('photo.png');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://test.com/files/photo.png');
  });

  it('renders certificate icon for non-image files', () => {
    const file = { file_name: 'doc.pdf', file_url: '/files/doc.pdf' };
    render(<Attachment file={file} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Should NOT render an img element for PDF
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('handles string-only file', () => {
    render(<Attachment file="simple_file.pdf" />);
    expect(screen.getByText('simple_file.pdf')).toBeInTheDocument();
  });

  it('applies bold font for document variant', () => {
    const file = { file_name: 'doc.pdf', file_url: '/files/doc.pdf' };
    render(<Attachment file={file} />);
    const text = screen.getByText('doc.pdf');
    expect(text.className).toContain('font-bold');
  });

  it('applies medium font for image variant', () => {
    const file = { file_name: 'pic.jpg', file_url: '/files/pic.jpg' };
    render(<Attachment file={file} />);
    const text = screen.getByText('pic.jpg');
    expect(text.className).toContain('font-medium');
  });

  it('renders close button', () => {
    const file = { file_name: 'test.pdf' };
    const { container } = render(<Attachment file={file} />);
    // X icon is rendered
    const xIcon = container.querySelector('svg.text-\\[\\#8796AF\\]');
    expect(xIcon).toBeInTheDocument();
  });
});
