import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useClass } from "../api/hooks/classes/useClass";
import { formatDateRange, formatSchedule } from "../utils/formatters";

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: classDetail,
    isLoading,
    isError,
  } = useClass({ classId: id ?? '' });

  const image = classDetail?.cover_photo_url || classDetail?.image_url;
  const scheduleLabel = formatSchedule(classDetail?.schedule);
  const dateLabel = formatDateRange(classDetail?.start_date, classDetail?.end_date);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] pb-12">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {isLoading && <p className="text-gray-600">Loading class details...</p>}
        {isError && (
          <p className="text-red-600">Unable to load this class. Please try again later.</p>
        )}

        {classDetail && (
          <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
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
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Investment</p>
                <p className="text-3xl font-bold text-[#173151]">
                  {classDetail.base_price ? `$${classDetail.base_price}` : 'Contact for pricing'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/checkout?classId=${classDetail.id}`)}
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
