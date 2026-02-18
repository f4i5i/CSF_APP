import React from 'react';
import { render, screen, waitFor } from '../../__tests__/utils/test-utils';
import SiblingDiscountBadge from '../SiblingDiscountBadge';

jest.mock('../api/services/discounts.service', () => ({
  __esModule: true,
  default: {
    checkSiblingDiscount: jest.fn(),
  },
}));

const discountsService = require('../api/services/discounts.service').default;

describe('SiblingDiscountBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null while loading', () => {
    discountsService.checkSiblingDiscount.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<SiblingDiscountBadge childId={1} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when not eligible', async () => {
    discountsService.checkSiblingDiscount.mockResolvedValue({ eligible: false });
    const { container } = render(<SiblingDiscountBadge childId={1} />);
    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });

  it('returns null on error', async () => {
    discountsService.checkSiblingDiscount.mockRejectedValue(new Error('fail'));
    const { container } = render(<SiblingDiscountBadge childId={1} />);
    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });

  it('renders discount badge when eligible', async () => {
    discountsService.checkSiblingDiscount.mockResolvedValue({
      eligible: true,
      discount_percentage: 10,
      sibling_count: 2,
    });
    render(<SiblingDiscountBadge childId={1} />);
    await waitFor(() => {
      expect(screen.getByText('Family Discount Applied!')).toBeInTheDocument();
      expect(screen.getByText('-10%')).toBeInTheDocument();
      expect(screen.getByText(/10% off for 2nd child/)).toBeInTheDocument();
    });
  });

  it('calls onDiscountCalculated callback', async () => {
    const callback = jest.fn();
    const discountData = { eligible: true, discount_percentage: 15, sibling_count: 3 };
    discountsService.checkSiblingDiscount.mockResolvedValue(discountData);
    render(<SiblingDiscountBadge childId={1} onDiscountCalculated={callback} />);
    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(discountData);
    });
  });
});
