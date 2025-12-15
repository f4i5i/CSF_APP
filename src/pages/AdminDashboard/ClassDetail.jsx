import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, User, MapPin } from "lucide-react";
import classesService from "../../api/services/classes.service";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

const IconClock = ({ className = "w-4 h-4 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6l4 2M12 3a9 9 0 110 18 9 9 0 010-18z"
    />
  </svg>
);

const IconCalendar = ({ className = "w-4 h-4 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export default function ClassDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const classId = searchParams.get('id');
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    } else {
      toast.error('No class ID provided');
      navigate('/class-list');
    }
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      const data = await classesService.getById(classId);
      setClassData(data);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
      toast.error('Failed to load class details');
      navigate('/class-list');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Check if user is logged in
    if (!user) {
      // Not logged in - save intended class and redirect to login
      sessionStorage.setItem('intendedClass', classId);
      toast('Please log in to register for this class');
      navigate('/login');
    } else {
      // Logged in - go to checkout
      navigate(`/checkout?classId=${classId}`);
    }
  };

  // Format schedule display
  const formatSchedule = (cls) => {
    if (!cls.weekdays || cls.weekdays.length === 0) {
      return 'Schedule TBD';
    }

    const days = cls.weekdays.map(day =>
      day.charAt(0).toUpperCase() + day.slice(1, 3)
    ).join(', ');

    const time = cls.start_time && cls.end_time
      ? `${cls.start_time} - ${cls.end_time}`
      : '';

    return `${days}${time ? ', ' + time : ''}`;
  };

  // Format dates display
  const formatDates = (cls) => {
    if (!cls.start_date || !cls.end_date) {
      return 'Dates TBD';
    }

    const start = new Date(cls.start_date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    const end = new Date(cls.end_date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]">
        <div className="text-text-muted">Loading class details...</div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-start justify-center sm:p-6 p-0 bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]">
      <div className="w-full max-w-[900px] bg-[#FFFFFF80] rounded-2xl p-4 md:p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6 bg-white px-4 rounded-xl">
          <div className="flex items-center gap-4 ">
            <Link
              to="/class-list"
              className="rounded-full p-2 hover:bg-white/60"
            >
              <ArrowLeft className="text-[#00000099]" />
            </Link>
            <h1 className="text-xl font-semibold font-manrope text-text-primary">
              Back to Available Classes
            </h1>
          </div>
          <img
            src="/images/logo.png"
            alt="logo"
            className="size-[80px] object-contain mix-blend-exclusion"
          />
        </div>

        <div className="col-span-2  rounded-lg py-6">
          <div className="flex flex-col md:flex-row items-start justify-center gap-4">
            <img
              src={classData.image_url || "/images/detail_page.png"}
              alt={classData.name}
              className="w-full sm:max-w-[327px] h-56 object-cover rounded-lg"
            />
            <div className="">
              <h2 className="sm:text-[30px] text-[22px] mt-3 font-bold font-manrope text-text-primary">
                {classData.name}
              </h2>
              <p className="mt-3 text-base leading-[28px] font-manrope text-text-muted">
                {classData.description || 'No description available'}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start gap-6 mt-6 w-full">
            <div className="flex flex-col items-start gap-4 w-full sm:max-w-[65%]">
              <div className=" w-full flex flex-col gap-4">
                {/* location card */}
                {classData.school && (
                  <div className="bg-[#FFFFFF80] rounded-[20px] w-full sm:min-h-[140px]">
                    <div className="flex items-center gap-4">
                      <div className="sm:w-[190px] w-[130px] h-full  rounded-lg overflow-hidden flex-shrink-0">
                        <iframe
                          title="location-map"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(classData.school.address || '')}&output=embed`}
                          className="w-full h-full border-0"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-full bg-[#fff6e0] flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-[#f1b500]" />
                          </div>
                          <h4 className="font-bold text-lg font-manrope text-text-primary">
                            Location
                          </h4>
                        </div>
                        <p className="sm:text-base text-xs leading-[30px] font-manrope text-text-muted mt-2">
                          {classData.school.name}
                          {classData.school.address && (
                            <>
                              <br />
                              {classData.school.address}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-[#FFFFFF80] rounded-[20px] w-full p-4 shadow-sm flex flex-col sm:flex-row gap-8">
                <div className="">
                  <h3 className="font-semibold font-manrope text-text-primary">
                    Day & Time
                  </h3>

                  <div className="flex items-center gap-2 mt-2 ">
                    <Clock className="w-4 h-4 text-gray-400 " />
                    <span className="text-text-muted text-[14px] font-manrope">
                      {formatSchedule(classData)}
                    </span>
                  </div>
                  <h5 className="font-semibold font-manrope text-text-primary mt-4">
                    Age Group
                  </h5>

                  <div className="flex items-center gap-2 mt-2 ">
                    <User className="w-4 h-4 text-gray-400 " />{" "}
                    <span className="text-text-muted font-manrope">
                      {classData.min_age || 0} - {classData.max_age || 18} Years Old
                    </span>
                  </div>
                </div>
                <div className="">
                  <h3 className="font-semibold font-manrope text-text-primary">
                    Dates{" "}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 ">
                    <IconCalendar />
                    <span className="text-text-muted text-[14px] font-manrope">
                      {formatDates(classData)}
                    </span>
                  </div>
                  {classData.coach && (
                    <>
                      <h5 className="font-semibold font-manrope text-text-primary mt-4">
                        Coach
                      </h5>

                      <div className="flex items-center gap-2 mt-2 ">
                        <span className="text-text-muted font-manrope">
                          {classData.coach.name || 'TBD'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <aside className="bg-[#FFFFFF80] rounded-[20px] p-6 flex flex-col w-full sm:max-w-[35%]">
              <div>
                <div className="flex justify-between items-center w-full">
                  <h4 className="font-bold text-lg font-manrope text-text-primary">
                    Total Price
                  </h4>
                  <div className="mt-2 text-[32px] font-semibold font-manrope">
                    ${classData.price || '0'}
                  </div>
                </div>
                <hr className="w-full border border-border-light my-2" />
                <ul className="mt-6 space-y-4 font-manrope text-sm text-text-muted">
                  <li className="font-manrope flex items-center gap-2">
                    <img src="/images/price_info.png" alt="" />
                    <span>Professional coaching</span>
                  </li>
                  <li className="font-manrope flex items-center gap-2">
                    <img src="/images/price_info.png" alt="" />
                    <span>Quality training equipment</span>
                  </li>
                  <li className="font-manrope flex items-center gap-2">
                    <img src="/images/price_info.png" alt="" />
                    <span>Safe and fun environment</span>
                  </li>
                </ul>
                {classData.capacity && classData.current_enrollment !== undefined && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{classData.current_enrollment}</span> / {classData.capacity} spots filled
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleRegister}
                  className="block w-full text-center px-4 py-3 bg-[#f1b500] hover:bg-[#e0a400] rounded-[12px] font-manrope font-semibold mt-[21px]"
                >
                  Register Now
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
