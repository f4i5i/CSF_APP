import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import areasService from "../../api/services/areas.service";
import toast from "react-hot-toast";
import DottedOverlay from "@/components/DottedOverlay";
import Footer from "@/components/Footer";
export default function Resgister() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch areas on mount
  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areasService.getAll();
      // Handle different response structures
      const areasList = Array.isArray(response)
        ? response
        : (response.items || response.data || []);
      setAreas(areasList);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
      toast.error('Failed to load areas');
      // Fallback to default areas if API fails
      setAreas([
        { id: "1", name: "Charlotte" },
        { id: "2", name: "Triangle" },
        { id: "3", name: "Greensboro" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = (areaId) => {
    // Navigate to class list with area filter
    navigate(`/class-list?area=${areaId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8] relative">
      {/* <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div> */}
      <DottedOverlay
        className="inset-x-6 inset-y-10 sm:inset-x-0 sm:inset-y-0"
      />
      <div className="w-full flex-grow flex items-center justify-center">
      <div className="w-full z-30 m-4 max-w-[790px] bg-[#FFFFFF80] rounded-3xl  pt-[30px] pb-[13px]">
        <div className="flex flex-col items-center gap-2">
          {/* <Logo /> */}
          <div className="isolation-auto" >
          <img
            src="/images/logo.png"
            alt="location"
            className="size-[140px]  object-contain 
          mix-blend-exclusion"
            style={{
              filter: 'brightness(0.2) contrast(1.5)',
              mixBlendMode: 'normal'
            }}
          />
          </div>

          <h1 className="text-[24px] md:text-[28px] font-kollektif font-normal text-text-primary">
            Carolina Soccer Factory
          </h1>
          <p className="text-base text-text-muted font-manrope">Choose Area:</p>
        </div>

        <div className="mt-8 m-3 flex flex-wrap gap-4 items-center justify-center">
          {loading ? (
            <div className="text-text-muted">Loading areas...</div>
          ) : (
            areas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleAreaClick(area.id)}
                className="flex flex-col items-center justify-center w-full md:max-w-[225px]  gap-3 bg-[#FFFFFF80] rounded-[20px] py-[52px] shadow-sm text-center hover:bg-white transition-colors"
              >
                <img
                  src="/images/location.png"
                  alt="location"
                  className="size-[20px] "
                />
                <span className="text-lg font-kollektif font-bold text-text-primary">
                  {area.name}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="mt-[70px] text-center">
          <p className="text-base text-text-muted font-manrope">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-btn-gold font-manrope"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
      </div>
      <Footer isFixed={false} />
    </div>
  );
}
