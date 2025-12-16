import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClassCard from "../components/ClassCard";
import { useClasses } from "../api/hooks/classes/useClasses";
import { formatDateRange, formatSchedule } from "../utils/formatters";
import {
  getCapacityMeta,
  getOfferingLabel,
  getOfferingType,
  getPriceModelLabel,
} from "../utils/classHelpers";

export default function Classes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: classes = [], isLoading, isError } = useClasses({
    filters: { is_active: true },
  });

  const mappedClasses = useMemo(() => {
    const value = search.toLowerCase();
    return classes
      .filter((cls) =>
        cls.name.toLowerCase().includes(value) ||
        cls.description?.toLowerCase().includes(value)
      )
      .map((cls) => {
        const capacityMeta = getCapacityMeta(cls);
        const offeringType = getOfferingType(cls);

        return {
          ...cls,
          title: cls.name,
          school: cls.school?.name || cls.location || "Location TBA",
          dates: formatDateRange(cls.start_date, cls.end_date),
          time: formatSchedule(cls.schedule),
          ages: cls.min_age && cls.max_age ? `Ages ${cls.min_age}–${cls.max_age}` : "All Ages",
          image: cls.cover_photo_url || cls.image_url,
          capacity: {
            filled: capacityMeta.current,
            total: capacityMeta.total,
          },
          hasCapacity: capacityMeta.hasCapacity,
          spotsRemaining: capacityMeta.availableSpots,
          waitlistCount: capacityMeta.waitlistCount,
          offeringType,
          badgeLabel: getOfferingLabel(offeringType),
          priceModel: getPriceModelLabel(cls, offeringType),
          priceLabel: cls.price_display || cls.price_text || (cls.base_price ? `$${cls.base_price}` : "Contact for pricing"),
        };
      });
  }, [classes, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] pb-10">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-[#173151]">Class Overview</h1>
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-700 shadow-sm sm:w-64"
          />
        </div>

        {isLoading && (
          <p className="mt-6 text-gray-600">Loading classes...</p>
        )}

        {isError && (
          <p className="mt-6 text-red-600">Unable to load classes right now.</p>
        )}

        {!isLoading && !isError && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {mappedClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onClick={() => navigate(`/class/${cls.id}`)}
                onRegister={() => navigate(`/checkout?classId=${cls.id}`)}
              />
            ))}
            {mappedClasses.length === 0 && (
              <p className="text-gray-500">No classes match your search.</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
