import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import installmentsService from '../api/services/installments.service';
import { formatDate, formatCurrency } from '../utils/format';

const InstallmentTracker = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInstallmentPlans();
  }, []);

  const loadInstallmentPlans = async () => {
    try {
      // Get all active installment plans
      const data = await installmentsService.getAll({ status: 'active' });

      // For each plan, fetch the payment schedule
      const plansWithSchedules = await Promise.all(
        data.map(async (plan) => {
          try {
            const schedule = await installmentsService.getSchedule(plan.id);
            return { ...plan, schedule: schedule.items || [] };
          } catch (err) {
            console.error(`Failed to load schedule for plan ${plan.id}:`, err);
            return { ...plan, schedule: [] };
          }
        })
      );

      setPlans(plansWithSchedules);
    } catch (error) {
      console.error('Failed to load installment plans:', error);
      setError('Failed to load installment plans');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateLabel = (dueDate, status) => {
    if (status === 'paid') return 'Paid';

    const days = getDaysUntilDue(dueDate);
    if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} day${days !== 1 ? 's' : ''}`;
  };

  const getPaidCount = (schedule) => {
    return schedule.filter(p => p.status === 'paid').length;
  };

  const getTotalAmount = (plan) => {
    return plan.total_amount;
  };

  const getPaidAmount = (schedule) => {
    return schedule
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const getRemainingAmount = (plan) => {
    const total = parseFloat(plan.total_amount);
    const paid = getPaidAmount(plan.schedule || []);
    return total - paid;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-btn-gold"></div>
        <p className="mt-2 text-gray-600">Loading installment plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 font-manrope">No active installment plans</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-heading-dark font-manrope">
        Installment Plans
      </h2>

      {plans.map((plan) => {
        const paidCount = getPaidCount(plan.schedule || []);
        const totalPayments = plan.num_installments;
        const progressPercent = (paidCount / totalPayments) * 100;
        const remainingAmount = getRemainingAmount(plan);

        return (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            {/* Plan Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-heading-dark font-manrope">
                  {plan.order_details?.class_name || 'Class Enrollment'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {plan.num_installments}-payment plan ({plan.frequency})
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-btn-gold font-manrope">
                  {formatCurrency(getTotalAmount(plan))}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-manrope">
                  {paidCount} of {totalPayments} payments complete
                </span>
                <span className="text-gray-600 font-manrope">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatCurrency(getPaidAmount(plan.schedule || []))} paid</span>
                <span>{formatCurrency(remainingAmount)} remaining</span>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2 font-manrope">
                Payment Schedule
              </h4>
              {(plan.schedule || []).map((payment, index) => {
                const dueDateLabel = getDueDateLabel(payment.due_date, payment.status);
                const isOverdue = payment.status === 'pending' && getDaysUntilDue(payment.due_date) < 0;
                const isDueSoon = payment.status === 'pending' && getDaysUntilDue(payment.due_date) <= 3 && getDaysUntilDue(payment.due_date) >= 0;

                return (
                  <div
                    key={payment.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      payment.status === 'failed'
                        ? 'border-red-200 bg-red-50'
                        : payment.status === 'paid'
                        ? 'border-green-200 bg-green-50'
                        : isOverdue
                        ? 'border-red-200 bg-red-50'
                        : isDueSoon
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="text-sm font-medium font-manrope">
                          Payment {index + 1} of {totalPayments}
                        </p>
                        <p className="text-xs text-gray-600 font-manrope">
                          {formatDate(payment.due_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold font-manrope">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className={`text-xs font-manrope ${
                        payment.status === 'failed' || isOverdue ? 'text-red-600' :
                        isDueSoon ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {dueDateLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Failed Payment Alert */}
            {(plan.schedule || []).some(p => p.status === 'failed') && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 font-manrope">
                      Payment Failed
                    </p>
                    <p className="text-sm text-red-700 mt-1 font-manrope">
                      Your last payment attempt was unsuccessful. Please update your payment method.
                    </p>
                    <button
                      onClick={() => window.location.href = '/paymentbilling'}
                      className="mt-2 text-sm text-red-900 underline hover:text-red-700 font-manrope"
                    >
                      Update Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InstallmentTracker;
