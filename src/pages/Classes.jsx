import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, MapPin, X } from "lucide-react";
import { useAuth } from "../context/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClassCard from "../components/ClassCard";
import { useClasses } from "../api/hooks/classes/useClasses";
import { useAreas } from "../api/hooks/classes/useAreas";
import { formatDateRange, formatSchedule } from "../utils/formatters";
import {
  getCapacityMeta,
  getOfferingLabel,
  getOfferingType,
  getPriceModelLabel,
} from "../utils/classHelpers";

export default function Classes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");

  // Build filters for API call
  const filters = useMemo(() => {
    const f = { is_active: true };
    if (selectedAreaId) f.area_id = selectedAreaId;
    if (search) f.search = search;
    return f;
  }, [selectedAreaId, search]);

  const { data: classes = [], isLoading, isError } = useClasses({ filters });
  const { data: areas = [] } = useAreas();

  const mappedClasses = useMemo(() => {
    return classes.map((cls) => {
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
  }, [classes]);

  const handleRegister = (classId) => {
    if (!user) {
      sessionStorage.setItem('intendedClass', classId);
      toast('Please log in to register for this class');
      navigate('/login');
      return;
    }

    const userRole = user?.role?.toUpperCase();
    if (userRole !== 'PARENT') {
      toast.error('Only parents can register for classes');
      return;
    }

    navigate(`/checkout?classId=${classId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] pb-10">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-[#173151]">Class Overview</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Area Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full appearance-none rounded-full border border-gray-200 bg-white/80 py-2 pl-9 pr-8 text-sm text-gray-700 shadow-sm sm:w-48"
              >
                <option value="">All Areas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
              {selectedAreaId && (
                <button
                  onClick={() => setSelectedAreaId("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white/80 py-2 pl-9 pr-4 text-sm text-gray-700 shadow-sm sm:w-64"
              />
            </div>
          </div>
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
                onRegister={() => handleRegister(cls.id)}
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
