import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import waiversService from "../api/services/waivers.service";

const Waivers = () => {
  const navigate = useNavigate();
  const [pendingWaivers, setPendingWaivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    signature: "",
    acceptedWaivers: {}, // Dynamic: { waiverId: true/false }
  });

  // Fetch pending waivers on mount
  useEffect(() => {
    fetchPendingWaivers();
  }, []);

  const fetchPendingWaivers = async () => {
    try {
      setLoading(true);
      const response = await waiversService.getPending();

      // Backend returns: { items: [{waiver_template, is_accepted, acceptance, needs_reconsent}], pending_count, total }
      // Extract waiver_template from each item
      const waiversData = (response?.items || []).map(item => ({
        id: item.waiver_template.id,
        name: item.waiver_template.name,
        content: item.waiver_template.content,
        type: item.waiver_template.waiver_type,
        version: item.waiver_template.version,
        needs_reconsent: item.needs_reconsent,
        is_accepted: item.is_accepted,
      }));

      setPendingWaivers(waiversData);

      // Initialize acceptedWaivers state for each waiver
      const initialAcceptedState = {};
      waiversData.forEach(waiver => {
        initialAcceptedState[waiver.id] = false;
      });
      setFormData(prev => ({
        ...prev,
        acceptedWaivers: initialAcceptedState
      }));
    } catch (error) {
      console.error("Failed to fetch pending waivers:", error);
      toast.error("Failed to load waivers");
      setPendingWaivers([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    if (name === "signature") {
      setFormData(prev => ({ ...prev, signature: value }));
    }
  };

  const handleWaiverCheck = (waiverId, checked) => {
    setFormData(prev => ({
      ...prev,
      acceptedWaivers: {
        ...prev.acceptedWaivers,
        [waiverId]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all waivers are checked
    const allAccepted = Object.values(formData.acceptedWaivers).every(
      accepted => accepted === true
    );

    if (!allAccepted) {
      toast.error("Please accept all waiver terms");
      return;
    }

    if (!formData.signature.trim()) {
      toast.error("Please provide your signature");
      return;
    }

    try {
      setSubmitting(true);

      // Sign all accepted waivers (loops through and calls individual accept endpoint)
      if (pendingWaivers.length > 0) {
        const waiversToSign = pendingWaivers.map((waiver) => ({
          template_id: waiver.id,
          signature: formData.signature,
          agreed: true,
        }));

        const result = await waiversService.signMultiple({
          waivers: waiversToSign,
          signer_name: formData.signature,
        });

        // Check if all waivers were signed successfully
        if (!result.success && result.failed_count > 0) {
          toast.error(`Failed to sign ${result.failed_count} waiver(s). Please try again.`);
          console.error("Failed waivers:", result.errors);
          return;
        }
      }

      toast.success("Waivers signed successfully!");

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Failed to sign waivers:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to sign waivers. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center overflow-y-auto relative py-8 sm:py-0">

      {/* Dotted Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

      {/* CSF School Academy - Top Center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-bold text-[#173151] font-kollektif drop-shadow-lg">CSF School Academy</h1>
      </div>

      <div className='relative justify-center items-center w-full max-w-md sm:max-w-2xl md:max-w-4xl px-4 sm:px-6 mt-20 sm:mt-24 md:mt-32'>
        {/* WAIVER CARD */}
        <div className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 w-full max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-200px)] overflow-y-auto">

          {loading && (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#173151] border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading waivers...</p>
            </div>
          )}

          {!loading && (
            <>
          {/* Logo and Title Section */}
          <div className="relative flex items-center mb-6">
            {/* Logo - Left Side */}
            <div className="flex w-16 h-16 sm:w-24 sm:h-24 md:w-[128px] md:h-[124px] items-center justify-center">
              <Logo />
            </div>

            {/* Title - Centered */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <h2 className="text-2xl font-semibold text-[#0f172a]">Registration Waiver</h2>
              <p className="text-gray-500 mt-1">Review and sign required waivers</p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Dynamic Waiver Sections from API */}
          {pendingWaivers.length === 0 ? (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-center">
              <p className="text-blue-800 font-medium">No pending waivers found</p>
              <p className="text-blue-600 text-sm mt-2">All required waivers have been signed</p>
            </div>
          ) : (
            pendingWaivers.map((waiver) => (
              <div key={waiver.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-[#173151] mb-2">
                  {waiver.name || waiver.type}
                </h3>
                <div className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">
                  {waiver.content || "Please review and accept this waiver."}
                </div>
                <label className="flex items-center gap-3 text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptedWaivers[waiver.id] || false}
                    onChange={(e) => handleWaiverCheck(waiver.id, e.target.checked)}
                    className="w-5 h-5 text-[#173151] border-gray-300 rounded focus:ring-[#173151]"
                  />
                  <span className="font-medium">
                    I agree to the {waiver.name || waiver.type} terms
                  </span>
                </label>
              </div>
            ))
          )}

          {/* Signature Field */}
          <div className="mt-4">
            <label className="font-medium text-gray-700 mb-2 block">Signature</label>
            <input
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="Type your full name as signature"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#173151] bg-gray-50 outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 sm:gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-semibold shadow-md hover:bg-gray-300 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#173151] text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-semibold shadow-md hover:bg-[#1f3d67] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Signing..." : "Submit Waiver"}
            </button>
          </div>

        </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Waivers;
