import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import Header from "../components/Header";
import { ArrowLeft } from "lucide-react";
import { useClass } from "../api/hooks/classes/useClass";
import { formatDateRange, formatSchedule } from "../utils/formatters";
import {
  getCapacityMeta,
  getCancellationSummary,
  getDirectRegistrationLink,
  getOfferingLabel,
  getOfferingType,
  getPriceModelLabel,
} from "../utils/classHelpers";

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const {
    data: classDetail,
    isLoading,
    isError,
  } = useClass({ classId: id ?? '' });

  const image = classDetail?.cover_photo_url || classDetail?.image_url;
  const scheduleLabel = formatSchedule(classDetail?.schedule);
  const dateLabel = formatDateRange(classDetail?.start_date, classDetail?.end_date);
  const offeringType = classDetail ? getOfferingType(classDetail) : 'unknown';
  const offeringLabel = getOfferingLabel(offeringType);
  const priceModel = getPriceModelLabel(classDetail, offeringType);
  const capacityMeta = getCapacityMeta(classDetail);
  const registrationLink = classDetail ? getDirectRegistrationLink(classDetail.id ?? id, classDetail) : '';
  const cancellationSummary = getCancellationSummary(classDetail);
  const priceLabel =
    classDetail?.price_display ||
    classDetail?.price_text ||
    (classDetail?.base_price ? `$${classDetail.base_price}` : 'Contact for pricing');
  const scheduleItems = classDetail?.schedule ?? [];

  const handleCopyLink = async () => {
    if (!registrationLink) return;
    try {
      await navigator.clipboard?.writeText(registrationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
  };

  const handleRegister = () => {
    if (!user) {
      sessionStorage.setItem('intendedClass', classDetail.id);
      toast('Please log in to register for this class');
      navigate('/login');
      return;
    }

    const userRole = user?.role?.toUpperCase();
    if (userRole !== 'PARENT') {
      toast.error('Only parents can register for classes');
      return;
    }

    navigate(`/checkout?classId=${classDetail.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] pb-12">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <button
          onClick={() => navigate('/class')}
          className="flex items-center gap-2 mb-6 text-[#173151] hover:text-[#F3BC48] transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to Classes</span>
        </button>
        {isLoading && <p className="text-gray-600">Loading class details...</p>}
        {isError && (
          <p className="text-red-600">Unable to load this class. Please try again later.</p>
        )}

        {classDetail && (
          <div className="rounded-3xl bg-white/80 p-6 shadow-lg space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                {image ? (
                  <img src={image} alt={classDetail.name} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center text-gray-400">
                    Class image coming soon
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">
                    {classDetail.program?.name || 'Program'}
                  </p>
                  <h1 className="text-3xl font-bold text-[#173151]">{classDetail.name}</h1>
                </div>
                <p className="text-gray-600">{classDetail.description}</p>

                <div className="grid gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-500">Location</p>
                    <p className="text-gray-800">{classDetail.location || 'To be announced'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">Schedule</p>
                    <p className="text-gray-800">{scheduleLabel}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">Dates</p>
                    <p className="text-gray-800">{dateLabel}</p>
                  </div>
                  {classDetail.min_age && classDetail.max_age && (
                    <div>
                      <p className="font-semibold text-gray-500">Age Group</p>
                      <p className="text-gray-800">
                        Ages {classDetail.min_age} – {classDetail.max_age}
                      </p>
                    </div>
                  )}
                  {offeringLabel && (
                    <div>
                      <p className="font-semibold text-gray-500">Program Type</p>
                      <p className="text-gray-800">{offeringLabel}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-gray-500">Schedule Recap</p>
                {scheduleItems.length > 0 ? (
                  <ul className="space-y-1 text-sm text-gray-700">
                    {scheduleItems.map((slot, index) => (
                      <li key={`${slot.day_of_week}-${slot.start_time}-${index}`}>
                        {formatSchedule([slot])}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Full schedule coming soon.</p>
                )}
              </div>

              {/* Capacity display removed per requirements */}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white/70 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-gray-500">Price & Membership</p>
                <p className="text-3xl font-bold text-[#173151]">{priceLabel}</p>
                <p className="text-sm text-gray-600">Price model: {priceModel}</p>
                {offeringLabel && (
                  <p className="text-sm text-gray-600">Billing type: {offeringLabel}</p>
                )}
              </div>

              <div className="rounded-2xl bg-white/70 p-6 space-y-3">
                <p className="text-sm uppercase tracking-wide text-gray-500">Direct registration link</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={registrationLink}
                    readOnly
                    className="flex-1 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="rounded-xl border border-[#173151] px-4 py-2 text-sm font-semibold text-[#173151]"
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Share this URL for direct registration.</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-6">
              <p className="text-sm uppercase tracking-wide text-gray-500">Cancellation policy</p>
              <p className="mt-2 text-gray-700">{cancellationSummary}</p>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Investment ({priceModel})</p>
                <p className="text-3xl font-bold text-[#173151]">{priceLabel}</p>
              </div>
              <button
                onClick={handleRegister}
                className="w-full rounded-full bg-[#F3BC48] px-8 py-3 font-semibold text-[#173151] shadow sm:w-auto"
              >
                Reserve Spot
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
