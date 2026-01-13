import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, User, Calendar, DollarSign, BookOpen, ChevronDown, ChevronUp, X, AlertTriangle, Loader2, Pause, Play, Plus } from 'lucide-react';
import { enrollmentService } from '../../api/services/enrollment.service';
import { formatCurrency, formatDate } from '../../utils/format';

const MembershipList = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedChildren, setExpandedChildren] = useState({});

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [cancellationPreview, setCancellationPreview] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState(null);

  // Pause modal state
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseEnrollment, setPauseEnrollment] = useState(null);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [pauseError, setPauseError] = useState(null);

  // Resume state
  const [resumeLoading, setResumeLoading] = useState(null); // holds enrollment id being resumed

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrollmentService.getMy();
      setEnrollments(data || []);

      // Auto-expand all children by default
      const childIds = [...new Set(data?.map(e => e.child_id) || [])];
      const expanded = {};
      childIds.forEach(id => { expanded[id] = true; });
      setExpandedChildren(expanded);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
      setError('Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const toggleChild = (childId) => {
    setExpandedChildren(prev => ({
      ...prev,
      [childId]: !prev[childId]
    }));
  };

  const handleCancelClick = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowCancelModal(true);
    setCancelReason('');
    setCancelError(null);
    setCancellationPreview(null);

    // Load cancellation preview
    setPreviewLoading(true);
    try {
      const preview = await enrollmentService.getCancellationPreview(enrollment.id);
      setCancellationPreview(preview);
    } catch (err) {
      console.error('Failed to load cancellation preview:', err);
      setCancelError('Failed to load refund information. You can still proceed with cancellation.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedEnrollment) return;

    setCancelLoading(true);
    setCancelError(null);
    try {
      await enrollmentService.cancel(selectedEnrollment.id, {
        reason: cancelReason || 'No reason provided',
        refund_requested: true
      });

      // Refresh enrollments list
      await loadEnrollments();
      setShowCancelModal(false);
      setSelectedEnrollment(null);
    } catch (err) {
      console.error('Failed to cancel enrollment:', err);
      setCancelError(err.response?.data?.detail || 'Failed to cancel membership. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedEnrollment(null);
    setCancellationPreview(null);
    setCancelReason('');
    setCancelError(null);
  };

  // Pause handlers
  const handlePauseClick = (enrollment) => {
    setPauseEnrollment(enrollment);
    setShowPauseModal(true);
    setPauseReason('');
    setPauseError(null);
  };

  const handleConfirmPause = async () => {
    if (!pauseEnrollment) return;

    setPauseLoading(true);
    setPauseError(null);
    try {
      await enrollmentService.pause(pauseEnrollment.id, {
        reason: pauseReason || undefined
      });

      // Refresh enrollments list
      await loadEnrollments();
      setShowPauseModal(false);
      setPauseEnrollment(null);
    } catch (err) {
      console.error('Failed to pause enrollment:', err);
      setPauseError(err.response?.data?.detail || 'Failed to pause membership. Please try again.');
    } finally {
      setPauseLoading(false);
    }
  };

  const closePauseModal = () => {
    setShowPauseModal(false);
    setPauseEnrollment(null);
    setPauseReason('');
    setPauseError(null);
  };

  // Resume handler
  const handleResume = async (enrollment) => {
    setResumeLoading(enrollment.id);
    try {
      await enrollmentService.resume(enrollment.id);
      // Refresh enrollments list
      await loadEnrollments();
    } catch (err) {
      console.error('Failed to resume enrollment:', err);
      // Show error - could use a toast here
      alert(err.response?.data?.detail || 'Failed to resume membership. Please try again.');
    } finally {
      setResumeLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
      CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
      WAITLIST: 'bg-purple-100 text-purple-800 border-purple-200',
      PAUSED: 'bg-amber-100 text-amber-800 border-amber-200',
    };

    const labels = {
      ACTIVE: 'Active',
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      WAITLIST: 'Waitlist',
      PAUSED: 'Paused',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const canCancel = (status) => {
    return ['ACTIVE', 'PENDING', 'WAITLIST', 'PAUSED'].includes(status);
  };

  const canPause = (status) => {
    return status === 'ACTIVE';
  };

  const canResume = (status) => {
    return status === 'PAUSED';
  };

  // Group enrollments by child
  const groupedByChild = enrollments.reduce((acc, enrollment) => {
    const childId = enrollment.child_id;
    if (!acc[childId]) {
      acc[childId] = {
        child: enrollment.child || { first_name: 'Unknown', last_name: 'Child' },
        enrollments: []
      };
    }
    acc[childId].enrollments.push(enrollment);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="border rounded-xl p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-xl my-3 p-5">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={loadEnrollments}
          className="mt-3 text-sm text-btn-secondary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (Object.keys(groupedByChild).length === 0) {
    return (
      <div className="border rounded-xl p-5">
        <h2 className="font-semibold text-lg mb-4">Active Memberships</h2>
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No active memberships found</p>
          <p className="text-sm mt-1">Enroll your children in classes to see memberships here</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-xl p-5">
        <h2 className="font-semibold text-lg mb-4">Active Memberships</h2>

        <div className="space-y-4">
          {Object.entries(groupedByChild).map(([childId, { child, enrollments: childEnrollments }]) => (
            <div key={childId} className="border rounded-lg overflow-hidden">
              {/* Child Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <button
                  onClick={() => toggleChild(childId)}
                  className="flex items-center gap-3 flex-1 hover:bg-gray-100 -m-2 p-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-btn-gold/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-btn-gold" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-heading-dark">
                      {child?.first_name} {child?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {childEnrollments.length} enrollment{childEnrollments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {expandedChildren[childId] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 ml-auto" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
                  )}
                </button>
                {/* Add Class Button */}
                <button
                  onClick={() => navigate('/class')}
                  className="ml-3 px-3 py-1.5 text-sm font-medium text-btn-gold hover:text-white bg-btn-gold/10 hover:bg-btn-gold border border-btn-gold/30 rounded-lg transition-colors flex items-center gap-1.5"
                  title={`Enroll ${child?.first_name} in another class`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Class</span>
                </button>
              </div>

              {/* Enrollments List */}
              {expandedChildren[childId] && (
                <div className="divide-y divide-gray-100">
                  {childEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-heading-dark">
                              {enrollment.class?.name || 'Class'}
                            </span>
                            {getStatusBadge(enrollment.status)}
                          </div>

                          {/* Schedule Info */}
                          {enrollment.class?.schedule && enrollment.class.schedule.length > 0 && (
                            <div className="text-sm text-gray-500 ml-6 mb-1">
                              {enrollment.class.schedule.map((s, idx) => (
                                <span key={idx}>
                                  {s.day_of_week} {s.start_time} - {s.end_time}
                                  {idx < enrollment.class.schedule.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Date Range */}
                          <div className="flex items-center gap-2 text-sm text-gray-500 ml-6">
                            <Calendar className="w-3.5 h-3.5" />
                            {enrollment.start_date && enrollment.end_date ? (
                              <span>
                                {formatDate(enrollment.start_date, { month: 'short', day: 'numeric' })} -{' '}
                                {formatDate(enrollment.end_date)}
                              </span>
                            ) : (
                              <span>
                                Enrolled: {formatDate(enrollment.enrollment_date)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center gap-4 ml-6 sm:ml-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-heading-dark">
                                {formatCurrency(enrollment.final_price)}
                              </span>
                            </div>
                            {enrollment.discount_amount > 0 && (
                              <div className="text-xs text-green-600">
                                -{formatCurrency(enrollment.discount_amount)} discount
                              </div>
                            )}
                            {!enrollment.payment_completed && enrollment.status === 'PENDING' && (
                              <div className="text-xs text-yellow-600 font-medium">
                                Payment pending
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {/* Pause Button - only for ACTIVE */}
                            {canPause(enrollment.status) && (
                              <button
                                onClick={() => handlePauseClick(enrollment)}
                                className="px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Pause className="w-3.5 h-3.5" />
                                Pause
                              </button>
                            )}

                            {/* Resume Button - only for PAUSED */}
                            {canResume(enrollment.status) && (
                              <button
                                onClick={() => handleResume(enrollment)}
                                disabled={resumeLoading === enrollment.id}
                                className="px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                {resumeLoading === enrollment.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Resuming...
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    Resume
                                  </>
                                )}
                              </button>
                            )}

                            {/* Cancel Button */}
                            {canCancel(enrollment.status) && (
                              <button
                                onClick={() => handleCancelClick(enrollment)}
                                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Active Memberships</span>
            <span className="font-semibold text-heading-dark">
              {enrollments.filter(e => e.status === 'ACTIVE').length} of {enrollments.length}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Total Monthly Cost</span>
            <span className="font-semibold text-btn-gold text-lg">
              {formatCurrency(
                enrollments
                  .filter(e => e.status === 'ACTIVE')
                  .reduce((sum, e) => sum + (e.final_price || 0), 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg text-heading-dark">Cancel Membership</h3>
              <button
                onClick={closeCancelModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Are you sure you want to cancel?</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This action cannot be undone. The enrollment will be permanently cancelled.
                  </p>
                </div>
              </div>

              {/* Enrollment Details */}
              <div className="border rounded-lg p-3">
                <p className="text-sm text-gray-500">Cancelling enrollment for:</p>
                <p className="font-semibold text-heading-dark mt-1">
                  {selectedEnrollment.child?.first_name} {selectedEnrollment.child?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedEnrollment.class?.name || 'Class'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Original Price: {formatCurrency(selectedEnrollment.final_price)}
                </p>
              </div>

              {/* Refund Preview */}
              {previewLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-btn-gold" />
                  <span className="ml-2 text-gray-600">Calculating refund...</span>
                </div>
              ) : cancellationPreview ? (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Refund Details</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Amount:</span>
                      <span className="text-heading-dark">{formatCurrency(cancellationPreview.refund_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancellation Fee:</span>
                      <span className="text-red-600">-{formatCurrency(cancellationPreview.cancellation_fee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t mt-2">
                      <span className="font-medium text-gray-700">Net Refund:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(cancellationPreview.net_refund)}</span>
                    </div>
                  </div>
                  {cancellationPreview.refund_policy && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {cancellationPreview.refund_policy}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold resize-none"
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {cancelError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{cancelError}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeCancelModal}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Membership
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Confirmation Modal */}
      {showPauseModal && pauseEnrollment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg text-heading-dark flex items-center gap-2">
                <Pause className="w-5 h-5 text-amber-600" />
                Pause Membership
              </h3>
              <button
                onClick={closePauseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Info */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Pause className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Pause this membership?</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Your current billing cycle will complete. No future charges until you resume.
                  </p>
                </div>
              </div>

              {/* Enrollment Details */}
              <div className="border rounded-lg p-3">
                <p className="text-sm text-gray-500">Pausing membership for:</p>
                <p className="font-semibold text-heading-dark mt-1">
                  {pauseEnrollment.child?.first_name} {pauseEnrollment.child?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {pauseEnrollment.class?.name || 'Class'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Price: {formatCurrency(pauseEnrollment.final_price)}/month
                </p>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for pausing (optional)
                </label>
                <textarea
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="e.g., Family vacation, temporary schedule conflict..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-btn-gold focus:border-btn-gold resize-none"
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {pauseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{pauseError}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closePauseModal}
                disabled={pauseLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmPause}
                disabled={pauseLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pauseLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pausing...
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Membership
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MembershipList;
