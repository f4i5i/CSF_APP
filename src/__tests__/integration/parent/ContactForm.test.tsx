/**
 * ContactForm Page Integration Tests
 * Tests for the contact form page including form rendering,
 * contact info display, and UI elements
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import ContactForm from '../../../pages/ContactForm';

// Mock Header and Footer
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: ({ isFixed }: { isFixed?: boolean }) => (
    <div data-testid="footer" data-fixed={isFixed}>
      Footer
    </div>
  ),
}));

describe('ContactForm Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the page title', () => {
      render(<ContactForm />);

      expect(screen.getByText('Get in touch')).toBeInTheDocument();
    });

    it('should render the page subtitle', () => {
      render(<ContactForm />);

      expect(screen.getByText(/Have a question\? We'd love to hear from you/i)).toBeInTheDocument();
    });

    it('should render Header', () => {
      render(<ContactForm />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render Footer with isFixed=false', () => {
      render(<ContactForm />);

      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-fixed', 'false');
    });
  });

  // ===========================================
  // FORM FIELDS TESTS
  // ===========================================
  describe('Form Fields', () => {
    it('should render first name input', () => {
      render(<ContactForm />);

      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    });

    it('should render last name input', () => {
      render(<ContactForm />);

      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    });

    it('should render email input', () => {
      render(<ContactForm />);

      expect(screen.getByPlaceholderText('Enter your e-mail')).toBeInTheDocument();
    });

    it('should render message textarea', () => {
      render(<ContactForm />);

      expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
    });

    it('should render the "Send Message" button', () => {
      render(<ContactForm />);

      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should render first name as text input type', () => {
      render(<ContactForm />);

      const firstNameInput = screen.getByPlaceholderText('First Name');
      expect(firstNameInput).toHaveAttribute('type', 'text');
    });

    it('should render email as email input type', () => {
      render(<ContactForm />);

      const emailInput = screen.getByPlaceholderText('Enter your e-mail');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  // ===========================================
  // FORM INPUT TESTS
  // ===========================================
  describe('Form Input', () => {
    it('should allow typing in first name', async () => {
      render(<ContactForm />);

      const firstNameInput = screen.getByPlaceholderText('First Name');
      await user.type(firstNameInput, 'John');

      expect(firstNameInput).toHaveValue('John');
    });

    it('should allow typing in last name', async () => {
      render(<ContactForm />);

      const lastNameInput = screen.getByPlaceholderText('Last Name');
      await user.type(lastNameInput, 'Doe');

      expect(lastNameInput).toHaveValue('Doe');
    });

    it('should allow typing in email', async () => {
      render(<ContactForm />);

      const emailInput = screen.getByPlaceholderText('Enter your e-mail');
      await user.type(emailInput, 'john@example.com');

      expect(emailInput).toHaveValue('john@example.com');
    });

    it('should allow typing in message', async () => {
      render(<ContactForm />);

      const messageInput = screen.getByPlaceholderText('Enter your message');
      await user.type(messageInput, 'Hello, I have a question.');

      expect(messageInput).toHaveValue('Hello, I have a question.');
    });
  });

  // ===========================================
  // CONTACT INFO SECTION TESTS
  // ===========================================
  describe('Contact Information Section', () => {
    it('should display phone contact info', () => {
      render(<ContactForm />);

      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('00 445 000 2234')).toBeInTheDocument();
    });

    it('should display email contact info', () => {
      render(<ContactForm />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('company@gmail.com')).toBeInTheDocument();
    });

    it('should display location contact info', () => {
      render(<ContactForm />);

      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('6391 Elgin St. Celina, USA')).toBeInTheDocument();
    });
  });

  // ===========================================
  // LAYOUT STRUCTURE TESTS
  // ===========================================
  describe('Layout Structure', () => {
    it('should have a form card container', () => {
      render(<ContactForm />);

      // Check for the card with background styling
      const formCard = document.querySelector('.rounded-\\[30px\\]');
      expect(formCard).toBeInTheDocument();
    });

    it('should render contact info cards', () => {
      render(<ContactForm />);

      // Three contact info cards (Phone, Email, Location)
      const cards = document.querySelectorAll('.text-center.shadow-md');
      expect(cards.length).toBe(3);
    });
  });

  // ===========================================
  // BUTTON INTERACTION TESTS
  // ===========================================
  describe('Button Interaction', () => {
    it('should have the Send Message button clickable', async () => {
      render(<ContactForm />);

      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).not.toBeDisabled();

      await user.click(sendButton);
      // No crash = success for a static form
    });
  });
});
