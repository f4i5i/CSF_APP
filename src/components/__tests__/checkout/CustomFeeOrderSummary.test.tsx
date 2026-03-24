/**
 * Tests for custom fee display in OrderSummary — validates the double-charging fix.
 *
 * These tests verify that:
 * 1. Backend line items (enrollment + custom fee) display correctly
 * 2. The total uses backendTotal (not sum of line items) to avoid double-counting
 * 3. Processing fee is calculated on the correct base amount
 * 4. Custom fees show in pre-order estimate for required/optional fees
 */

import React from 'react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import OrderSummary from '../../checkout/OrderSummary';

describe('OrderSummary with Custom Fees', () => {
  const defaultProps = {
    classPrice: 49,
    registrationFee: 0,
    processingFeePercent: 3.2,
    discount: null,
    paymentMethod: 'full',
    installmentPlan: null,
    childCount: 1,
    children: [{ id: 'child-1', first_name: 'Tim' }],
    lineItems: null,
    classData: null,
    backendTotal: null,
    backendProcessingFee: null,
    customFees: [],
    selectedFeesByChild: {},
  };

  // ===========================================
  // BACKEND LINE ITEMS (Post-order state)
  // ===========================================
  describe('Backend Line Items with Custom Fees', () => {
    it('should display enrollment and custom fee as separate line items', () => {
      const lineItems = [
        {
          id: 'li-1',
          description: 'Tim Testt - CSF Footprints Soccer at Blossom Peak Montessori',
          unit_price: 49,
          line_total: 84, // $49 class + $35 jersey baked in
          discount_amount: 0,
          line_item_type: 'enrollment',
        },
        {
          id: 'li-2',
          description: 'Tim Testt - CSF Footprints Jersey',
          unit_price: 35,
          line_total: 35,
          discount_amount: 0,
          line_item_type: 'custom_fee_required',
        },
      ];

      render(
        <OrderSummary
          {...defaultProps}
          lineItems={lineItems}
          backendTotal={86.69}
          backendProcessingFee={2.69}
        />
      );

      // Both line items should render
      expect(screen.getByText(/CSF Footprints Soccer/)).toBeInTheDocument();
      expect(screen.getByText(/CSF Footprints Jersey/)).toBeInTheDocument();

      // Prices should show
      expect(screen.getByText('$84.00')).toBeInTheDocument();
      expect(screen.getByText('$35.00')).toBeInTheDocument();
    });

    it('should use backendTotal as the total — NOT sum of line items', () => {
      const lineItems = [
        {
          id: 'li-1',
          description: 'Tim - Soccer Class',
          unit_price: 49,
          line_total: 84, // includes $35 jersey
          discount_amount: 0,
          line_item_type: 'enrollment',
        },
        {
          id: 'li-2',
          description: 'Tim - Jersey',
          unit_price: 35,
          line_total: 35,
          discount_amount: 0,
          line_item_type: 'custom_fee_required',
        },
      ];

      render(
        <OrderSummary
          {...defaultProps}
          lineItems={lineItems}
          backendTotal={86.69}
          backendProcessingFee={2.69}
        />
      );

      // Total should be $86.69 (from backendTotal), NOT $121.69 (sum of line items + processing)
      expect(screen.getByText('$86.69')).toBeInTheDocument();
    });

    it('should display processing fee from backend', () => {
      const lineItems = [
        {
          id: 'li-1',
          description: 'Tim - Soccer Class',
          unit_price: 49,
          line_total: 84,
          discount_amount: 0,
          line_item_type: 'enrollment',
        },
      ];

      render(
        <OrderSummary
          {...defaultProps}
          lineItems={lineItems}
          backendTotal={86.69}
          backendProcessingFee={2.69}
        />
      );

      // Processing fee should show $2.69 (3.2% of $84), NOT $3.81 (3.2% of $119)
      expect(screen.getByText('$2.69')).toBeInTheDocument();
    });
  });

  // ===========================================
  // PRE-ORDER CUSTOM FEES ESTIMATE
  // ===========================================
  describe('Pre-order Custom Fee Estimate', () => {
    it('should include required fee in estimate for each child', () => {
      render(
        <OrderSummary
          {...defaultProps}
          customFees={[
            { name: 'Jersey Fee', amount: 35, is_optional: false, description: '' },
          ]}
        />
      );

      expect(screen.getByText(/Jersey Fee/)).toBeInTheDocument();
      expect(screen.getByText(/Required/)).toBeInTheDocument();
    });

    it('should show optional fee only when selected by a child', () => {
      render(
        <OrderSummary
          {...defaultProps}
          customFees={[
            { name: 'Equipment', amount: 25, is_optional: true, description: '' },
          ]}
          selectedFeesByChild={{ 'child-1': [0] }}
        />
      );

      expect(screen.getByText(/Equipment/)).toBeInTheDocument();
      expect(screen.getByText(/Optional/)).toBeInTheDocument();
    });

    it('should NOT show optional fee when not selected', () => {
      render(
        <OrderSummary
          {...defaultProps}
          customFees={[
            { name: 'Equipment', amount: 25, is_optional: true, description: '' },
          ]}
          selectedFeesByChild={{}}
        />
      );

      expect(screen.queryByText(/Equipment/)).not.toBeInTheDocument();
    });

    it('should multiply required fee by child count', () => {
      render(
        <OrderSummary
          {...defaultProps}
          childCount={2}
          children={[
            { id: 'child-1', first_name: 'Child1' },
            { id: 'child-2', first_name: 'Child2' },
          ]}
          customFees={[
            { name: 'Jersey Fee', amount: 35, is_optional: false, description: '' },
          ]}
        />
      );

      // Should show $70 (2 x $35)
      expect(screen.getByText('$70.00')).toBeInTheDocument();
    });
  });

  // ===========================================
  // TOTAL CALCULATION CORRECTNESS
  // ===========================================
  describe('Total Calculation', () => {
    it('should calculate correct total with required custom fee (pre-order)', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={49}
          processingFeePercent={3.2}
          customFees={[
            { name: 'Jersey', amount: 35, is_optional: false, description: '' },
          ]}
        />
      );

      // Total = ($49 class + $35 jersey) + 3.2% processing = $84 + $2.69 = $86.69
      expect(screen.getByText('$86.69')).toBeInTheDocument();
    });

    it('should prefer backendTotal over frontend calculation', () => {
      const lineItems = [
        {
          id: 'li-1',
          description: 'Enrollment',
          unit_price: 49,
          line_total: 84,
          discount_amount: 0,
          line_item_type: 'enrollment',
        },
      ];

      render(
        <OrderSummary
          {...defaultProps}
          lineItems={lineItems}
          backendTotal={86.69}
          backendProcessingFee={2.69}
        />
      );

      // Should use backendTotal=$86.69 exactly
      expect(screen.getByText('$86.69')).toBeInTheDocument();
    });
  });
});
