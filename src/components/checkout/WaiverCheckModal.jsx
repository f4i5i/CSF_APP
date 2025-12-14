/**
 * WaiverCheckModal - Inline waiver signing modal for checkout flow
 * Blocks payment until all pending waivers are signed
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import waiversService from '../../api/services/waivers.service';

const WaiverCheckModal = ({ classData, onClose, onWaiversSigned }) => {
  const [pendingWaivers, setPendingWaivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    signature: '',
    acceptedWaivers: {},
  });

  useEffect(() => {
    fetchPendingWaivers();
  }, [classData]);

  const fetchPendingWaivers = async () => {
    try {
      setLoading(true);
      const response = await waiversService.getPending({
        program_id: classData?.program?.id || classData?.program_id,
        school_id: classData?.school?.id || classData?.school_id,
      });

      const waiversData = (response?.items || []).map((item) => ({
        id: item.waiver_template.id,
        name: item.waiver_template.name,
        content: item.waiver_template.content,
        type: item.waiver_template.waiver_type,
        version: item.waiver_template.version,
        needs_reconsent: item.needs_reconsent,
        is_accepted: item.is_accepted,
      }));

      setPendingWaivers(waiversData);

      // Initialize acceptedWaivers state
      const initialAcceptedState = {};
      waiversData.forEach((waiver) => {
        initialAcceptedState[waiver.id] = false;
      });
      setFormData((prev) => ({
        ...prev,
        acceptedWaivers: initialAcceptedState,
      }));
    } catch (error) {
      console.error('Failed to fetch pending waivers:', error);
      toast.error('Failed to load waivers');
      setPendingWaivers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWaiverCheck = (waiverId, checked) => {
    setFormData((prev) => ({
      ...prev,
      acceptedWaivers: {
        ...prev.acceptedWaivers,
        [waiverId]: checked,
      },
    }));
  };

  const handleSignatureChange = (e) => {
    setFormData((prev) => ({ ...prev, signature: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all waivers are checked
    const allAccepted = Object.values(formData.acceptedWaivers).every(
      (accepted) => accepted === true
    );

    if (!allAccepted) {
      toast.error('Please accept all waiver terms');
      return;
    }

    if (!formData.signature.trim()) {
      toast.error('Please provide your signature');
      return;
    }

    try {
      setSubmitting(true);

      const waiversToSign = pendingWaivers.map((waiver) => ({
        template_id: waiver.id,
        signature: formData.signature,
        agreed: true,
      }));

      const result = await waiversService.signMultiple({
        waivers: waiversToSign,
        signer_name: formData.signature,
      });

      if (!result.success && result.failed_count > 0) {
        toast.error(
          `Failed to sign ${result.failed_count} waiver(s). Please try again.`
        );
        console.error('Failed waivers:', result.errors);
        return;
      }

      toast.success('Waivers signed successfully!');

      // Notify parent component
      if (onWaiversSigned) {
        onWaiversSigned();
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to sign waivers:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to sign waivers. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // If no pending waivers, close modal automatically
  useEffect(() => {
    if (!loading && pendingWaivers.length === 0) {
      if (onWaiversSigned) {
        onWaiversSigned();
      }
      onClose();
    }
  }, [loading, pendingWaivers.length, onClose, onWaiversSigned]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#173151] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Checking for required waivers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#173151]">
                Action Required: Sign Waivers
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Please review and sign the required waivers before completing enrollment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Waiver Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {pendingWaivers.length}{' '}
                    {pendingWaivers.length === 1 ? 'Waiver' : 'Waivers'} Required
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    These waivers are required for enrollment in{' '}
                    <strong>{classData?.name || 'this class'}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Waivers List */}
            {pendingWaivers.map((waiver, index) => (
              <div
                key={waiver.id}
                className="bg-gray-50 rounded-xl p-5 border border-gray-200"
              >
                {/* Waiver Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#173151] rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#173151]">
                        {waiver.name || waiver.type}
                      </h3>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {waiver.type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Waiver Content */}
                <div className="bg-white rounded-lg p-4 mb-4 max-h-64 overflow-y-auto border border-gray-200">
                  <div className="text-gray-700 text-sm whitespace-pre-wrap">
                    {waiver.content || 'Please review and accept this waiver.'}
                  </div>
                </div>

                {/* Acceptance Checkbox */}
                <label className="flex items-start gap-3 text-gray-800 cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition">
                  <input
                    type="checkbox"
                    checked={formData.acceptedWaivers[waiver.id] || false}
                    onChange={(e) => handleWaiverCheck(waiver.id, e.target.checked)}
                    className="w-5 h-5 text-[#173151] border-gray-300 rounded focus:ring-[#173151] mt-0.5"
                  />
                  <span className="font-medium text-sm">
                    I have read and agree to the {waiver.name || waiver.type} terms
                    and conditions
                  </span>
                </label>
              </div>
            ))}

            {/* Signature Field */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-5">
              <label className="font-semibold text-gray-900 mb-2 block flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
                Digital Signature (Required)
              </label>
              <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleSignatureChange}
                placeholder="Type your full legal name"
                className="w-full p-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white outline-none font-medium"
                required
              />
              <p className="text-xs text-gray-600 mt-2">
                By typing your name above, you agree that this constitutes a legal
                signature.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                disabled={submitting}
              >
                Cancel Enrollment
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#173151] text-white rounded-lg font-semibold hover:bg-[#1f3d67] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Sign & Continue to Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WaiverCheckModal;
